#!/usr/bin/env node
/**
 * API tests for POST /api/subscribe against a running server.
 *
 *   npm run test:api                      # defaults to http://localhost:3000
 *   BASE=http://localhost:3031 npm run test:api
 *
 * ---------------------------------------------------------------------------
 * THIS WRITES TO THE LIVE CRM
 * ---------------------------------------------------------------------------
 * The happy-path cases create real contacts in GoHighLevel and fire the real
 * delivery webhook. Every address used is `+cocotest-<runid>@` so a run is
 * trivially searchable and deletable, and the run id makes each run distinct
 * so repeat runs don't collide with each other's idempotency state.
 *
 * Pass --dry to run only the cases that never reach the CRM (validation and
 * spam), which is safe to run anywhere.
 */

const BASE = process.env.BASE ?? "http://localhost:3000";
const DRY = process.argv.includes("--dry");

/** Distinct per run, so idempotency assertions aren't polluted by history. */
const RUN = Date.now().toString(36);
const addr = (label) => `qa+cocotest-${RUN}-${label}@example.com`;

/** Older than the server's MIN_FILL_MS so it isn't discarded as a bot. */
const humanTimestamp = () => Date.now() - 5000;

/*
  Each case gets its own synthetic client IP.

  The rate limiter is per-IP at 5/min, and this suite makes far more requests
  than that — without this every case after the fifth returns 429 and tests
  nothing. Giving each case a distinct IP exercises the real code path instead
  of the throttle.

  This works ONLY because nothing rewrites x-forwarded-for in front of a local
  server. On Vercel the platform overwrites it, so a real client cannot forge
  it — which is exactly the assumption documented in src/lib/rateLimit.ts.
  A self-hosted deployment behind a proxy that passes the header through
  WOULD be bypassable this way.
*/
let ipCounter = 0;
const nextIp = () => `203.0.113.${(ipCounter++ % 250) + 1}`;

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ok    ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}${detail ? `\n        ${detail}` : ""}`);
  }
}

async function post(body, init = {}) {
  const res = await fetch(`${BASE}/api/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": nextIp(),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, json };
}

const base = (over = {}) => ({
  email: addr("valid"),
  leadMagnet: "decode",
  consent: true,
  pagePath: "/decode",
  honeypot: "",
  formTimestamp: humanTimestamp(),
  attribution: {
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: `qa_${RUN}`,
    utmContent: "video_a",
    utmTerm: null,
    fbclid: `fbtest.${RUN}`,
    referrer: null,
    landingPage: "/decode",
  },
  ...over,
});

console.log(`\nPOST ${BASE}/api/subscribe`);
console.log(`run id: ${RUN}${DRY ? "  (dry — no CRM writes)" : ""}\n`);

/* ---------------------------------------------------------------------------
   Validation — must never reach the CRM
   --------------------------------------------------------------------------- */
console.log("validation");
{
  const r = await post(base({ email: "not-an-email" }));
  check(
    "malformed email -> 400 INVALID_EMAIL",
    r.status === 400 && r.json?.code === "INVALID_EMAIL",
    JSON.stringify(r),
  );
}
{
  const r = await post(base({ email: "" }));
  check(
    "empty email -> 400 INVALID_EMAIL",
    r.status === 400 && r.json?.code === "INVALID_EMAIL",
    JSON.stringify(r),
  );
}
{
  // 254 is the RFC cap; this is deliberately past it.
  const long = "a".repeat(250) + "@example.com";
  const r = await post(base({ email: long }));
  check(
    "over-length email -> 400 INVALID_EMAIL",
    r.status === 400 && r.json?.code === "INVALID_EMAIL",
    JSON.stringify(r),
  );
}
{
  const r = await post(base({ leadMagnet: "not-a-magnet" }));
  check(
    "unknown leadMagnet -> 400 BAD_REQUEST",
    r.status === 400 && r.json?.code === "BAD_REQUEST",
    JSON.stringify(r),
  );
}
{
  const r = await post(base({ leadMagnet: undefined }));
  check(
    "missing leadMagnet -> 400 BAD_REQUEST",
    r.status === 400 && r.json?.code === "BAD_REQUEST",
    JSON.stringify(r),
  );
}
{
  const r = await post("{ this is not json");
  check(
    "malformed JSON -> 400 BAD_REQUEST",
    r.status === 400 && r.json?.code === "BAD_REQUEST",
    JSON.stringify(r),
  );
}
{
  // Guards against an injected value reaching the CRM as a magnet.
  const r = await post(base({ leadMagnet: "decode; DROP" }));
  check(
    "leadMagnet is an allowlist, not a passthrough",
    r.status === 400,
    JSON.stringify(r),
  );
}

/* ---------------------------------------------------------------------------
   Spam — must look identical to success, but carry NO eventId
   --------------------------------------------------------------------------- */
console.log("\nspam handling");
{
  const r = await post(base({ honeypot: "http://spam.example" }));
  check(
    "honeypot -> 200 ok (bot is never told it failed)",
    r.status === 200 && r.json?.ok === true,
    JSON.stringify(r),
  );
  check(
    "honeypot -> NO eventId, so no phantom Pixel conversion",
    r.json?.eventId === undefined,
    `got eventId=${r.json?.eventId}`,
  );
}
{
  const r = await post(base({ formTimestamp: Date.now() }));
  check(
    "instant submit -> 200 ok",
    r.status === 200 && r.json?.ok === true,
    JSON.stringify(r),
  );
  check(
    "instant submit -> NO eventId",
    r.json?.eventId === undefined,
    `got eventId=${r.json?.eventId}`,
  );
}
{
  // A real visitor whose form never fired an interaction handler still has to
  // get through; the server only applies the window when a timestamp exists.
  const r = await post(base({ email: addr("nots"), formTimestamp: null }));
  if (DRY) {
    console.log("  skip  absent formTimestamp still succeeds (needs CRM)");
  } else {
    check(
      "absent formTimestamp is not treated as instant",
      r.status === 200 && typeof r.json?.eventId === "string",
      JSON.stringify(r),
    );
  }
}

/* ---------------------------------------------------------------------------
   Rate limiting — deliberately hammers ONE ip
   --------------------------------------------------------------------------- */
console.log("\nrate limiting");
{
  const ip = "198.51.100.7";
  const hit = () =>
    fetch(`${BASE}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      // Invalid on purpose: a 400 still counts against the limit, so the
      // throttle can be tripped without creating anything.
      body: JSON.stringify({ email: "not-an-email", leadMagnet: "decode" }),
    });

  const codes = [];
  for (let i = 0; i < 8; i++) codes.push((await hit()).status);

  check(
    "same ip is throttled to 429 within 8 attempts",
    codes.includes(429),
    `statuses: ${codes.join(",")}`,
  );

  const res = await hit();
  check(
    "429 carries Retry-After so the client can back off",
    res.status === 429 && !!res.headers.get("retry-after"),
    `status=${res.status} retry-after=${res.headers.get("retry-after")}`,
  );
}

if (DRY) {
  console.log(`\n${passed} passed, ${failed} failed (dry run)\n`);
  process.exit(failed ? 1 : 0);
}

/* ---------------------------------------------------------------------------
   Happy path + idempotency — these DO write to the CRM
   --------------------------------------------------------------------------- */
console.log("\nhappy path (writes to CRM)");

const shared = addr("shared");
let firstEventId = null;

{
  const r = await post(base({ email: shared, leadMagnet: "decode" }));
  firstEventId = r.json?.eventId ?? null;
  check(
    "valid decode submit -> 200 ok with eventId",
    r.status === 200 && r.json?.ok === true && typeof firstEventId === "string",
    JSON.stringify(r),
  );
  check(
    "eventId is a uuid (Pixel/CAPI dedupe key)",
    /^[0-9a-f-]{36}$/i.test(firstEventId ?? ""),
    `got ${firstEventId}`,
  );
}

console.log("\nidempotency");
{
  // Same (email, leadMagnet) pair — must not re-deliver.
  const r = await post(base({ email: shared, leadMagnet: "decode" }));
  check(
    "repeat same pair -> still 200 ok (never tell them they're subscribed)",
    r.status === 200 && r.json?.ok === true,
    JSON.stringify(r),
  );
  check(
    "repeat same pair -> a NEW eventId each time",
    typeof r.json?.eventId === "string" && r.json.eventId !== firstEventId,
    "a reused eventId would make Meta drop the second as a duplicate",
  );
}
{
  // DIFFERENT magnet, same person — MUST deliver. This is the case
  // "Contact Created" gets wrong, and the one that silently loses the
  // second guide for a returning subscriber.
  const r = await post(
    base({ email: shared, leadMagnet: "vetbill", pagePath: "/vetbill" }),
  );
  check(
    "same email, different magnet -> 200 ok (second guide must deliver)",
    r.status === 200 && r.json?.ok === true && typeof r.json?.eventId === "string",
    JSON.stringify(r),
  );
}
{
  const r = await post(
    base({ email: addr("news"), leadMagnet: "newsletter", pagePath: "/" }),
  );
  check(
    "newsletter submit -> 200 ok",
    r.status === 200 && r.json?.ok === true,
    JSON.stringify(r),
  );
}
{
  // Consent false must still capture the lead — it only gates tracking.
  const r = await post(base({ email: addr("noconsent"), consent: false }));
  check(
    "consent:false still captures the lead (it only gates Pixel/CAPI)",
    r.status === 200 && r.json?.ok === true,
    JSON.stringify(r),
  );
}

console.log(`\ncontacts created under: qa+cocotest-${RUN}-*@example.com`);
console.log(`${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
