/**
 * CRM integration tests — the assertions that need to READ GoHighLevel back.
 *
 * ---------------------------------------------------------------------------
 * Why this is separate from `npm run test:api`
 * ---------------------------------------------------------------------------
 * test-api.mjs asserts what the HTTP boundary does: status codes, error codes,
 * validation, rate limiting. It never looks inside GHL, so it passes happily
 * while the data landing in the CRM is wrong.
 *
 * Both bugs below were live, both were silent data loss, and both returned a
 * clean 200 to the browser:
 *
 *   1. FIRST-TOUCH ATTRIBUTION. `lead_magnet` records which guide acquired
 *      someone. The check for "have they been here before?" used GHL's
 *      `?query=` search endpoint, which is an index that LAGS writes — so a
 *      second submission moments after the first looked brand new and
 *      overwrote the attribution. Now keyed off the upsert response's own
 *      `new` flag instead. See the ordering note in src/lib/crm/ghl.ts.
 *
 *   2. PHONE DEDUPE. GHL deduplicates contacts on phone number, so two
 *      subscribers sharing a household or work number collapsed into ONE
 *      record and the later email overwrote the earlier — the first person
 *      silently stopped receiving anything. The number now goes to the
 *      `phone_number` custom field and never to GHL's native `phone`.
 *
 * Neither is expressible as a status-code assertion, which is exactly why
 * they survived a green test suite. They live here.
 *
 * ---------------------------------------------------------------------------
 * Running it
 * ---------------------------------------------------------------------------
 *   npm run test:crm                 # against localhost:3000
 *   npm run test:crm -- --base=http://localhost:3055
 *
 * Needs a running server plus real GHL credentials in .env.local. It WRITES
 * real contacts, so every address is `qa-crm-<timestamp>-*@example.com` —
 * example.com is reserved by RFC 2606 and cannot receive mail, so nothing is
 * ever delivered to a real person. Filter on `qa-crm-` in GHL to clean up.
 *
 * Slower than test:api by design: GHL's search index has to catch up before
 * the contact can be found by email, so each lookup retries with a backoff.

 * ---------------------------------------------------------------------------
 * CLEAN UP AFTER YOURSELF
 * ---------------------------------------------------------------------------
 * This writes real contacts to the live sub-account. When you are done:
 *
 *   npm run cleanup:qa              # dry run, lists what it would remove
 *   npm run cleanup:qa -- --delete
 *
 * 155 QA contacts had accumulated before that script existed, against one real
 * one. A CRM full of test rows makes a genuine problem easy to miss.
 * */
import { readFileSync } from "node:fs";

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
const ENV_FILE = new URL("../.env.local", import.meta.url);

/* Load credentials WITHOUT printing them. Never log a value from here. */
try {
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("Cannot read .env.local — this suite needs real GHL credentials.");
  process.exit(1);
}

const KEY = process.env.GHL_API_KEY;
const LOC = process.env.GHL_LOCATION_ID;
if (!KEY || !LOC) {
  console.error("Missing GHL_API_KEY or GHL_LOCATION_ID.");
  process.exit(1);
}

const API = "https://services.leadconnectorhq.com";
const H = { Authorization: `Bearer ${KEY}`, Version: "2021-07-28", Accept: "application/json" };
/* -------------------------------------------------------------------------
   SEND GUARD — read this before removing it
   -------------------------------------------------------------------------
   Since delivery moved to a Contact Tag trigger (2026-09-09), applying
   `lead-magnet-*` IS the delivery. So every happy-path case in this file now
   causes GoHighLevel to actually send a guide email.

   The addresses are all @example.com, which is reserved by RFC 2606 and has
   no MX record. That means the sends do not reach a person — they HARD BOUNCE.
   A run of this suite is therefore a burst of hard bounces from a sending
   domain that is days old and has already had a forward test land in spam.

   Hard bounces are the single fastest way to wreck a young domain's
   reputation, and the entire launch rests on the delivery email working. Which
   makes casually running this suite the day before launch a genuinely
   expensive mistake, and one with no visible symptom until sends start
   failing.

   Hence the guard. To run the CRM-writing cases you must opt in:

     ALLOW_CRM_SENDS=1 npm run test:api
     ALLOW_CRM_SENDS=1 npm run test:crm

   Better options in most situations:
     - this suite has no dry mode — reading GHL back is its whole purpose.
     - Suppress or pause the delivery workflows in GHL for the duration.
     - Point the suites at a seed address you control that can actually
       receive, instead of example.com.

   Do not delete this guard to make CI green. Set the variable in the place
   that genuinely wants sends.
   ------------------------------------------------------------------------- */
if (process.env.ALLOW_CRM_SENDS !== "1") {
  console.error(
    "\nRefusing to run CRM-writing cases.\n\n" +
      "Delivery now triggers on the lead-magnet-* tag, so these cases make GHL\n" +
      "send real guide emails to @example.com addresses, which hard bounce and\n" +
      "damage a sending domain that is only days old.\n\n" +
      "  Safe:      npm run test:api -- --dry (different suite)\n" +
      "  Intended:  ALLOW_CRM_SENDS=1 npm run test:crm\n",
  );
  process.exit(2);
}

const RUN = Date.now();
const addr = (s) => `qa-crm-${RUN}-${s}@example.com`;

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

/* ---------------------------------------------------------------- helpers */

/** Resolve field key -> id once, the same way the app does. */
const FIELDS = await (async () => {
  const res = await fetch(`${API}/locations/${LOC}/customFields`, { headers: H, cache: "no-store" });
  if (!res.ok) {
    console.error(`Cannot read customFields (${res.status}) — check the token's scopes.`);
    process.exit(1);
  }
  const { customFields = [] } = await res.json();
  const m = {};
  for (const f of customFields) m[f.fieldKey.replace(/^contact\./, "")] = f.id;
  return m;
})();

async function submit(body, ip) {
  /*
    Per-case synthetic IP: the rate limiter is real and shared, so without
    this the later cases in a run get throttled and report false failures.

    `formTimestamp` is backdated past the min-dwell spam check. The key name
    matters: this said `ts`, which the server ignores entirely, so the check
    was being skipped rather than satisfied (an ABSENT timestamp short-circuits
    it). Anyone later tightening that check would have had three CRM tests
    silently asserting against contacts that were never created.
  */
  const res = await fetch(`${BASE}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({
      consent: true,
      pagePath: "/decode",
      formTimestamp: Date.now() - 9000,
      ...body,
    }),
  });
  return res.status;
}

/**
 * Find contacts by exact email.
 *
 * Retries because `?query=` is an index that lags writes — the very lag that
 * caused bug (1). Reads of a KNOWN id don't need this; only discovery does.
 */
async function findAll(email, tries = 20) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(
      `${API}/contacts/?locationId=${LOC}&query=${encodeURIComponent(email)}&limit=20`,
      { headers: H, cache: "no-store" },
    );
    if (res.ok) {
      const { contacts = [] } = await res.json();
      const hits = contacts.filter((c) => c.email?.toLowerCase() === email.toLowerCase());
      if (hits.length) return hits;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return [];
}

/** Read by id — strongly consistent, unlike the search above. */
async function read(id) {
  const res = await fetch(`${API}/contacts/${id}`, { headers: H, cache: "no-store" });
  if (!res.ok) throw new Error(`read ${res.status}`);
  const { contact } = await res.json();
  const cf = {};
  for (const f of contact.customFields ?? []) cf[f.id] = f.value;
  return { contact, cf };
}

const MAGNET_VALUE = { decode: "Decode", vetbill: "VetBill", newsletter: "Newsletter" };

/* ------------------------------------------------- 1. first-touch attribution */

console.log("\nFirst-touch attribution (two magnets, submitted back-to-back)");

const SEQUENCES = [
  ["decode then vetbill", "decode", "vetbill"],
  ["vetbill then decode", "vetbill", "decode"],
  ["newsletter then decode", "newsletter", "decode"],
];

for (const [i, [label, first, second]] of SEQUENCES.entries()) {
  const email = addr(`ft${i}`);
  const ip = `203.0.113.${40 + i}`;
  const named = (m) => (m === "newsletter" ? {} : { firstName: "Ft", lastName: "Check" });

  /*
    NO delay between these two. That is the regression condition: the second
    submit lands well inside the search index's lag window, so anything that
    asks the index "did this contact exist?" gets told no.
  */
  const s1 = await submit({ email, leadMagnet: first, ...named(first) }, ip);
  const s2 = await submit({ email, leadMagnet: second, ...named(second) }, ip);

  if (s1 !== 200 || s2 !== 200) {
    check(false, `${label} submitted cleanly`, `got ${s1} then ${s2}`);
    continue;
  }

  const hits = await findAll(email);
  if (hits.length !== 1) {
    check(false, `${label} produced one contact`, `got ${hits.length}`);
    continue;
  }

  const { contact, cf } = await read(hits[0].id);
  const got = cf[FIELDS.lead_magnet] ?? "unset";
  const want = MAGNET_VALUE[first];

  check(got === want, `${label} -> lead_magnet stays "${want}"`, `got "${got}"`);

  // The tags carry the full set; the field carries only the first.
  const tags = contact.tags ?? [];
  check(
    tags.includes(`lead-magnet-${first}`) && tags.includes(`lead-magnet-${second}`),
    `${label} -> both lead-magnet tags present`,
    `tags: ${tags.join(", ") || "none"}`,
  );
}

/* --------------------------------------------------------- 2. phone routing */

console.log("\nPhone routing (one number, two different people)");

const SHARED = "(555) 314-1592";
const pa = addr("phone-a");
const pb = addr("phone-b");

const ps1 = await submit(
  { email: pa, phone: SHARED, leadMagnet: "decode", firstName: "Phone", lastName: "Probe" },
  "203.0.113.71",
);
const ps2 = await submit(
  { email: pb, phone: SHARED, leadMagnet: "decode", firstName: "Phone", lastName: "Probe" },
  "203.0.113.72",
);

if (ps1 !== 200 || ps2 !== 200) {
  check(false, "both shared-phone submits succeeded", `got ${ps1} then ${ps2}`);
} else {
  const seen = new Set();

  for (const [label, email] of [["a", pa], ["b", pb]]) {
    const hits = await findAll(email);
    if (hits.length !== 1) {
      check(false, `contact ${label} exists exactly once`, `got ${hits.length}`);
      continue;
    }
    seen.add(hits[0].id);

    const { contact, cf } = await read(hits[0].id);

    check(
      contact.email?.toLowerCase() === email.toLowerCase(),
      `contact ${label} kept its own email address`,
      `got ${contact.email}`,
    );
    check(
      !!cf[FIELDS.phone_number],
      `contact ${label} has the number in the phone_number custom field`,
      "field is empty",
    );
    /*
      The decisive one. A non-null native phone means the dedupe surface is
      back and a shared number will merge two subscribers again.
    */
    check(
      (contact.phone ?? null) === null,
      `contact ${label} left GHL's native phone empty`,
      `leaked: ${contact.phone}`,
    );
  }

  check(
    seen.size === 2,
    "a shared number produced TWO separate contacts, not a merge",
    `distinct ids: ${seen.size}`,
  );
}

/* ------------------------- 3. attribution on a PRE-EXISTING, unattributed contact */

console.log("\nFirst touch on a contact that already existed for another reason");

/*
  The narrow-miss case.

  "First touch" is NOT the same as "GHL created the record on this call".
  Someone can already be a contact without ever having taken a guide — they
  used the contact form, they were imported, or someone added them by hand in
  the GHL UI. Their first actual guide is still the magnet that acquired them.

  A version of this keyed attribution purely off the upsert's `new` flag, which
  meant every one of those people ended up with `lead_magnet` blank forever.
  The tag test is what catches it, and it's safe now only because the tags are
  read by id rather than through the lagging search index.

  Sequence: contact form first (creates the record, tagged `contact-form` and
  nothing else), then a Decode submit. lead_magnet must become "Decode".
*/
{
  const email = addr("preexisting");
  const ip = "203.0.113.80";

  const enquiry = await fetch(`${BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({
      name: "Prior Enquirer",
      email,
      message: "Asking a question before ever taking a guide.",
      pagePath: "/contact",
      formTimestamp: Date.now() - 9000,
    }),
  });

  if (enquiry.status !== 200) {
    check(false, "contact-form enquiry created the record", `got ${enquiry.status}`);
  } else {
    const guide = await submit(
      { email, leadMagnet: "decode", firstName: "Prior", lastName: "Enquirer" },
      ip,
    );

    if (guide !== 200) {
      check(false, "later guide submit succeeded", `got ${guide}`);
    } else {
      const hits = await findAll(email);
      if (hits.length !== 1) {
        check(false, "pre-existing contact stayed a single record", `got ${hits.length}`);
      } else {
        const { contact, cf } = await read(hits[0].id);
        const got = cf[FIELDS.lead_magnet] ?? "unset";

        check(
          got === "Decode",
          'pre-existing contact -> lead_magnet becomes "Decode", not blank',
          `got "${got}"`,
        );
        // And the enquiry's own tag must survive the guide submit.
        check(
          (contact.tags ?? []).includes("contact-form"),
          "pre-existing contact kept its contact-form tag",
          `tags: ${(contact.tags ?? []).join(", ") || "none"}`,
        );
      }
    }
  }
}

/* ------------------------------------------- 4. landing_page can't go off-site */

console.log("\nPath sanitising (landing_page must stay same-origin)");

/*
  `pagePath` arrives from the browser and fills `landing_page`, and it also
  builds the absolute event_source_url sent to Meta.

  The inputs below all defeated the FIRST version of safePath(), which only
  inspected the input string. `new URL()` collapses `..` at the root and can
  MANUFACTURE a protocol-relative path out of an input that passed every
  prefix check, so `/..//evil.example` resolved to `//evil.example` and
  escaped the origin entirely. The guard now runs on the resolved pathname.

  Asserted here rather than as a unit test because this is the only place the
  sanitised value is observable end to end — what actually reaches the CRM.
*/
const HOSTILE = [
  ["collapsing .. at the root", "/..//evil.example/phish?x=1"],
  [".. after a segment", "/x/..//evil.example"],
  ["protocol-relative outright", "//evil.example"],
  ["backslash variant", "/\\evil.example"],
];

for (const [i, [label, hostile]] of HOSTILE.entries()) {
  const email = addr(`path${i}`);
  const status = await submit(
    { email, leadMagnet: "decode", firstName: "Path", pagePath: hostile },
    `203.0.113.${90 + i}`,
  );

  if (status !== 200) {
    check(false, `${label} still accepted the lead`, `got ${status}`);
    continue;
  }

  const hits = await findAll(email);
  if (hits.length !== 1) {
    check(false, `${label} produced one contact`, `got ${hits.length}`);
    continue;
  }

  const { cf } = await read(hits[0].id);
  const landed = cf[FIELDS.landing_page] ?? "";

  /*
    The value must not name another host. A rejected path becomes "/", and a
    harmless same-origin 404 (the percent-encoded forms) is fine too — what
    must never appear is `evil.example`, however it got there.
  */
  check(
    !landed.includes("evil.example") && !landed.startsWith("//"),
    `${label} -> landing_page stayed same-origin`,
    `landed: ${JSON.stringify(landed)}`,
  );
}

/* ------------------------------------------------------------------ report */

console.log(`\n${pass} passed, ${fail} failed`);
console.log(`contacts written under: qa-crm-${RUN}-*@example.com`);
process.exit(fail === 0 ? 0 : 1);
