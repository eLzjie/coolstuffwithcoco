import { COSTS, COST_SOURCES } from "@/lib/content/guides";
import { parseRange } from "@/lib/costRange";

/**
 * The emergency cost table, drawn.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS REPLACES
 * ---------------------------------------------------------------------------
 * The `<dl>` on `/vetbill`: eight label/range pairs with a note under most of
 * them, 233 words, and every figure carrying exactly the same visual weight as
 * every other. A reader has to hold eight number pairs in their head to notice
 * the thing the section exists to say — that the floor is a couple of hundred
 * dollars and the ceiling is several thousand.
 *
 * A chart says it in one look. This is the first real chart on the site, and
 * it's the right place for one: the data is numeric, ordered, and the spread
 * IS the message.
 *
 * ---------------------------------------------------------------------------
 * WHY FLOATING BARS AND NOT BARS FROM ZERO
 * ---------------------------------------------------------------------------
 * A 0→high bar would say "bloat surgery costs $7,500", which is not what the
 * guide says and not what happens. Each bar spans low→high on a shared axis,
 * so it reads as "somewhere in here", which is the honest shape of the claim
 * and matches the caveat printed below.
 *
 * Open-ended rows (`$300 – $3,000+`) fade out at the right edge instead of
 * stopping square, because the `+` in the guide means the high end is a floor.
 * That is the one thing the string carries that a plain bar would throw away.
 *
 * ---------------------------------------------------------------------------
 * COMPLIANCE — DO NOT STRIP
 * ---------------------------------------------------------------------------
 * The "ranges, not quotes" panel and the four source links are compliance
 * copy, not page furniture. A visitor who quotes these at a clinic counter has
 * been misled by us. They render inside this component so that dropping the
 * old `<dl>` cannot accidentally drop them too.
 *
 * No chart library. Pure CSS percentage widths, so this is a server component
 * that ships no JavaScript and cannot fail to hydrate.
 */

/*
  Axis ceiling. Derived from the data rather than hardcoded, so adding a row
  can't silently push a bar past 100% width. Rounded up to the next $2,500 so
  the tick labels stay round numbers.
*/
const TICK = 2500;
const MAX = (() => {
  const highest = COSTS.reduce((max, c) => {
    const p = parseRange(c.range);
    return p && p.high > max ? p.high : max;
  }, 0);
  return Math.max(TICK, Math.ceil(highest / TICK) * TICK);
})();

const TICKS = Array.from({ length: MAX / TICK + 1 }, (_, i) => i * TICK);

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export function CostChart() {
  return (
    <div>
      {/*
        A <ul>, not a <dl>, and that is a correctness fix rather than a
        preference.

        HTML5's content model for <dl> is strict: either dt/dd groups directly,
        or ONE layer of <div> containing only dt/dd groups. This row needs four
        things — a label, a value, a bar and a note — so it had a nested
        <div class="flex"> plus a <p>, which puts <dt> two levels deep and a <p>
        somewhere <dl> does not allow. Lighthouse flagged it as
        `definition-list` + `dlitem` on every row.

        Bending the layout to fit <dl> would have meant burying the bar and the
        note inside the <dd>, which is worse markup for better-sounding
        semantics. A list of cost items is what this is, so it is a list. A
        screen reader reads "list, 8 items", then "Bloat (GDV) surgery,
        $2,000 - $7,500, life threatening and it moves in hours" — which is
        the whole row, in the right order.
      */}
      <ul className="mt-10">
        {COSTS.map((c) => {
          const p = parseRange(c.range);

          return (
            <li
              key={c.label}
              className="border-b-2 border-ink/12 py-4 first:border-t-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5">
                <span className="t-h3 max-w-[30ch]">{c.label}</span>
                {/*
                  The number stays as text at full size. The bar is a second
                  reading of the same fact, never the only one — a chart a
                  screen reader can't use would hide the whole section from
                  anyone not looking at it.
                */}
                <span className="t-h3 whitespace-nowrap tabular-nums">
                  {c.range}
                </span>
              </div>

              {/*
                The track. `aria-hidden` because the range is already stated
                in words directly above — announcing it twice is noise.

                A row whose range doesn't parse simply has no track. That is
                the graceful-degradation path, and `npm run check:costs`
                asserts it never fires on the live data.
              */}
              {p && (
                <div
                  aria-hidden
                  className="relative mt-2.5 h-3 overflow-hidden rounded-full border-2 border-ink/15 bg-ink/[0.05]"
                >
                  <div
                    className="absolute inset-y-0 rounded-full bg-coral"
                    style={{
                      left: `${(p.low / MAX) * 100}%`,
                      width: `${((p.high - p.low) / MAX) * 100}%`,
                      /*
                        Open-ended: dissolve the right edge so it reads as
                        "and upwards" rather than a hard ceiling.
                      */
                      ...(p.open
                        ? {
                            maskImage:
                              "linear-gradient(90deg, #000 0%, #000 62%, transparent 100%)",
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                          }
                        : null),
                    }}
                  />
                </div>
              )}

              {c.note && (
                <p className="t-small mt-2 max-w-[52ch] text-ink-muted">
                  {c.note}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/*
        The axis, below the bars. Above them it would be read as a heading;
        below, it's a scale you glance down at — and it means the first thing
        in the section is a cost, not a row of numbers with no context yet.
      */}
      <div
        aria-hidden
        /*
          text-ink-muted, not the lighter tint this shipped with. Same rule as
          everywhere else: globals.css puts the floor at 75% ink, and below it
          is for borders and icons. Lighthouse flagged every tick label.
        */
        className="mt-3 flex justify-between text-[0.6875rem] tabular-nums text-ink-muted"
      >
        {TICKS.map((t) => (
          <span key={t}>{t === 0 ? "$0" : money(t)}</span>
        ))}
      </div>

      <div className="mt-8 max-w-[62ch] rounded-xl border-2 border-ink/25 bg-paper-warm p-5">
        <p className="t-small text-ink/85">
          <strong className="font-semibold">These are ranges, not quotes.</strong>{" "}
          They&apos;re the same US figures printed in the guide, there to give
          you a sense of scale before you&apos;re standing at a counter. Real
          prices swing hard by state, city and clinic, and a specialty hospital
          costs more than a general practice. Your own vet is the only place to
          get a number that applies to your dog.
        </p>
        <p className="t-small mt-3 text-ink-muted">
          Sources:{" "}
          {COST_SOURCES.map((s, i) => (
            <span key={s.url}>
              {i > 0 && " · "}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {s.name}
              </a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
