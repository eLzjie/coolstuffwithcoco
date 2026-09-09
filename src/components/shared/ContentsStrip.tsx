import type { Chapter } from "@/lib/content/guides";

type Props = {
  chapters: readonly Chapter[];
  className?: string;
};

/**
 * The guide's contents, set as a contents page.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS REPLACES
 * ---------------------------------------------------------------------------
 * The "What's in it" block on both landing pages: a two-column list of chapter
 * titles, each with a blurb under it. 213 words on `/decode`, 251 on
 * `/vetbill`, and it is the second-largest block on each page.
 *
 * Eli's note was "too much wordy, add illustrations, charts, tables". The
 * blurbs are the wordiest thing here and also the least load-bearing: a
 * visitor deciding whether to hand over an email wants to know the guide has
 * seven chapters and what they cover, not to read a paragraph about each one.
 * Dropping the blurbs removes ~180 words per page and loses nothing they were
 * using to decide.
 *
 * ---------------------------------------------------------------------------
 * WHY IT LOOKS LIKE A CONTENTS PAGE
 * ---------------------------------------------------------------------------
 * Because it is one, and because it makes the product feel like a book instead
 * of a landing-page section. Leader dots and a right-aligned number are what
 * every printed contents page in existence looks like, so it reads as "this is
 * a real document" with no explaining.
 *
 * The numbers ARE a sequence — chapters in order, and the guide is read front
 * to back — which is the only case where numbered markers carry information
 * rather than decorate. The last chapter is the fridge card in both guides, so
 * the count lands on something worth arriving at.
 *
 * Server component. No JS.
 */
export function ContentsStrip({ chapters, className }: Props) {
  return (
    <ol className={`border-t-2 border-ink/15 ${className ?? ""}`}>
      {chapters.map((c, i) => (
        <li
          key={c.title}
          className="flex items-baseline gap-3 border-b-2 border-ink/15 py-3.5"
        >
          {/*
            `tabular-nums` so 1 and 10 occupy the same width — a contents page
            with a ragged number column looks like a bug.

            `text-ink-muted` (75%), not the lighter tint this first shipped
            with. globals.css says it outright: 75% is the LOWEST ink opacity
            clearing 4.5:1 across all six washes, and anything below it is for
            borders and icons only. Lighthouse caught ink/40 here on every row.
            `aria-hidden` is not an excuse — it hides the number from a screen
            reader, which does nothing for the sighted reader who can't see it.
          */}
          <span
            aria-hidden
            className="w-7 shrink-0 font-display text-base font-bold tabular-nums text-ink-muted"
          >
            {String(i + 1).padStart(2, "0")}
          </span>

          <span className="t-h3 text-ink">{c.title}</span>

          {/*
            The leader. A flexing dotted rule rather than a string of periods:
            it can't wrap mid-run, it can't be selected and pasted as junk, and
            it collapses to nothing at narrow widths instead of pushing the
            layout. Sits on the baseline via the small bottom offset.
          */}
          <span
            aria-hidden
            className="mb-[0.3em] hidden min-w-4 flex-1 border-b-2 border-dotted border-ink/25 sm:block"
          />
        </li>
      ))}
    </ol>
  );
}
