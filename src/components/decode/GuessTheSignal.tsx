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
 * TODO(Eli): verify all three signal explanations against the guide text.
 * They're standard body-language reads, but they're still claims.
 */
export function GuessTheSignal() {
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
      className="section-pad relative isolate overflow-hidden scroll-mt-8 bg-bubblegum"
      aria-labelledby="signals-heading"
    >
      <Ambient variant="paws" />
      <div className="shell">
        <Speech aria-hidden className="mb-6 h-9 w-9 text-ink" />
        <h2 id="signals-heading" className="reveal-heading t-display-l max-w-[22ch] text-ink">
          Three of hers. Have a go.
        </h2>
        <p className="t-lead mt-5 text-ink/75">
          No score, no email needed. Just see how you do.
        </p>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Photo */}
          <div className="mx-auto w-[min(74vw,22rem)] lg:w-full">
            {/* One photo per signal, keyed off the signal id */}
            <BrandImage
              slot={`signal-${signal.id}` as BrandKey}
              alt={signal.caption}
              sizes="(max-width: 1024px) 74vw, 30vw"
              className="w-full rounded-2xl border-2 border-ink/20"
            />
            <p className="t-small mt-3 text-ink/75">{signal.caption}</p>
          </div>

          {/* The beat */}
          <div className="rounded-2xl border-2 border-ink/20 bg-paper p-6 sm:p-8">
            {/* Progress. A real sequence, so numbering is warranted here. */}
            <p className="t-small text-ink-muted">
              Signal {step + 1} of {SIGNALS.length}
            </p>

            <AnimatePresence mode="wait">
              <motion.div key={signal.id} {...fade}>
                <p className="t-h2 mt-3 text-ink">{signal.prompt}</p>

                <div className="mt-6 space-y-3">
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
                          "block w-full rounded-xl border-2 px-5 py-4 text-left transition-colors",
                          revealed && opt.correct
                            ? "border-ink bg-mint"
                            : isPicked
                              ? "border-ink bg-coral"
                              : "border-ink/25 bg-paper hover:bg-ink/5",
                          revealed ? "cursor-default" : "cursor-pointer",
                        ].join(" ")}
                      >
                        <span className="t-h3">{opt.label}</span>
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
                  <p className="t-body text-ink/85">{signal.reveal}</p>

                  {!done ? (
                    <button type="button" onClick={next} className="btn-coral mt-6">
                      Next signal
                    </button>
                  ) : (
                    <div className="mt-6 rounded-xl bg-butter p-5">
                      <p className="t-h3">
                        There are about thirty more of these in the guide.
                      </p>
                      <p className="t-small mt-2 text-ink/75">
                        {/* TODO(Eli): verify — "about thirty" is from the brief's
                            description of the guide, not a count of the real file. */}
                        Including the ones that look like bad behaviour and
                        aren&apos;t.
                      </p>
                      <a href="#get" className="btn-coral mt-5">
                        Get the guide
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
