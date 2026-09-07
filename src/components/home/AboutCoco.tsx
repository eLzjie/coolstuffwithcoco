"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { BrandImage } from "@/components/brand/BrandImage";
import { Parallax } from "@/components/motion/Parallax";

/**
 * About Coco — the waving paw.
 *
 * Approach: an SVG paw overlaid on the real photo, rotating from a transform
 * origin at the shoulder (43% 99% of the graphic — the base of the foreleg —
 * set on `.paw` in globals.css) rather than the centre of the box. Three
 * decaying swings on an overshoot easing, so it reads as a real wave and
 * settles, instead of metronoming.
 *
 * Fires once when the section scrolls into view, and again on hover or tap.
 * It never loops.
 *
 * Re-firing is done by remounting on a key rather than fighting CSS animation
 * restart rules — simpler and it can't get stuck half-waved.
 *
 * Under `prefers-reduced-motion` the paw renders in its resting position and
 * the trigger does nothing. The section reads identically without the wave.
 *
 * NOTE: the paw is positioned for the photo described in the manifest —
 * Coco seated, body angled, left foreleg clear of her body. If Ash's shot is
 * framed differently, adjust `--paw-x` / `--paw-y` below rather than the SVG.
 */
export function AboutCoco() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const [taps, setTaps] = useState(0);

  // Derived, not mirrored into an effect: scrolling into view arms the first
  // wave, and each tap remounts the SVG to replay it. No cascading render.
  const armed = !reduce && (inView || taps > 0);
  const waveKey = taps + (inView ? 1 : 0);

  const wave = () => {
    if (reduce) return;
    setTaps((t) => t + 1);
  };

  return (
    <section className="section-pad bg-paper" aria-labelledby="about-heading">
      <div className="shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ---- Photo + paw ---- */}
        <div
          ref={ref}
          className="relative mx-auto w-[min(80vw,26rem)]"
          onMouseEnter={wave}
          onClick={wave}
        >
          <BrandImage
            slot="cocoAbout"
            sizes="(max-width: 1024px) 80vw, 26rem"
            className="w-full rounded-4xl"
          />

          {/*
            The paw. Decorative — the heading and copy carry all the meaning,
            so a screen reader gets nothing extra here.
          */}
          <div
            className="pointer-events-none absolute"
            style={{ left: "var(--paw-x, 4%)", top: "var(--paw-y, 46%)", width: "34%" }}
          >
            <svg
              key={waveKey}
              viewBox="0 0 100 120"
              className="paw h-auto w-full"
              data-wave={armed && !reduce ? "true" : undefined}
              aria-hidden
              style={{
                // Paper halo, so the ink paw separates from a dark or busy photo
                filter:
                  "drop-shadow(0 0 3px var(--color-paper)) drop-shadow(0 0 3px var(--color-paper)) drop-shadow(0 4px 0 rgba(33,28,26,0.15))",
              }}
            >
              {/*
                A French Bulldog foreleg is thick and stubby, so the leg is a
                heavy round-capped stroke rather than a thin curve, and the pad
                is wide relative to it. Drawn as one silhouette so the halo
                above doesn't seam between shapes.
              */}
              <path
                d="M43 119V74c0-6 2-10 6-13"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="30"
                strokeLinecap="round"
              />
              {/* Pad */}
              <ellipse cx="55" cy="47" rx="29" ry="23" fill="var(--color-ink)" />
              {/* Toes, spread across the top of the pad */}
              <ellipse cx="29" cy="27" rx="9.5" ry="11.5" fill="var(--color-ink)" />
              <ellipse cx="47" cy="17" rx="10" ry="12.5" fill="var(--color-ink)" />
              <ellipse cx="66" cy="17" rx="10" ry="12.5" fill="var(--color-ink)" />
              <ellipse cx="83" cy="29" rx="9.5" ry="11.5" fill="var(--color-ink)" />
              {/* Coral pad marking — the one flash of accent on the whole photo */}
              <ellipse cx="55" cy="48" rx="16" ry="12" fill="var(--color-coral)" />
            </svg>
          </div>

          {!reduce && (
            <p className="t-small mt-3 text-center text-ink-muted">
              Give her a tap. She&apos;ll do it again.
            </p>
          )}
        </div>

        {/* ---- Copy ---- */}
        <div>
          <Parallax speed={0.05}>
            <h2 id="about-heading" className="t-display-l max-w-[20ch] text-ink">
              She&apos;s the reason any of this exists.
            </h2>
          </Parallax>

          <div className="t-body mt-6 space-y-4 text-ink/80">
            <p>
              Coco came home four years ago and immediately started doing things
              I couldn&apos;t explain. The staring. The sudden 9pm laps of the
              sofa. The way she&apos;d turn her back on people she actually
              liked.
            </p>
            <p>
              So I started writing it down — what she did, what I tried, what a
              vet or a trainer told me later. Some of it I got wrong for
              embarrassingly long. Most of it turned out to be a dog being
              completely reasonable in a language I hadn&apos;t learned yet.
            </p>
            <p>
              The guides are that notebook, tidied up. They&apos;re free because
              the version of me who needed them wasn&apos;t going to pay for
              them.
            </p>
          </div>
          {/* TODO(Eli): verify — I've written "four years" and the origin story
              from the brief's framing. Swap in the real timeline and details. */}
        </div>
      </div>
    </section>
  );
}
