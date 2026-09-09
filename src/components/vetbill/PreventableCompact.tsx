import { BrandImage } from "@/components/brand/BrandImage";
import { Ambient } from "@/components/motion/Ambient";
import { FactChips } from "@/components/shared/FactChips";
import { PREVENTABLE } from "@/lib/content/guides";

type Props = {
  facts: readonly string[];
  wash?: string;
};

/**
 * The preventable five, beside a recovering Coco. `/vetbill/b` only.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS REPLACES, AND WHY IT MATTERS MORE HERE THAN ON DECODE
 * ---------------------------------------------------------------------------
 * `MeetCoco` — a founder bio in the one slot on this page that could carry
 * something useful.
 *
 * `PREVENTABLE` is the content that belongs there. It was on `/vetbill` via
 * the `Preventable` section and was cut from the variant as part of trimming
 * 1,727 words to 767. That cut was a mistake, and `Preventable`'s own docblock
 * says why in advance: "this section is load-bearing for tone, not just for
 * SEO. Don't remove it to shorten the page."
 *
 * Without it the variant is the pure-fear arm — three frightening numbers, a
 * triage table and a cost chart, and nothing a reader can actually do. The
 * brief's rule is "protective, never predatory". Five things you can do about
 * it is the protective half, and it was missing.
 *
 * ---------------------------------------------------------------------------
 * WHY NOT JUST `<Preventable wash="…" />`
 * ---------------------------------------------------------------------------
 * That would have been one line, and it was the first thing tried. It renders
 * a full-height section of five large numbered cards, and its docblock is
 * explicit that a variant may change the wash and nothing else — so there is
 * nowhere in it to put Coco, and no way to tighten it without breaking the
 * rule that keeps the control arm stable.
 *
 * So this is a second, denser rendering of the same `PREVENTABLE` array. Same
 * data, one rendering per arm, and neither page shows both — so nothing is
 * duplicated anywhere a reader can see it.
 *
 * ---------------------------------------------------------------------------
 * THE IMAGE IS DOING TONE WORK, NOT DECORATION
 * ---------------------------------------------------------------------------
 * Coco has a bandaged paw and is completely fine — sitting up, ears forward,
 * calm. That pairing is the whole argument of the page in one look: something
 * happened, it was handled, here is how you get ready.
 *
 * It is also the one image on this site that could tip into the thing the
 * brief forbids. `docs/specs/community-ad-image-prompts.md` lists `bandage` in
 * the NEGATIVE prompt for the /vetbill ad still, reasoning that "the dog must
 * look healthy — the promise is 'you can be ready for this', not 'your dog is
 * ill'". Eli asked for the bandage deliberately and it ships, but the rule it
 * bends is still live: if a future render reads as a sympathy shot, it is
 * wrong and the old prohibition wins.
 *
 * The three props are `aria-hidden` and carry no information. They exist
 * because a bare cut-out on a flat wash looked plain, which is the note that
 * started this work.
 *
 * Server component. No JS.
 */

/**
 * The three props, as a row under Coco rather than floating over her.
 *
 * They were absolutely positioned on her first, and it was wrong: the asset is
 * trimmed to its alpha bounding box, so she fills the box and every position
 * inside 0-100% lands on the dog. The roll sat across her muzzle and read as
 * her eating the bandage.
 *
 * Measured properly afterwards — the only prop-sized empty region inside her
 * silhouette is x 4-29%, y 38-62%, beside her chest. One prop fits there.
 * Three do not, so the premise was wrong rather than the coordinates.
 *
 * A row underneath is also just better: three objects in a line read as a kit,
 * which is what they are, instead of as scattered decoration. The rotations
 * keep it from looking like a product grid.
 */
const PROPS = [
  { slot: "propFirstAidKit", rotate: "-6deg" },
  { slot: "propContactsCard", rotate: "3deg" },
  { slot: "propVetWrapRoll", rotate: "-3deg" },
] as const;

export function PreventableCompact({ facts, wash = "bg-paper" }: Props) {
  return (
    <section
      className={`relative isolate overflow-hidden py-14 sm:py-16 ${wash}`}
      aria-labelledby="preventable-compact-heading"
    >
      <Ambient variant="care" />

      <div className="shell">
        <h2
          id="preventable-compact-heading"
          className="t-h2 max-w-[24ch] text-ink"
        >
          Five that are largely preventable
        </h2>
        <p className="t-body mt-3 max-w-[54ch] text-ink-muted">
          Coco had one of these. She was fine, and it was cheaper because we
          were ready. None of it is about being a better owner.
        </p>

        {/* Same `auto_1fr` reasoning as the decode band — see that file. */}
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-14">
          <div className="mx-auto w-[min(66vw,17rem)] lg:mx-0 lg:w-68 xl:w-76">
            <BrandImage
              slot="cocoBandaged"
              sizes="(max-width: 1024px) 66vw, 19rem"
              className="w-full"
            />

            <ul className="mt-4 flex items-end justify-center gap-4">
              {PROPS.map((p) => (
                <li
                  key={p.slot}
                  className="w-17"
                  style={{ transform: `rotate(${p.rotate})` }}
                >
                  {/*
                    `decorative` gives these an empty alt and keeps them out of
                    the accessibility tree — they are set dressing, and their
                    manifest `alt` is deliberately blank to match.
                  */}
                  <BrandImage
                    slot={p.slot}
                    decorative
                    sizes="68px"
                    className="w-full"
                  />
                </li>
              ))}
            </ul>

            {/*
              Four words, and they turn three floating objects into a point.
              Lifted from `VETBILL.intro`, which calls the guide "the boring
              preparation that makes that night easier".
            */}
            <p className="t-small mt-2 text-center text-ink-muted">
              The boring preparation.
            </p>
          </div>

          <ol className="grid gap-2.5">
            {PREVENTABLE.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border-2 border-ink/15 bg-paper/70 p-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="t-h3 text-ink">{item.title}</h3>
                  {/*
                    The stat is evidence, so it keeps the pill treatment the
                    control uses. Butter, not coral — coral is the click
                    colour and is reserved for things you can act on.
                  */}
                  <span className="t-small rounded-full border-2 border-ink/20 bg-butter px-2.5 py-0.5 font-semibold text-ink">
                    {item.stat}
                  </span>
                </div>
                <p className="t-small mt-1.5 max-w-[56ch] text-ink-muted">
                  {item.action}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <FactChips facts={facts} className="mt-8" />
      </div>
    </section>
  );
}
