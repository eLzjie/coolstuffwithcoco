import { BrandImage } from "@/components/brand/BrandImage";
import { Ambient } from "@/components/motion/Ambient";
import { FactChips } from "@/components/shared/FactChips";
import { READ_METHOD } from "@/lib/content/guides";

type Props = {
  facts: readonly string[];
  wash?: string;
};

/**
 * The R.E.A.D. method, as a diagram. `/decode/b` only.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS REPLACES
 * ---------------------------------------------------------------------------
 * `MeetCoco` — a founder bio. "This is Coco. She came home four years ago and
 * immediately started doing things I couldn't explain…" On a landing page
 * whose only job is to make someone want the guide, a founder bio is close to
 * the weakest thing that could occupy the space. That copy still exists on the
 * home page in `AboutCoco`, which is where it belongs.
 *
 * R.E.A.D. is the right content for the slot for a boring reason: it is the
 * only substantial piece of guide material that was on `/decode` and not on
 * the variant, and `ReadMethod`'s own lead calls it "the most useful page in
 * the guide". It also does not duplicate anything below it — the quiz tests
 * three specific signals and `SignalGrid` lists the cheat sheet; neither
 * teaches you where to look.
 *
 * ---------------------------------------------------------------------------
 * TWO PINS FOR FOUR STEPS, AND THAT IS CORRECT
 * ---------------------------------------------------------------------------
 * Only E ("Eyes, ears, mouth") and A ("Assess the body") point at anatomy. R
 * is "relax yourself first" and D is "decide" — both instructions to the
 * human, with nothing on a dog to point at. So the diagram pins two of the
 * four and the list carries all four. Padding it out with two invented pins
 * would make the diagram lie about what the method is.
 *
 * `PINNED` maps step letters to positions, so the mapping is declared once and
 * the list and the image cannot disagree about which step has a pin.
 *
 * ---------------------------------------------------------------------------
 * THE TAIL IS NOT PINNED, AND THE GUIDE AGREES
 * ---------------------------------------------------------------------------
 * Step A names "tail height and stiffness" first, and the delivered render has
 * no visible tail — Coco is a French Bulldog, so there is barely one to see.
 * The A pin therefore sits on her topline and points at posture.
 *
 * That is not a compromise. The step's own second half says it outright: "the
 * tail gets the attention but posture tells the real story." A diagram that
 * pins posture is closer to the guide than one that pins a tail would be.
 *
 * ---------------------------------------------------------------------------
 * WHY PINS AND A LIST, RATHER THAN LABELS OVER THE PHOTO
 * ---------------------------------------------------------------------------
 * Measured on the actual asset, not guessed. Her silhouette fills x 13-85% and
 * y 9-93% of the frame, and the body occupies x 5-88% continuously from y 37%
 * to y 92%. The only genuinely empty region is the top-left corner. Floating
 * four labels over that image collides with the dog everywhere except one
 * corner, at every viewport width.
 *
 * So the labels are a real list beside the image and the image carries small
 * numbered pins. This also satisfies the rule `CostChart` sets: the visual is
 * a SECOND reading of the content, never the only one. The pins are
 * `aria-hidden` decoration; the list is the content, and it reads correctly
 * with no image at all.
 *
 * ---------------------------------------------------------------------------
 * IF THE IMAGE IS EVER REPLACED
 * ---------------------------------------------------------------------------
 * The two `at` values below are the only numbers to retune, and they are
 * percentages of the image box. The asset is trimmed to its alpha bounding
 * box, so "50%" means the middle of the dog rather than the middle of a canvas
 * with unknown padding — which is exactly the trap `cocoHero` fell into with
 * 166px of dead transparent margin. Keep any replacement trimmed.
 *
 * Server component. No JS.
 */

/**
 * Where each pinned step sits on the image, as a percentage of the image box.
 *
 * Read off the rendered silhouette:
 *   E → the dark muzzle, x 78-98% at y 33-50%
 *   A → the topline behind the shoulder, x 10-40% at y 42-50%
 *
 * The E pin was on the eye first (x 76%, y 30%) and half-covered it, which is
 * a silly thing to do on the step about reading eyes. It sits on the muzzle
 * instead — still unambiguously "her face", and coral on the charcoal mask has
 * more contrast than coral on fawn.
 */
const PINNED: Record<string, { x: string; y: string; anchor: string }> = {
  E: { x: "87%", y: "41%", anchor: "her face" },
  A: { x: "24%", y: "47%", anchor: "her posture" },
};

export function BodyLanguageDiagram({ facts, wash = "bg-paper" }: Props) {
  return (
    <section
      className={`relative isolate overflow-hidden py-14 sm:py-16 ${wash}`}
      aria-labelledby="read-diagram-heading"
    >
      <Ambient variant="paws" />

      <div className="shell">
        <h2
          id="read-diagram-heading"
          className="t-h2 max-w-[24ch] text-ink"
        >
          Four steps for reading any dog
        </h2>
        <p className="t-body mt-3 max-w-[54ch] text-ink-muted">
          It&apos;s the most useful page in the guide, so here it is in full.
        </p>

        {/*
          `auto_1fr`, not an fr ratio — inherited from MeetCoco along with the
          reason. The diagram is a 0.85 aspect, so a proportional share of a
          1280px grid makes it far taller than the copy beside it, and
          `items-center` then puts symmetric dead space around the text. Her
          column is sized to her and capped; the list takes the rest.
        */}
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
          {/*
            `relative` is load-bearing: the pins are positioned against this
            box, so it has to be the image's own bounds and nothing wider.
          */}
          <div className="relative mx-auto w-[min(72vw,20rem)] lg:mx-0 lg:w-88 xl:w-96">
            <BrandImage
              slot="cocoDiagram"
              sizes="(max-width: 1024px) 72vw, 24rem"
              className="w-full"
            />

            {READ_METHOD.map((step, i) => {
              const pin = PINNED[step.letter];
              if (!pin) return null;
              return (
                <span
                  key={step.letter}
                  /*
                    Decoration. The number it shows is repeated in the list
                    item it belongs to, so a screen reader gets the
                    correspondence from the text rather than from a floating
                    circle it would have to announce out of order.
                  */
                  aria-hidden
                  className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-coral font-display text-[0.8125rem] font-bold text-ink"
                  style={{
                    left: pin.x,
                    top: pin.y,
                    boxShadow: "0 2px 0 var(--color-ink)",
                  }}
                >
                  {i + 1}
                </span>
              );
            })}
          </div>

          <ol className="grid gap-3">
            {READ_METHOD.map((step, i) => {
              const pin = PINNED[step.letter];
              return (
                <li
                  key={step.letter}
                  className="rounded-2xl border-2 border-ink/15 bg-paper/70 p-4"
                >
                  <h3 className="t-h3 flex items-baseline gap-2.5 text-ink">
                    {/*
                      The step letter is the brand's device for this section
                      and carries no information a screen reader needs — the
                      title says the same thing in words.
                    */}
                    <span
                      aria-hidden
                      className="font-display text-xl font-bold text-coral"
                    >
                      {step.letter}
                    </span>
                    {step.title}
                  </h3>

                  <p className="t-small mt-1.5 max-w-[52ch] text-ink-muted">
                    {step.body}
                  </p>

                  {/*
                    Only the two anatomical steps get this line, and it is what
                    ties the list to the pins for everyone rather than only for
                    people who can see a coral circle.
                  */}
                  {pin && (
                    <p className="t-small mt-2 font-semibold text-ink">
                      Marked {i + 1} on Coco — {pin.anchor}.
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <FactChips facts={facts} className="mt-8" />
      </div>
    </section>
  );
}
