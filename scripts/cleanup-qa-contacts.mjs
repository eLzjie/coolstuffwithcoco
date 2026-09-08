#!/usr/bin/env node
/**
 * Deletes the contacts the test suites create in GoHighLevel.
 *
 *   npm run cleanup:qa              # DRY RUN — lists what it would delete
 *   npm run cleanup:qa -- --delete  # actually deletes
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * `test:api` and `test:crm` write to the LIVE sub-account, because that's the
 * only way to assert what actually reaches the CRM — which is the whole reason
 * test:crm exists. The cost is real contacts accumulating on every run.
 *
 * That got away from us: 155 QA contacts were sitting in the location before
 * this script was written, against one real one. A CRM full of
 * `qa-crm-…@example.com` makes the account hard to read, and worse, it makes a
 * genuine problem easy to miss in the noise.
 *
 * So: run this after a test session. Every run of the suites prints the
 * address prefix it used, and this cleans up all of them.
 *
 * ---------------------------------------------------------------------------
 * SAFETY — two conditions, both required
 * ---------------------------------------------------------------------------
 *  1. The address must end in `@example.com`. That domain is reserved by
 *     RFC 2606 and can never receive mail, so no real subscriber lives there.
 *  2. The local part must start with a known test prefix.
 *
 * BOTH, not either. Anything failing one is reported as SKIPPED and left
 * alone. A real contact must never be deletable by this script — if you find
 * yourself loosening either rule, stop.
 *
 * Dry run is the default for the same reason. Deletion is not reversible and
 * GHL has no undo.
 *
 * Note the search index lags deletes, so a second run can still list rows that
 * are already gone — those come back as failed 404s. Run it twice and compare;
 * "matched 0" is the real all-clear.
 */
import { readFileSync } from "node:fs";

const DO_DELETE = process.argv.includes("--delete");
const ENV_FILE = new URL("../.env.local", import.meta.url);

/* Credentials are read but never printed. Don't add a log line here. */
try {
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("Cannot read .env.local — this needs real GHL credentials.");
  process.exit(1);
}

const KEY = process.env.GHL_API_KEY;
const LOC = process.env.GHL_LOCATION_ID;
if (!KEY || !LOC) {
  console.error("Missing GHL_API_KEY or GHL_LOCATION_ID.");
  process.exit(1);
}

const API = "https://services.leadconnectorhq.com";
const H = {
  Authorization: `Bearer ${KEY}`,
  Version: "2021-07-28",
  Accept: "application/json",
};

/**
 * Local-part prefixes the suites and one-off probes have used.
 *
 * Add to this when you add a suite. `addr()` in each script is where the
 * prefix is defined.
 */
const TEST_PREFIXES = [
  "qa-cocotest-", // scripts/test-api.mjs
  "qa+cocotest-", // ditto, before the switch to hyphens
  "qa-crm-", // scripts/test-crm.mjs
  "qa-diag-", // one-off production diagnostics
  "qa-firsttouch-",
  "qa-phone-",
  "qa-dwell-",
  "qa-dwell2-",
  "qa-hp-",
  "qa-ok-",
  "qa-cd-",
  "qa-cok-",
  "direct-probe-",
  "upsert-probe-",
  "phone-probe-",
  "probe-",
];

function isTestContact(email) {
  if (!email) return false;
  const e = email.toLowerCase();
  if (!e.endsWith("@example.com")) return false; // rule 1
  const local = e.slice(0, e.indexOf("@"));
  return TEST_PREFIXES.some((p) => local.startsWith(p.toLowerCase())); // rule 2
}

/** Pages the whole location rather than guessing search terms. */
async function* allContacts() {
  let page = 1;
  for (;;) {
    const res = await fetch(
      `${API}/contacts/?locationId=${LOC}&limit=100&page=${page}`,
      { headers: H, cache: "no-store" },
    );
    if (!res.ok) {
      console.error(`list page ${page} -> ${res.status}`);
      return;
    }
    const { contacts = [] } = await res.json();
    if (contacts.length === 0) return;
    for (const c of contacts) yield c;
    if (contacts.length < 100) return;
    page += 1;
    if (page > 60) return; // hard stop against a pagination bug looping forever
  }
}

const targets = [];
const skipped = [];
let total = 0;

for await (const c of allContacts()) {
  total += 1;
  if (isTestContact(c.email)) targets.push(c);
  else if ((c.email ?? "").toLowerCase().includes("example.com")) {
    skipped.push(c.email);
  }
}

console.log(`\nscanned ${total} contacts`);
console.log(`matched ${targets.length} QA contacts`);

if (skipped.length) {
  /*
    An example.com address that ISN'T matched is usually a probe written with a
    prefix nobody added to the list above. Worth surfacing rather than silently
    leaving behind.
  */
  console.log(`\nexample.com addresses with no known test prefix — left alone:`);
  for (const e of skipped) console.log(`  SKIPPED  ${e}`);
  console.log(`  (add the prefix to TEST_PREFIXES if these are yours)`);
}

if (targets.length === 0) {
  console.log("\nnothing to do.");
  process.exit(0);
}

console.log("");
for (const c of targets.slice(0, 15)) {
  console.log(`  ${DO_DELETE ? "deleting" : "would delete"}  ${c.email}`);
}
if (targets.length > 15) console.log(`  … and ${targets.length - 15} more`);

if (!DO_DELETE) {
  console.log("\nDRY RUN — nothing deleted. Re-run with -- --delete.");
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (const c of targets) {
  const res = await fetch(`${API}/contacts/${c.id}`, {
    method: "DELETE",
    headers: H,
  });
  if (res.ok) ok += 1;
  else {
    failed += 1;
    // A 404 here is almost always the search index still listing a deleted row.
    console.error(`  FAILED ${c.email} -> ${res.status}`);
  }
}

console.log(`\ndeleted ${ok}, failed ${failed}`);
console.log("Run again — 'matched 0' is the all-clear (the index lags deletes).");
process.exit(0);
