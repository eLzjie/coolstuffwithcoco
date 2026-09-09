/**
 * The one check behind `parseRange`.
 *
 * `CostChart` draws its bars by parsing the display strings in `COSTS`, which
 * means a row written in an unexpected format loses its bar — silently, since
 * the row still renders its label and range as text. This is what makes that
 * loud.
 *
 * Run it after touching `COSTS` in `src/lib/content/guides.ts`:
 *
 *     npm run check:costs
 *
 * Needs Node's type stripping (22.6+) because it imports the real .ts sources
 * rather than a copy of them. That's the point — a test against a duplicated
 * fixture would pass while the live data was broken.
 */
import assert from "node:assert/strict";
import { parseRange } from "../src/lib/costRange.ts";
import { COSTS } from "../src/lib/content/guides.ts";

let failed = 0;

const check = (name, fn) => {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message.split("\n")[0]}`);
  }
};

console.log("\nparseRange — formats\n");

check("plain range", () => {
  assert.deepEqual(parseRange("$150 – $500"), {
    low: 150,
    high: 500,
    open: false,
  });
});

check("thousands separators", () => {
  assert.deepEqual(parseRange("$2,000 – $7,500"), {
    low: 2000,
    high: 7500,
    open: false,
  });
});

check("open-ended keeps the + as a flag, not part of the number", () => {
  assert.deepEqual(parseRange("$300 – $3,000+"), {
    low: 300,
    high: 3000,
    open: true,
  });
});

check("hyphen and em dash are tolerated", () => {
  assert.deepEqual(parseRange("$100-$200"), {
    low: 100,
    high: 200,
    open: false,
  });
  assert.deepEqual(parseRange("$100 — $200"), {
    low: 100,
    high: 200,
    open: false,
  });
});

console.log("\nparseRange — refuses to guess\n");

for (const bad of [
  "about a thousand dollars",
  "$500",
  "150 – 500",
  "$500 – $150", // reversed: a data typo, not something to draw
  "",
]) {
  check(`null for ${JSON.stringify(bad)}`, () => {
    assert.equal(parseRange(bad), null);
  });
}

console.log("\nlive data — every COSTS row draws a bar\n");

for (const row of COSTS) {
  check(`${row.label} (${row.range})`, () => {
    const p = parseRange(row.range);
    assert.ok(p, `unparseable — this row would render with no bar`);
    assert.ok(p.high >= p.low);
  });
}

console.log(
  `\n${failed === 0 ? "OK" : "FAILED"} — ${failed} failure${failed === 1 ? "" : "s"}\n`,
);
process.exit(failed === 0 ? 0 : 1);
