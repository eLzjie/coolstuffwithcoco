import { BrandImage } from "@/components/brand/BrandImage";
import { Ambient } from "@/components/motion/Ambient";
import { Paw } from "@/components/brand/Icons";

type Props = {
  /**
   * Two or three concrete facts about the guide, drawn from the real data so
   * they cannot drift — `CHEAT_SHEET.length`, `COSTS.length` and friends
   * rather than numbers typed in by hand.
   */
  facts: readonly string[];
  className?: string;
};

/**
 * The band where Coco appears on the variant pages.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS REPLACES
 * ---------------------------------------------------------------------------
 * A full-bleed cream section with a centred 26rem photo of Coco and nothing
 * else in it. On a phone that reads as a breath between sections; on a 1280px
 * screen it is a 416px image floating in 1280px of empty paper, and Eli's
 * note was exactly right — it looked plain.
 *
 * The fix is not decoration. Chase's instruction was to move Coco below the
 * fold, and the reason she is on these pages at all is that she is the whole
 * reason to trust the guide: it isn't a content farm, it's one person who
 * kept notes about one dog. So the empty half of the band gets that in two
 * sentences, and the facts underneath are the concrete detail that makes it
 * land rather than read as a slogan.
 *
 * ---------------------------------------------------------------------------
 * THE FACTS ARE DERIVED, NOT WRITTEN
 * ---------------------------------------------------------------------------
 * Callers pass them from `CHEAT_SHEET.length`, `DECODE.chapters.length` and
 * so on. It would have been quicker to type "18 signals" into this file, and
 * it would have been wrong the first time anyone edited the guide data.
 * `guides.ts` says the guide is the source of truth for anything a reader can
 * compare; a count is the easiest kind of thing to get caught out on.
 *
 * ---------------------------------------------------------------------------
 * THE SHAPES ARE THE EXISTING ONES
 * ---------------------------------------------------------------------------
 * `Ambient` already carries this brand's decorative vocabulary — a few slow
 * paws and bones at 10% ink, all `aria-hidden`, transform-only, and stopped
 * dead by `prefers-reduced-motion`. Using it here rather than inventing new
 * shapes means this band has the same texture as `GuessTheSignal` and
 * `ReadMethod`, which is the point: it should look like the same site.
 *
 * `relative isolate` on the section is load-bearing — `Ambient` sits at
 * `-z-10` and needs a stacking context to sit behind rather than vanish.
 *
 * Server component. No JS.
 */
export function MeetCoco({ facts, className }: Props) {
  return (
    <section
      className={`relative isolate overflow-hidden bg-paper py-14 sm:py-16 ${className ?? ""}`}
      aria-labelledby="coco-heading"
    >
      <Ambient variant="paws" />

      {/*
        `auto_1fr`, not an fr ratio. Coco is 675x1087 — a 0.62 aspect — so any
        column width you give her becomes 1.6x that in height, and at a
        proportional share of 1280px she came out ~700px tall against ~250px
        of copy. `items-center` then centred the text in her height and put
        symmetric dead space above and below it, which is the exact problem
        this band was built to fix.

        So her column is sized to her, capped, and the copy takes the rest.
      */}
      <div className="shell grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
        {/*
          Coco first in source order, so on a phone she still leads — she is
          the reason someone keeps scrolling here. On desktop the grid puts
          her in the narrower column and the copy gets the room.
        */}
        <div className="mx-auto w-[min(66vw,17rem)] lg:mx-0 lg:w-[17rem] xl:w-[19rem]">
          <BrandImage
            slot="cocoHero"
            sizes="(max-width: 1024px) 66vw, 19rem"
            className="w-full"
          />
        </div>

        <div>
          <h2 id="coco-heading" className="t-h2 max-w-[22ch] text-ink">
            This is Coco.
          </h2>

          {/*
            Two sentences, cut down from the home page's three paragraphs.
            This is the sparse arm of the split test, so the story earns a
            band and not a section.
          */}
          <p className="t-body mt-4 max-w-[52ch] text-ink-muted">
            She came home four years ago and immediately started doing things I
            couldn&apos;t explain — the staring, the 9pm laps of the sofa,
            turning her back on people she actually liked. I wrote it all down
            while I worked her out.
          </p>
          <p className="t-body mt-3 max-w-[52ch] text-ink-muted">
            The guide is that notebook, tidied up.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {facts.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-3.5 py-1.5"
              >
                <Paw aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink" />
                <span className="t-small font-semibold text-ink">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
