#!/usr/bin/env node
/**
 * Reports which of the build spec's custom fields exist in the GHL
 * sub-account, and which the capture handler therefore cannot write.
 *
 *   npm run check:ghl
 *
 * Read-only. Creates nothing, changes nothing.
 *
 * Why this exists: GHL accepts a custom-field write addressed to a key that
 * doesn't exist and silently drops it. Without this you find out that seven
 * fields never landed by reading an empty column in a report, after spend.
 *
 * Reads GHL_API_KEY and GHL_LOCATION_ID from .env.local.
 */

import { readFileSync } from "node:fs";

const API = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

/** From the build spec's Schema table. Order is the table's order. */
const SPEC = [
  ["parent_audience", "Dropdown", "Pets > Dogs"],
  ["lead_magnet", "Dropdown", "Decode / VetBill / Newsletter — first magnet only"],
  ["interest", "Multi-select", "set by clicks, never at capture"],
  ["traffic_source", "Dropdown", "Meta / Pinterest / Organic / Direct / Paid — Other / Referral"],
  ["campaign", "Text", ""],
  ["utm_source", "Text", ""],
  ["utm_medium", "Text", ""],
  ["utm_campaign", "Text", ""],
  ["utm_content", "Text", ""],
  ["utm_term", "Text", ""],
  ["buyer_state", "Dropdown", "set by workflow only"],
  ["landing_page", "Text", "which page captured them"],
  ["marketing_consent", "Checkbox", "permission record, written at capture"],
  ["consent_at", "Date", "optional — timestamp of the consent record"],
];

/** Written by the capture handler — these are the ones that block launch. */
const WRITTEN_AT_CAPTURE = new Set([
  "parent_audience",
  "lead_magnet",
  "traffic_source",
  "campaign",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "landing_page",
  "marketing_consent",
]);

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Fall through to whatever is already in the environment.
  }
}

loadEnv();

const key = process.env.GHL_API_KEY;
const location = process.env.GHL_LOCATION_ID;

if (!key || !location) {
  console.error("Missing GHL_API_KEY or GHL_LOCATION_ID (checked .env.local).");
  process.exit(1);
}

const res = await fetch(`${API}/locations/${location}/customFields`, {
  headers: {
    Authorization: `Bearer ${key}`,
    Version: VERSION,
    Accept: "application/json",
  },
});

if (!res.ok) {
  console.error(`GHL customFields returned ${res.status}.`);
  if (res.status === 401) {
    console.error("The token is valid but may lack the custom-fields scope.");
  }
  process.exit(1);
}

const body = await res.json();
const present = new Map(
  (body.customFields ?? []).map((f) => [
    f.fieldKey.replace(/^contact\./, ""),
    f,
  ]),
);

let missingAtCapture = 0;

console.log("\nGHL custom fields vs build spec\n");
for (const [k, type, notes] of SPEC) {
  const hit = present.get(k);
  const blocks = WRITTEN_AT_CAPTURE.has(k);
  if (!hit && blocks) missingAtCapture++;

  const mark = hit ? "  ok  " : blocks ? " MISS " : "  --  ";
  const detail = hit ? `[${hit.dataType}]` : `expected ${type}`;
  console.log(
    `${mark} ${k.padEnd(17)} ${detail.padEnd(18)} ${notes}`,
  );
}

const extra = [...present.keys()].filter(
  (k) => !SPEC.some(([s]) => s === k),
);
if (extra.length) {
  console.log(`\nAlso present (not in spec): ${extra.join(", ")}`);
}

console.log("");
if (missingAtCapture > 0) {
  console.log(
    `${missingAtCapture} field(s) written at capture do not exist. ` +
      `Those writes will be dropped silently.\n` +
      `Create them under Settings > Custom Fields with the exact keys above.\n`,
  );
  process.exit(1);
}

console.log("All fields written at capture exist.\n");
