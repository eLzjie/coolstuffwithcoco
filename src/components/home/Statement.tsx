"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * The mid-page statement band — the page's second big scroll moment.
 *
 * A wall of type that the scroll drives: the two lines slide past each other in
 * opposite directions while the circle field behind them rises. It's the same
 * device as the hero (scroll position drives transform, nothing else), reused
 * once so the page has a rhythm rather than one clever moment and then
 * nothing.
 *
 * Everything here is transform-only and compositor-side. The type is fully
 * legible at rest, so under `prefers-reduced-motion` it just sits there and
 * reads as an oversized pull quote.
 */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const v = (a: string, b: string) => (reduce ? [a, a] : [a, b]);

  // The two lines counter-slide. Small amounts — this should read as drift,
  // not as a carousel.
  const lineA = useTransform(scrollYProgress, [0, 1], v("-6%", "6%"));
  const lineB = useTransform(scrollYProgress, [0, 1], v("8%", "-8%"));
  const fieldY = useTransform(scrollYProgress, [0, 1], v("18%", "-18%"));

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-bubblegum py-[clamp(5rem,14vw,11rem)]"
      aria-labelledby="statement-heading"
    >
      {/* Circle field */}
      <motion.div aria-hidden style={{ y: fieldY }} className="pointer-events-none absolute inset-0 -z-10">
        <span className="breathe absolute -left-[10%] top-[4%] block h-[34vw] w-[34vw] rounded-full bg-paper/45" />
        <span className="breathe delay-1 absolute right-[2%] top-[38%] block h-[26vw] w-[26vw] rounded-full bg-paper/35" />
        <span className="breathe delay-3 absolute left-[36%] bottom-[-8%] block h-[22vw] w-[22vw] rounded-full bg-butter/45" />
      </motion.div>

      <div className="shell">
        <h2 id="statement-heading" className="t-display-xl text-ink">
          <motion.span style={{ x: lineA }} className="block">
            She has been
          </motion.span>
          <motion.span style={{ x: lineB }} className="block">
            telling you all along.
          </motion.span>
        </h2>
        <p className="t-lead mt-8 text-ink/80">
          Nothing here is a trick, and none of it needs an app. It just needs
          someone to translate.
        </p>
      </div>
    </section>
  );
}
