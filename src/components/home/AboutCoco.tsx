"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { BrandImage } from "@/components/brand/BrandImage";
import { Parallax } from "@/components/motion/Parallax";

/**
 * About Coco — the waving paw.
 *
 * An SVG paw in Coco's own colouring (fawn coat, charcoal pads — see the
 * --coco-* tokens) waves up from the lower-left corner of the photo frame,
 * rotating from a transform origin at the base of its leg (43% 99% of the
 * graphic, set on `.paw` in globals.css) rather than the centre of the box.
 * Three decaying swings on an overshoot easing, so it reads as a real wave
 * and settles instead of metronoming.
 *
 * It's positioned as a graphic at the frame edge, NOT over her shoulder as a
 * stand-in for her real foreleg — see the note at the element for why.
 *
 * Fires once when the section scrolls into view, and again on hover or tap.
 * It never loops. Re-firing works by remounting on a key rather than fighting
 * CSS animation restart rules, so it can't get stuck half-waved.
 *
 * Under `prefers-reduced-motion` the paw renders in its resting position and
 * the trigger does nothing. The section reads identically without the wave.
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
          {/*
            The frame clips the paw, so its leg is cut off cleanly by the
            photo's bottom edge instead of trailing a fawn stub onto the paper
            below it. Rounded corners live here rather than on the image.
          */}
          <div className="relative overflow-hidden rounded-4xl">
            <BrandImage
              slot="cocoAbout"
              sizes="(max-width: 1024px) 80vw, 26rem"
              className="w-full"
            />

          {/*
            The paw. Decorative, so a screen reader gets nothing extra — the
            heading and copy carry all the meaning.

            It waves up from the lower-left corner of the photo frame and
            overlaps its edge, so it reads as a deliberate brand graphic saying
            hello — not as Coco's actual foreleg.

            That's the deliberate call. Placing it over her shoulder to imitate
            a real limb looks pasted on: a flat drawn paw against a
            photographic dog never matches, and the brief's test is "charming
            rather than gimmicky". Anchored at the frame edge it's obviously
            graphic, so there's nothing to mismatch.

            Clear of her body, which sits around x 28–72% in this shot. If the
            photo is replaced, these are the only numbers to retune.
          */}
          <div
            className="pointer-events-none absolute z-10"
            style={{
              left: "var(--paw-x, -5%)",
              bottom: "var(--paw-y, -2%)",
              width: "var(--paw-w, 27%)",
            }}
          >
            <svg
              key={waveKey}
              viewBox="0 0 100 120"
              className="paw h-auto w-full"
              data-wave={armed && !reduce ? "true" : undefined}
              aria-hidden
              style={{
                // Soft cast shadow only. The paw is fawn now, so it carries its
                // own dark outline instead of a paper halo — a light halo round
                // a light paw did nothing on a light photo.
                filter: "drop-shadow(0 5px 6px rgba(33,28,26,0.35))",
              }}
            >
              {/*
                Coco is a FAWN Frenchie with charcoal pads — not a black
                silhouette. Colours come from the --coco-* illustration tokens,
                sampled from her photos.

                A French Bulldog foreleg is thick and stubby, so the leg is a
                heavy round-capped stroke rather than a thin curve, and the pad
                is wide relative to it. A dark outline keeps the fawn readable
                against a light photo.
              */}
              <g stroke="var(--coco-mask)" strokeWidth="3.5" strokeLinejoin="round">
                {/* Foreleg */}
                <path
                  d="M43 119V74c0-6 2-10 6-13"
                  fill="none"
                  stroke="var(--coco-fur)"
                  strokeWidth="30"
                  strokeLinecap="round"
                />
                {/* Shading down the inside of the leg, for a bit of form */}
                <path
                  d="M52 118V76c0-4 1-7 3-9"
                  fill="none"
                  stroke="var(--coco-fur-shade)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                {/* Pad */}
                <ellipse cx="55" cy="47" rx="29" ry="23" fill="var(--coco-fur)" />
                {/* Toes, spread across the top of the pad */}
                <ellipse cx="29" cy="27" rx="9.5" ry="11.5" fill="var(--coco-fur)" />
                <ellipse cx="47" cy="17" rx="10" ry="12.5" fill="var(--coco-fur)" />
                <ellipse cx="66" cy="17" rx="10" ry="12.5" fill="var(--coco-fur)" />
                <ellipse cx="83" cy="29" rx="9.5" ry="11.5" fill="var(--coco-fur)" />
              </g>
              {/* Charcoal centre pad and toe pads — her actual colouring */}
              <ellipse cx="55" cy="50" rx="15" ry="11" fill="var(--coco-pad)" />
              <ellipse cx="29" cy="30" rx="5" ry="6" fill="var(--coco-pad)" />
              <ellipse cx="47" cy="20" rx="5.5" ry="6.5" fill="var(--coco-pad)" />
              <ellipse cx="66" cy="20" rx="5.5" ry="6.5" fill="var(--coco-pad)" />
              <ellipse cx="83" cy="32" rx="5" ry="6" fill="var(--coco-pad)" />
            </svg>
            </div>
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
            <h2 id="about-heading" className="reveal-heading t-display-l max-w-[20ch] text-ink">
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
