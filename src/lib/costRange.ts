/**
 * Turning the guide's printed cost ranges into numbers a bar chart can draw.
 *
 * ---------------------------------------------------------------------------
 * WHY PARSE A STRING INSTEAD OF STORING NUMBERS
 * ---------------------------------------------------------------------------
 * `COSTS[].range` is a display string like `"$150 – $500"` because that is how
 * the guide prints it, and `guides.ts` says the guide is the source of truth
 * for anything a reader can compare. Adding `low`/`high` number fields
 * alongside it would create two copies of the same fact, and the copy nobody
 * reads is the copy that goes stale — a chart quietly drawing $3,000 next to a
 * label that says $2,000 is worse than no chart.
 *
 * So there is one source, and this reads it.
 *
 * The risk of parsing is a silent failure, so there isn't one: an
 * unrecognised string returns `null`, `CostChart` renders that row as plain
 * text with no bar, and `scripts/check-costs.mjs` asserts every live row still
 * parses. Run it if you touch `COSTS`.
 *
 * This file deliberately imports nothing, so the check script can load it with
 * `node --experimental-strip-types`.
 */

export type ParsedRange = {
  low: number;
  high: number;
  /** True for `"$300 – $3,000+"` — the high end is a floor, not a ceiling. */
  open: boolean;
};

/**
 * Matches `$150 – $500` and `$300 – $3,000+`.
 *
 * The separator alternation covers the en dash the guide actually uses, plus a
 * hyphen and an em dash, because those are what a hurried edit will type.
 * Thousands separators are optional so `$500` and `$7,500` both work.
 */
const RANGE = /^\$([\d,]+)\s*[–—-]\s*\$([\d,]+)(\+?)$/;

/** Returns null rather than throwing, or guessing. */
export function parseRange(range: string): ParsedRange | null {
  const m = RANGE.exec(range.trim());
  if (!m) return null;

  const low = Number(m[1].replace(/,/g, ""));
  const high = Number(m[2].replace(/,/g, ""));

  // A reversed or non-finite range is a typo in the data, not something to
  // draw. Same treatment as an unparseable string: no bar, text still shows.
  if (!Number.isFinite(low) || !Number.isFinite(high) || high < low) return null;

  return { low, high, open: m[3] === "+" };
}
