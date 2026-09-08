#!/usr/bin/env node
/**
 * Self-check for traffic_source derivation.
 *
 *   npm run test:traffic
 *
 * Worth a test because the ordering is load-bearing: if paid doesn't beat
 * Organic, paid traffic from an unnamed channel books itself as Organic and
 * corrupts the Decode-vs-VetBill channel comparison the field exists for.
 * That failure is invisible in the UI and only shows up as a wrong report.
 *
 * Mirrors src/lib/trafficSource.ts. Kept as plain JS so it runs with no build
 * step; if the source changes, change both.
 */

import assert from "node:assert/strict";

const TRAFFIC_SOURCE = {
  meta: "Meta",
  pinterest: "Pinterest",
  organic: "Organic",
  direct: "Direct",
  paidOther: "Paid — Other",
  referral: "Referral",
};

const META_SOURCES = new Set(["meta", "facebook", "fb", "ig", "instagram"]);
const SEARCH_HOSTS =
  /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave|startpage|baidu|yandex)\./i;
const PAID_MEDIUM = /(^|[^a-z])(paid|cpc|ppc|ppa|display|banner)([^a-z]|$)/i;

function referrerHost(referrer, selfHost) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host) return null;
    if (selfHost && host === selfHost.replace(/^www\./, "")) return null;
    return host;
  } catch {
    return null;
  }
}

function derive({ utmSource, utmMedium, fbclid, referrer, selfHost }) {
  const source = utmSource?.trim().toLowerCase() ?? "";
  const medium = utmMedium?.trim().toLowerCase() ?? "";
  if (fbclid || META_SOURCES.has(source)) return TRAFFIC_SOURCE.meta;
  if (source === "pinterest" || source === "pin") return TRAFFIC_SOURCE.pinterest;
  if (PAID_MEDIUM.test(medium)) return TRAFFIC_SOURCE.paidOther;
  if (source) return TRAFFIC_SOURCE.organic;
  const host = referrerHost(referrer, selfHost);
  if (!host) return TRAFFIC_SOURCE.direct;
  if (SEARCH_HOSTS.test(`${host}.`)) return TRAFFIC_SOURCE.organic;
  return TRAFFIC_SOURCE.referral;
}

const cases = [
  // --- Meta ---
  [{ fbclid: "abc123" }, "Meta", "fbclid alone is proof, even with no UTMs"],
  [{ utmSource: "facebook" }, "Meta", "facebook maps to Meta"],
  [{ utmSource: "IG", utmMedium: "paid_social" }, "Meta", "case-insensitive, Meta beats paid"],

  // --- Pinterest ---
  [{ utmSource: "pinterest", utmMedium: "cpc" }, "Pinterest", "named channel beats generic paid"],

  // --- Paid — Other: the case that must not fall through to Organic ---
  [{ utmSource: "tiktok", utmMedium: "cpc" }, "Paid — Other", "unnamed paid source"],
  [{ utmSource: "newsletter_x", utmMedium: "ppc" }, "Paid — Other", "ppc medium"],
  [{ utmMedium: "paid_social" }, "Paid — Other", "paid medium with no source"],
  [{ utmSource: "reddit", utmMedium: "display" }, "Paid — Other", "display is paid"],

  // --- Organic ---
  [{ utmSource: "partner_blog", utmMedium: "email" }, "Organic", "tagged, not paid"],
  [{ referrer: "https://www.google.com/search?q=x" }, "Organic", "search referrer, no UTMs"],
  [{ referrer: "https://duckduckgo.com/" }, "Organic", "another search engine"],

  // --- Referral ---
  [{ referrer: "https://someblog.example/post" }, "Referral", "non-search referrer"],

  // --- Direct ---
  [{}, "Direct", "nothing at all"],
  [{ referrer: "" }, "Direct", "empty referrer"],
  [{ referrer: "not a url" }, "Direct", "unparseable referrer"],
  [
    { referrer: "https://coolstuffwithcoco.com/decode", selfHost: "coolstuffwithcoco.com" },
    "Direct",
    "self-referral is not a Referral",
  ],
  [
    { referrer: "https://www.coolstuffwithcoco.com/", selfHost: "coolstuffwithcoco.com" },
    "Direct",
    "self-referral ignores www",
  ],

  // --- Guards against over-eager matching ---
  [{ utmSource: "x", utmMedium: "unpaid" }, "Organic", '"unpaid" must not match paid'],
  [{ utmSource: "x", utmMedium: "organic" }, "Organic", "organic medium stays Organic"],
];

let failed = 0;
for (const [input, expected, why] of cases) {
  const actual = derive(input);
  try {
    assert.equal(actual, expected);
    console.log(`  ok    ${why}`);
  } catch {
    failed++;
    console.error(`  FAIL  ${why}\n        expected "${expected}", got "${actual}"`);
  }
}

console.log("");
if (failed) {
  console.error(`${failed} of ${cases.length} failed.\n`);
  process.exit(1);
}
console.log(`All ${cases.length} traffic_source cases pass.\n`);
