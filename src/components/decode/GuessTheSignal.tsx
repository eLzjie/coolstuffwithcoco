"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { BrandImage } from "@/components/brand/BrandImage";
import type { BrandKey } from "@/lib/brand/manifest";
import { Speech } from "@/components/brand/Icons";
import { SIGNALS } from "@/lib/content/guides";
import { track } from "@/lib/analytics/track";
import { Ambient } from "@/components/motion/Ambient";

/**
 * Optional section wash.
 *
 * The split-test variants need a different background on some of these
 * sections — Chase's note was "it's somewhat feminine, we should try to speak
 * to both audiences", and bubblegum on every capture surface is most of why.
 *
 * ONLY the wash. Not the id, not the heading, not the copy. Those are the
 * things a variant is supposed to be testing, so a variant that wants a
 * different heading should say so in its own page file where the difference is
 * visible — not reach in through a prop and make two pages look like one
 * component with a flag. Add more props when a variant actually needs them.
 *
 * The default reproduces the class list byte-for-byte, so `/decode` and
 * `/vetbill` render exactly what they rendered before this prop existed. That
 * was verified rather than assumed, and it is worth re-verifying if the class
 * list is ever reordered:
 *
 *     curl -s localhost:3000/decode > before.html   # then make the change
 *     curl -s localhost:3000/decode | diff before.html -
 */
type Props = { wash?: string };

/**
 * /decode signature moment — "Guess the signal".
 *
 * The locked ad angle is "most owners get it wrong", so this dramatises that
 * rather than claiming it: a guess you can actually get wrong, three times,
 * then the payoff line. Being wrong is the engine.
 *
 * Interaction is one tap per beat — no hover, no hotspot precision — because
 * effectively all of this page's traffic is mobile.
 *
 * A11y: real buttons, arrow-key-free (no custom keyboard model to learn), and
 * the reveal is announced through an aria-live region so a screen reader user
 * gets the answer without needing to find it visually.
 *
 * All three explanations were checked against `CTWCDecode YourDog V5.pdf` on
 * 2026-09-08 — see the note above SIGNALS in lib/content/guides.ts, where
 * every entry now carries `verify: false`. A stale TODO asking for that check
 * used to sit here.
 *
 * ---------------------------------------------------------------------------
 * MOBILE ORDER: PHOTO, THEN THE QUESTION — REVERSED TWICE, SO READ THIS
 * ---------------------------------------------------------------------------
 * Chase's feedback was "it's hard to find or understand on mobile", and he was
 * right: the photo used to be first at 361px tall, so the order was heading,
 * lead, image, caption, and only THEN the first tappable answer — roughly
 * 1,950px down the page. It read as an illustrated paragraph rather than
 * something you do.
 *
 * The fix at the time was to put the beat card first and the photo second.
 * That fixed the distance and broke the logic: in a "guess the signal" quiz
 * the PHOTO IS THE QUESTION, and showing the answers above the thing you are
 * being asked to judge is backwards. Eli called it — "better if the image is
 * on top".
 *
 * So the photo is first again, and the original complaint is answered by size
 * rather than by sequence:
 *
 *     before   361px tall, full column width
 *     now      ~175px tall at 390px
 *
 * Which was the right lever all along. The distance was never really about
 * order; it was about a photo taking most of a phone screen.
 *
 * Source order and visual order now agree at every width — no `order`
 * overrides anywhere — so a keyboard user tabs through it in the order it
 * reads. That is worth more than either arrangement of the two.
 */
export function GuessTheSignal({ wash = "bg-bubblegum" }: Props = {}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const signal = SIGNALS[step];
  const done = step >= SIGNALS.length - 1 && picked !== null;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    track("view_content", {
      content_name: `signal:${signal.id}`,
      lead_magnet: "decode",
      correct: signal.options[i].correct,
    });
  };

  const next = () => {
    setPicked(null);
    setStep((s) => Math.min(s + 1, SIGNALS.length - 1));
  };

  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      id="signals"
      className={`section-pad relative isolate overflow-hidden scroll-mt-8 ${wash}`}
      aria-labelledby="signals-heading"
    >
      <Ambient variant="paws" />
      <div className="shell">
        <Speech aria-hidden className="mb-6 h-9 w-9 text-ink" />
        <h2 id="signals-heading" className="reveal-heading t-display-l max-w-[22ch] text-ink">
          Three of hers. Have a go.
        </h2>
        {/*
          An instruction, not a reassurance.

          This read "No score, no email needed. Just see how you do." — which
          the client crossed out, and rightly: on a page whose whole job is to
          get an email, volunteering that no email is needed talks the visitor
          out of the conversion. It also described what the section ISN'T
          rather than telling anyone what to do.
        */}
        <p className="t-lead mt-5 text-ink/75">
          Three of Coco&apos;s. Tap what you think each one means.
        </p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          {/*
            The photo is FIRST, because in a "guess the signal" quiz the photo
            IS the question. Answers above the thing you are judging is
            backwards, and Eli called it: "better if the image is on top".

            It stays small — it was `min(74vw,22rem)`, which rendered ~361px
            tall and pushed every answer button below the fold. That is the
            complaint the order was reversed for in the first place, and size
            is the better lever. See the mobile-order note at the top.
          */}
          <div className="mx-auto w-[min(58vw,14rem)] lg:w-full">
            {/* One photo per signal, keyed off the signal id */}
            <BrandImage
              slot={`signal-${signal.id}` as BrandKey}
              alt={signal.caption}
              sizes="(max-width: 1024px) 58vw, 30vw"
              className="w-full rounded-2xl border-2 border-ink/20"
            />
            <p className="t-small mt-3 text-ink/75">{signal.caption}</p>
          </div>
          {/*
            The beat card second, so on desktop the grid's first column takes
            the photo and this lands on the right with no `order` overrides at
            all. Source order and visual order agree at every width, which is
            the only arrangement a keyboard user experiences as sane.
          */}
          <div className="rounded-2xl border-2 border-ink/20 bg-paper p-5 sm:p-6">
            {/* Progress. A real sequence, so numbering is warranted here. */}
            <p className="t-small text-ink-muted">
              Signal {step + 1} of {SIGNALS.length}
            </p>

            <AnimatePresence mode="wait">
              <motion.div key={signal.id} {...fade}>
                <p className="t-h3 mt-2 text-ink">{signal.prompt}</p>

                <div className="mt-4 space-y-2.5">
                  {signal.options.map((opt, i) => {
                    const isPicked = picked === i;
                    const revealed = picked !== null;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => choose(i)}
                        disabled={revealed}
                        aria-pressed={isPicked}
                        className={[
                          "block w-full rounded-xl border-2 px-4 py-3 text-left transition-colors",
                          revealed && opt.correct
                            ? "border-ink bg-mint"
                            : isPicked
                              ? "border-ink bg-coral"
                              : "border-ink/25 bg-paper hover:bg-ink/5",
                          revealed ? "cursor-default" : "cursor-pointer",
                        ].join(" ")}
                      >
                        <span className="font-semibold text-ink">{opt.label}</span>
                        {revealed && opt.correct && (
                          <span className="t-small mt-1 block text-ink/75">
                            That&apos;s the one
                          </span>
                        )}
                        {revealed && isPicked && !opt.correct && (
                          <span className="t-small mt-1 block text-ink/75">
                            Common read — but no
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Reveal — announced, not just shown */}
            <div aria-live="polite" className="min-h-[1px]">
              {picked !== null && (
                <motion.div
                  {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } })}
                  className="mt-6 border-t-2 border-ink/15 pt-5"
                >
                  <p className="t-small text-ink/85">{signal.reveal}</p>

                  {!done ? (
                    /*
                      Both actions on every beat, not just the last one.

                      The guide CTA used to appear only after all three signals
                      were answered, which meant a visitor who tried one and
                      lost interest was never once offered the thing the page
                      is selling. "Next signal" stays primary — finishing the
                      set is still the better path — and the guide link sits
                      beside it as a quieter way out.
                    */
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <button type="button" onClick={next} className="btn-coral">
                        Next signal
                      </button>
                      <a
                        href="#get"
                        className="t-small min-h-11 underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                      >
                        Or just send me the guide
                      </a>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl bg-butter p-5">
                      {/*
                        "About thirty" was from the brief's description, not a
                        count of the real file — and it was carrying its own
                        TODO admitting so. Counted: the cheat sheet on page 12
                        lists 23 things (18 signal/meaning pairs across face,
                        body and weird stuff, plus 5 calming signals), three of
                        which are the ones shown here. So twenty-odd more is
                        true, and it sells the cheat sheet, which the guide
                        itself says is the page people keep.

                        That 23 is `CHEAT_SHEET_COUNT` in guides.ts now, and
                        `/decode/b` quotes it rather than counting the pairs
                        alone — which is how that page ended up saying 18 in
                        two places and implying 23 here.
                      */}
                      <p className="t-h3">
                        Twenty-odd more, all on one page for the fridge.
                      </p>
                      <p className="t-small mt-2 text-ink/75">
                        Including the ones that look like bad behaviour and
                        aren&apos;t.
                      </p>
                      <a href="#get" className="btn-coral mt-5">
                        Send me the guide
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
