"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Ball, Bone, Paw } from "@/components/brand/Icons";
import { useIsNarrow } from "@/lib/useIsNarrow";
import { usePointerTilt } from "@/lib/usePointerTilt";

/**
 * Which home arm's words to use. The scene, the motion and the LCP handling
 * are identical either way — only the copy differs, which is the whole point:
 * if B wins, the 3D stage is not a variable in the result.
 */
export type HomeArm = "a" | "b";

/*
  `headline` is an array because it is set as deliberate ragged lines, not
  wrapped. Both arms are three lines, so the block is the same height in both
  and the fold sits in the same place - nothing to re-measure.
*/
const HERO_COPY: Record<
  HomeArm,
  { headline: readonly string[]; echo: string; lead: string }
> = {
  a: {
    headline: ["Your dog is", "telling you", "something."],
    echo: "Most owners miss it.",
    lead: "I'm Coco. My person writes down the things we work out together, and gives them away.",
  },
  /*
    B leads with the introduction instead of the insight. The home page is
    becoming Coco's catch-all - guides now, products and a gallery later - and
    a page that opens by naming the problem only works while the problem is
    the only thing on it.
  */
  b: {
    /*
      Split at 10/8/8 characters, not at the natural phrase breaks.

      "Hello," / "I'm Coco" / "the Frenchie" reads better on the page but
      wrapped to FOUR lines at 1440px — the left hero column fits about 11
      characters at `t-hero`, so "the Frenchie" broke and left "the" stranded
      on a line by itself. Every line here is inside that budget, which keeps
      the block three lines at both 390 and 1440 and the same height as arm A.

      If this copy changes, count the characters. The longest line arm A ships
      is "telling you" at 11.
    */
    headline: ["Hello, I'm", "Coco the", "Frenchie"],
    echo: "This is everything I know.",
    lead: "Body language, vet bills, the weird things dogs do. My person writes down what we work out together, and shares it with fellow furparents!",
  },
};

/**
 * Direction A — "The look", staged in 3D.
 *
 * Coco head-on, eyes near the fold, looking straight at the visitor. The
 * headline flanks her in two ink columns.
 *
 * ---------------------------------------------------------------------------
 * Why this is real 3D and not a WebGL scene
 * ---------------------------------------------------------------------------
 * The scene is a CSS `perspective` container with `transform-style: preserve-3d`
 * and each layer at its own `translateZ`. The browser then does genuine
 * perspective projection on the compositor: near layers sweep further than far
 * ones because of the maths, not because we hand-tuned two different speeds.
 *
 * three.js was the alternative and it loses on all three axes that matter here:
 *  - It needs a rigged MODEL. three.js renders geometry, it doesn't create it,
 *    and there's no honest path from one PNG to a good animated Frenchie.
 *  - A bought or AI-generated model would be *a* French Bulldog, not Coco. Her
 *    exact face repeating everywhere is the brand's whole trust mechanism.
 *  - ~200KB of JS plus a multi-MB GLB, dropped on the LCP element, on paid
 *    mobile traffic with a sub-2s budget.
 * This keeps her pixel-identical and costs one small hook.
 *
 * Depth is driven by scroll (so it works on mobile, the primary view) and by
 * pointer on desktop. Both feed the same rotation, and both are transform-only.
 *
 * The h1 stays OUT of the 3D stack. It's the LCP element and must be readable
 * before anything moves — see the note at the element.
 */
export function Hero({ arm = "a" }: { arm?: HomeArm }) {
  const copy = HERO_COPY[arm];
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

  /* ---- 3D staging ------------------------------------------------------- */

  /*
    Measured cost of this scene: perf 95-96, TBT 20ms, CLS 0.

    Worth recording what the LCP number here is NOT. Home reads ~2.9s LCP, and
    the LCP element is the h1 TEXT, not Coco — Load Delay and Load Time are
    both 0ms while Render Delay is ~2.5s. That is main-thread contention from
    ~200KB of JS (React + Motion) under a 4x CPU throttle, the same trade-off
    documented in the README, and it is unchanged by this 3D staging.

    An earlier note here claimed the 3D pushed LCP from 2.1s to 2.8s and
    deferred the whole scene to an idle callback to "fix" it. That was wrong:
    the 2.1s reading predated the capture form landing on this page, so two
    changes were being compared at once. Deferring a transform on an element
    that was never the LCP element protected nothing, so it is gone.
  */
  const flat = reduce;

  // Desktop only; the hook no-ops on coarse pointers and reduced motion.
  const stageRef = useRef<HTMLDivElement>(null);
  const { x: tiltX, y: tiltY } = usePointerTilt(stageRef);

  const MAX_TILT = 7; // degrees. Past ~9 the flat cut-out reads as flat.

  // Pointer yaw/pitch. Pitch is inverted so the scene leans toward the cursor.
  const yawFromPointer = useTransform(tiltX, [-1, 1], [-MAX_TILT, MAX_TILT]);
  const pitchFromPointer = useTransform(tiltY, [-1, 1], [MAX_TILT, -MAX_TILT]);

  /*
    Scroll supplies its own pitch, which is what gives mobile the effect at
    all — there's no pointer to read there. Small: the scene should settle as
    you scroll past, not spin.
  */
  const pitchFromScroll = useTransform(
    scrollYProgress,
    [0, 1],
    off ? [0, 0] : [0, narrow ? 5 : 3],
  );

  // Both sources sum into one rotation, so they can't fight each other.
  const pitch = useTransform(
    [pitchFromPointer, pitchFromScroll] as const,
    ([p, s]: number[]) => (flat ? 0 : p + s),
  );
  const yaw = useTransform(yawFromPointer, (v) => (flat ? 0 : v));

  // Contact shadow slides opposite the yaw. This is what sells the depth —
  // without it a tilting cut-out just looks like a rotating sticker.
  const shadowX = useTransform(tiltX, [-1, 1], flat ? [0, 0] : [26, -26]);
  const shadowScale = useTransform(cocoScale, (s) => 0.72 + (1 - s) * 0.5);

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
        className="decor-layer pointer-events-none absolute inset-0 -z-20"
      >
        <span className="breathe absolute -left-[20%] top-[58%] block h-[42vw] w-[42vw] rounded-full bg-butter/40" />
        <span className="breathe delay-2 absolute -right-[16%] top-[18%] block h-[30vw] w-[30vw] rounded-full bg-sky/30" />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ y: circlesY }}
        className="decor-layer pointer-events-none absolute inset-0 -z-10"
      >
        <span className="drift absolute left-[8%] top-[70%] block h-[28vw] w-[28vw] rounded-full bg-bubblegum/35" />
        <span className="drift delay-1 absolute right-[16%] top-[62%] block h-[20vw] w-[20vw] rounded-full bg-mint/60" />
        {/*
          One piece of loose furniture, sitting in the empty space above the
          headline. Hidden below sm, where it landed on the headline itself.

          There was a second ball at right-[8%] — removed: with the wider Coco
          and the right-hand column it sat directly on top of "miss it.", and
          the scroll cue below already has a spinning ball, so it was
          duplicating a mark rather than adding one.
        */}
        <Bone aria-hidden className="drift delay-3 absolute left-[6%] top-[26%] hidden h-8 w-8 text-ink/15 sm:block" />
      </motion.div>

      {/* ---- Top bar ----
        `id` so `StickyNav` can watch it: the sticky header appears exactly
        when this one scrolls out of view, which is what makes it read as the
        same bar sticking rather than a second one arriving.
      */}
      <div
        id="topbar"
        className="rise rise-1 shell relative z-20 flex items-center justify-between py-6"
      >
        {/*
          The href follows the arm. Pointing it at "/" from /b would walk the
          visitor out of the arm they were sent to and into a page whose guide
          buttons go to A — a silent leak that would show up as B
          underperforming for no reason anyone could see.
        */}
        <BrandLockup href={arm === "b" ? "/b" : "/"} />
        <Link href="#guides" className="btn-coral btn-coral-sm">
          Free guides
        </Link>
      </div>

      {/* ---- Fold ----
        `perspective` here is what makes the translateZ layers below project
        properly. 1400px is a long lens: enough divergence to read as depth,
        not so wide that a flat cut-out shows its edges.
      */}
      <div
        ref={stageRef}
        style={{ perspective: "1400px" }}
        className="shell relative grid min-h-[78svh] grid-cols-1 items-center gap-6 pb-16 lg:min-h-[84svh] lg:grid-cols-[1fr_auto_0.8fr]"
      >
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
          {copy.headline.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </motion.h1>

        {/*
          Coco's 3D stage. Three nested elements, each with one job — one
          element can't hold a CSS entrance, a scroll transform and a 3D
          rotation without them overwriting each other's `transform`.

            outer  CSS entrance (.rise)
            mid    the rotation, and preserve-3d so translateZ works inside
            inner  scroll pull-back
        */}
        <div className="rise rise-2 relative z-0 mx-auto w-[min(90vw,34rem)] lg:col-start-2 lg:w-[min(42vw,40rem)]">
          <motion.div
            style={{
              rotateX: pitch,
              rotateY: yaw,
              // preserve-3d is what promotes the layer, so it stays off too.
              transformStyle: flat ? undefined : "preserve-3d",
              willChange: flat ? undefined : "transform",
            }}
          >
            {/*
              Ground shadow, pushed BEHIND her on the Z axis. It slides against
              the yaw, which is the cue that actually sells the depth — a
              tilting cut-out with a static shadow just reads as a rotating
              sticker. Decorative, so hidden from assistive tech.
            */}
            <motion.div
              aria-hidden
              style={{
                x: shadowX,
                scaleX: shadowScale,
                translateZ: flat ? 0 : -60,
              }}
              className="pointer-events-none absolute bottom-[6%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-[50%] bg-ink/25 blur-xl"
            />

            <motion.div
              style={{
                scale: cocoScale,
                y: cocoY,
                // Forward of the shadow and the circle washes, so perspective
                // gives her more parallax travel than the background.
                translateZ: flat ? 0 : 40,
              }}
            >
              {/*
                No rounded frame or crop: the render has a clean transparent
                ground, so she reads better sitting straight on the paper than
                boxed in — and the transparency is what lets the layers behind
                her show through as depth.
              */}
              <BrandImage
                slot="cocoHero"
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="w-full"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Right column — the turn */}
        <div className="rise rise-3 relative z-10 lg:col-start-3 lg:justify-self-end lg:text-right">
          <motion.div style={{ y: wordsY }}>
            <p className="t-hero-echo text-ink lg:ml-auto">{copy.echo}</p>
            <p className="t-lead mt-5 text-ink-muted lg:ml-auto lg:text-right">
              {copy.lead}
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
