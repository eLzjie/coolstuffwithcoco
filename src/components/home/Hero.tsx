"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { BrandImage } from "@/components/brand/BrandImage";
import { Ball, Bone, Paw } from "@/components/brand/Icons";
import { useIsNarrow } from "@/lib/useIsNarrow";

/**
 * Direction A — "The look".
 *
 * Coco head-on, eyes near the fold, looking straight at the visitor. The
 * headline flanks her in two ink columns.
 *
 * The scroll move is a PULL-BACK, not a pan: she scales down and settles into
 * the page while the pastel circle substrate rises past her. A French Bulldog
 * is compact — there's no body length to pan down — so the camera retreats
 * instead. Her face is the asset.
 *
 * This is also the page's one orchestrated load sequence. Nothing else above
 * the fold animates, and the headline is readable before anything moves.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const narrow = useIsNarrow();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  /*
    Mobile is the primary view, so the pull-back runs there too. `narrow` is
    kept only to soften the travel a little on small screens — a phone viewport
    is much shorter, so the same percentages read as a much faster move.
  */
  const off = reduce;
  const depth = narrow ? 0.6 : 1;

  // Every value below animates `transform` only, so it all stays on the
  // compositor. `pc` scales the travel down on short phone viewports.
  const pc = (v: number) => (off ? "0%" : `${v * depth}%`);

  // The pull-back. Scale and lift only.
  const cocoScale = useTransform(
    scrollYProgress,
    [0, 1],
    off ? [1, 1] : [1, narrow ? 0.9 : 0.82],
  );
  const cocoY = useTransform(scrollYProgress, [0, 1], ["0%", pc(-12)]);

  // Substrate rises faster than she shrinks, which reads as depth.
  const circlesY = useTransform(scrollYProgress, [0, 1], ["0%", pc(-48)]);
  const circlesFar = useTransform(scrollYProgress, [0, 1], ["0%", pc(-24)]);

  // Headline drifts with the scroll so it separates from her.
  const wordsY = useTransform(scrollYProgress, [0, 1], ["0%", pc(22)]);

  /*
    The load sequence is CSS (see `.rise` in globals.css), not Motion.

    It used to be Motion `initial`/`animate`, which gated the hero's first
    paint on hydration and cost 2.35s of LCP render delay. CSS keyframes run
    on first paint with no JS dependency, and `prefers-reduced-motion` is
    handled in the stylesheet.

    Motion is still doing all the scroll work below — that only matters after
    the fold has been read.
  */

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-paper"
      aria-labelledby="hero-heading"
    >
      {/* ---- Circle substrate. Decorative, sits behind everything. ---- */}
      <motion.div
        aria-hidden
        style={{ y: circlesFar }}
        className="pointer-events-none absolute inset-0 -z-20"
      >
        <span className="breathe absolute -left-[20%] top-[58%] block h-[42vw] w-[42vw] rounded-full bg-butter/40" />
        <span className="breathe delay-2 absolute -right-[16%] top-[18%] block h-[30vw] w-[30vw] rounded-full bg-sky/30" />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ y: circlesY }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <span className="drift absolute left-[8%] top-[70%] block h-[28vw] w-[28vw] rounded-full bg-bubblegum/35" />
        <span className="drift delay-1 absolute right-[16%] top-[62%] block h-[20vw] w-[20vw] rounded-full bg-mint/60" />
        {/*
          Loose brand furniture, sparse and slow. Hidden below sm — on a 390px
          viewport these landed on top of the headline and clipped at the
          edges, and the hero is already busy enough there.
        */}
        <Bone aria-hidden className="drift delay-3 absolute left-[6%] top-[26%] hidden h-8 w-8 text-ink/15 sm:block" />
        <Ball aria-hidden className="bob delay-2 absolute right-[8%] top-[46%] hidden h-7 w-7 text-coral/50 sm:block" />
      </motion.div>

      {/* ---- Top bar ---- */}
      <div className="rise rise-1 shell relative z-20 flex items-center justify-between py-6">
        {/*
          No aria-label here on purpose: the logo image's alt already names the
          link, and an aria-label that doesn't contain the visible text trips
          axe's label-content-name-mismatch rule (the placeholder box renders
          visible descriptive text while assets are pending).
        */}
        <Link href="/" className="flex items-center gap-2">
          <BrandImage slot="logoHorizontal" className="h-9 w-auto" sizes="180px" />
        </Link>
        <Link href="#guides" className="btn-coral btn-coral-sm">
          Free guides
        </Link>
      </div>

      {/* ---- Fold ---- */}
      <div className="shell relative grid min-h-[78svh] grid-cols-1 items-center gap-6 pb-16 lg:min-h-[84svh] lg:grid-cols-[1.2fr_auto_0.9fr]">
        {/* Left column of the headline */}
        {/*
          NO entrance animation on the h1. It's the LCP element and the brief
          requires it readable before anything moves. Motion is only supplying
          the scroll drift here, which starts once the visitor scrolls.
        */}
        <motion.h1
          id="hero-heading"
          style={{ y: wordsY }}
          className="t-hero relative z-10 text-ink lg:col-start-1"
        >
          Your dog is
          <br />
          telling you
          <br />
          something.
        </motion.h1>

        {/* Coco. Outer div owns the CSS entrance, inner owns the scroll
            transform — one element can't hold both without them fighting. */}
        <div className="rise rise-2 relative z-0 mx-auto w-[min(78vw,30rem)] lg:col-start-2 lg:w-[min(34vw,32rem)]">
          <motion.div
            style={{ scale: cocoScale, y: cocoY, willChange: off ? undefined : "transform" }}
          >
            <BrandImage
              slot="cocoHero"
              priority
              sizes="(max-width: 1024px) 78vw, 34vw"
              className="w-full rounded-4xl object-cover"
            />
          </motion.div>
        </div>

        {/* Right column — the turn */}
        <div className="rise rise-3 relative z-10 lg:col-start-3 lg:justify-self-end lg:text-right">
          <motion.div style={{ y: wordsY }}>
            <p className="t-hero-echo text-ink lg:ml-auto">Most owners miss it.</p>
            <p className="t-lead mt-5 text-ink-muted lg:ml-auto lg:text-right">
              I&apos;m Coco. My person writes down the things we work out
              together, and gives them away.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ---- Scroll cue. Icon only — the copy that was here read as filler. ---- */}
      <div className="rise rise-4 shell relative z-20 flex items-center gap-3 pb-10">
        <Ball aria-hidden className="spin-slow h-7 w-7 text-coral" />
        <Paw aria-hidden className="bob ml-auto hidden h-6 w-6 text-ink/20 sm:block" />
      </div>
    </section>
  );
}
