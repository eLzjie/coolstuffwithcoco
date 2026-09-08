"use client";

import { useEffect } from "react";
import {
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * Pointer-driven tilt for a 3D hero.
 *
 * Returns spring-smoothed motion values, NOT React state. A pointermove
 * handler calling setState would re-render the tree on every mouse event;
 * motion values write straight to the compositor and never re-render.
 *
 * Disabled for `prefers-reduced-motion` and for coarse pointers — a phone has
 * no hover, and listening for pointermove there just burns battery. Mobile
 * gets its depth from the scroll-driven rotation instead, which is where the
 * primary audience actually sees it.
 *
 * Values are normalised to roughly -1..1 from the element's centre, so the
 * caller decides how many degrees that's worth.
 */
export function usePointerTilt<T extends HTMLElement>(
  /**
   * The element to measure against. Owned by the caller rather than returned
   * from here: returning a ref alongside motion values means the caller does
   * member access on a ref-bearing object during render, which React's
   * compiler rules (correctly) reject.
   */
  ref: React.RefObject<T | null>,
  opts?: {
    /** Spring stiffness. Lower = laggier, more "heavy". */
    stiffness?: number;
    damping?: number;
  },
): { x: MotionValue<number>; y: MotionValue<number> } {
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const spring = { stiffness: opts?.stiffness ?? 90, damping: opts?.damping ?? 18 };
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);

  useEffect(() => {
    if (reduce) return;

    // No hover on touch, so there's nothing to track.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const onMove = (e: PointerEvent) => {
      // Coalesce to one read per frame; pointermove can fire far faster.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
        rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
      });
    };

    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, reduce, rawX, rawY]);

  return { x, y };
}
