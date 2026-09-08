#!/usr/bin/env node
/**
 * Verifies the Google tag markup in the RENDERED page.
 *
 *   NEXT_PUBLIC_GA4_ID=G-… NEXT_PUBLIC_GTM_ID=GTM-… npm run build
 *   npm run check:tags -- --base=http://localhost:3080
 *
 * ---------------------------------------------------------------------------
 * Why check the output rather than unit-test the components
 * ---------------------------------------------------------------------------
 * Everything that can go wrong here goes wrong in the ASSEMBLED document, not
 * in a function:
 *
 *   - A second GA4 loader double-counts every hit, silently.
 *   - A consent default that lands after the tag initialises applies to
 *     nothing, silently.
 *   - `send_page_view` reverting to its default double-counts page views
 *     against AnalyticsBoot, silently.
 *
 * None of those raise an error anywhere. They surface weeks later as numbers
 * that are wrong in a direction nobody questions, which is why this asserts on
 * the real HTML.
 *
 * ---------------------------------------------------------------------------
 * A PRELOAD LINK IS NOT A LOADER — the trap this script exists to avoid
 * ---------------------------------------------------------------------------
 * Next emits `<link rel="preload" as="script" href=".../gtag/js?id=…">` in the
 * head, well before the consent block. Counting raw `gtag/js` occurrences
 * therefore reports two loaders and an ordering violation, and both readings
 * are wrong: a preload fetches without executing.
 *
 * Likewise, React serialises the component tree into the RSC flight payload
 * (`self.__next_f.push`), so every inline script appears TWICE in the HTML —
 * once as a real `<script>` and once as escaped data that is never executed.
 *
 * So the assertions below deliberately distinguish real, executing inline
 * scripts from preloads and from flight-payload copies. Getting that wrong is
 * what makes this check look broken when the page is fine.
 *
 * ---------------------------------------------------------------------------
 * THE TWO STRATEGIES SHIP DIFFERENTLY, SO THEY'RE ASSERTED DIFFERENTLY
 * ---------------------------------------------------------------------------
 * `beforeInteractive` (the consent default) IS in the initial HTML as a real
 * inline `<script>`. It can be asserted directly, and it must be — its whole
 * purpose is running before anything else.
 *
 * `afterInteractive` (both loaders) is NOT in the initial HTML. Next injects
 * those client-side after hydration, so server-rendered markup contains only
 * a preload link and the flight-payload declaration. Asserting on an executing
 * `<script src>` for them finds nothing, which is correct output being read
 * wrongly — the first version of this script did exactly that.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS CANNOT CHECK
 * ---------------------------------------------------------------------------
 * The likeliest cause of double-counted GA4 is a GA4 Configuration tag added
 * inside the GTM container. That lives in Google's UI, not in this repo, and
 * NO amount of markup inspection will reveal it. This script verifies that OUR
 * side emits exactly one GA4 loader; the container is a discipline, documented
 * in components/analytics/Tags.tsx. Verify it in GTM Preview or by watching
 * for duplicate page_view hits in GA4 Realtime.
 */

/**
 * Target base URL.
 *
 * Accepts `--base=<url>` as well as the BASE env var, and the flag exists for
 * a specific reason: this project is developed on Windows/PowerShell, where
 * the POSIX `BASE=... npm run x` form is a syntax error —
 *
 *   BASE=https://example.com : The term 'BASE=https://example.com' is not
 *   recognized as the name of a cmdlet...
 *
 * The PowerShell equivalent is `$env:BASE="..."; npm run x`, which also leaks
 * the variable into the rest of the shell session. A flag works identically in
 * bash, PowerShell and cmd, and doesn't persist:
 *
 *   npm run <script> -- --base=https://www.coolstuffwithcoco.com
 *
 * Precedence: flag, then env var, then the local default.
 */
function resolveBase() {
  const flag = process.argv.find((a) => a.startsWith("--base="));
  if (flag) return flag.slice("--base=".length).replace(/\/$/, "");
  if (process.env.BASE) return process.env.BASE.replace(/\/$/, "");
  return "http://localhost:3000";
}

const BASE = resolveBase();
/*
  `--no-tags` asserts the opposite: that NOTHING renders. Same shell-portability
  reason as --base. EXPECT_TAGS=0 still works.
*/
const EXPECT_TAGS =
  !process.argv.includes("--no-tags") && process.env.EXPECT_TAGS !== "0";

let pass = 0;
let fail = 0;
function check(ok, label, detail) {
  if (ok) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const res = await fetch(BASE, { cache: "no-store" });
if (!res.ok) {
  console.error(`Cannot fetch ${BASE} (${res.status}). Is the server running?`);
  process.exit(1);
}
const html = await res.text();

/* ------------------------------------------------------------------ helpers */

/** Byte ranges of every real `<script>…</script>` body in the document. */
function inlineScriptBodies() {
  const out = [];
  const re = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    out.push({ start: m.index, body: m[1] });
  }
  return out;
}

const SCRIPTS = inlineScriptBodies();

/** True when `needle` appears in a real inline script that is NOT flight data. */
function inExecutingScript(needle) {
  return SCRIPTS.some(
    (s) => s.body.includes(needle) && !s.body.includes("__next_f.push"),
  );
}

/** Document offset of the first executing inline script containing `needle`. */
function executingScriptOffset(needle) {
  const hit = SCRIPTS.find(
    (s) => s.body.includes(needle) && !s.body.includes("__next_f.push"),
  );
  return hit ? hit.start : -1;
}

/**
 * How many distinct GA4 measurement ids the page is wired to load.
 *
 * Counted from the preload links Next emits for `afterInteractive` scripts,
 * because the loader `<script>` itself is injected client-side and isn't in
 * this HTML at all. One preload per declared loader, so two ids or two
 * loaders for one id both show up here — which is the double-count this is
 * looking for on our side of the fence.
 */
function declaredGa4Loaders() {
  const re = /<link[^>]*\srel="preload"[^>]*googletagmanager\.com\/gtag\/js\?id=([^"&]+)/g;
  const ids = [];
  let m;
  while ((m = re.exec(html))) ids.push(m[1]);
  return ids;
}

/* ------------------------------------------------------------------- checks */

console.log(`\nGoogle tag markup at ${BASE}`);
console.log(EXPECT_TAGS ? "expecting tags to be present\n" : "expecting NO tags (ids unset)\n");

if (!EXPECT_TAGS) {
  /*
    The unset case is worth asserting explicitly: it's what keeps local, preview
    and test-suite traffic out of the single production property, and a
    regression there is invisible until the reports are already polluted.
  */
  check(
    !/googletagmanager\.com/.test(html),
    "no googletagmanager reference anywhere when ids are unset",
  );
  check(
    !inExecutingScript("wait_for_update"),
    "no consent-default script when no tag will load",
  );
} else {
  // --- GA4 -----------------------------------------------------------------
  const loaderIds = declaredGa4Loaders();
  check(
    loaderIds.length === 1,
    "exactly ONE GA4 loader declared on our side",
    `found ${loaderIds.length}: ${loaderIds.join(", ") || "none"}`,
  );
  check(
    new Set(loaderIds).size === loaderIds.length,
    "no measurement id is loaded twice",
    loaderIds.join(", "),
  );

  /*
    The config call is declared for client injection, so it lives in the flight
    payload rather than an executing script — matched against the whole
    document for that reason.
  */
  const configCount = (html.match(/gtag\(.config./g) ?? []).length;
  check(configCount === 1, "exactly ONE gtag config call declared", `found ${configCount}`);

  /*
    AnalyticsBoot fires page_view on every pathname change. If the config tag
    also sends one on load, the first page view of every session is counted
    twice — and only the first, which makes it look like a data quirk rather
    than a bug.
  */
  check(
    /send_page_view/.test(html),
    "config disables its own page_view (AnalyticsBoot owns it)",
  );

  // --- Consent Mode v2 -----------------------------------------------------
  check(
    inExecutingScript("wait_for_update"),
    "consent default is a REAL inline script, not just flight data",
  );
  for (const signal of [
    "analytics_storage",
    "ad_storage",
    "ad_user_data",
    "ad_personalization",
  ]) {
    check(inExecutingScript(signal), `consent default sets ${signal}`);
  }
  check(
    inExecutingScript("coco_consent_v1"),
    "consent default reads our own stored consent, not just hardcoded grants",
  );

  /*
    Ordering is guaranteed by STRATEGY here, not by document position, so
    that's what gets asserted.

    The consent block is `beforeInteractive` — in the initial HTML, executed
    during parse. The loaders are `afterInteractive` — injected only after
    hydration. So consent necessarily runs first, and comparing byte offsets
    against the head's preload link (which appears earlier but executes never)
    would report a violation that doesn't exist.

    What's worth pinning is that consent really is the early-strategy script
    and the loaders really aren't, because swapping either strategy silently
    destroys the ordering.
  */
  check(
    executingScriptOffset("wait_for_update") >= 0,
    "consent default ships as an early inline script (beforeInteractive)",
  );
  check(
    !SCRIPTS.some(
      (x) =>
        /googletagmanager\.com\/gtag\/js/.test(x.body) &&
        !x.body.includes("__next_f.push"),
    ),
    "GA4 loader is deferred, not inlined ahead of consent",
  );

  // --- GTM -----------------------------------------------------------------
  check(/gtm\.js\?id=|'gtm\.start'/.test(html), "GTM loader present");
  check(
    /googletagmanager\.com\/ns\.html\?id=/.test(html),
    "GTM noscript iframe present",
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
