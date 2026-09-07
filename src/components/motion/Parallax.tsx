"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useIsNarrow } from "@/lib/useIsNarrow";

type Props = {
  children: ReactNode;
  /**
   * How far the layer drifts across its full pass through the viewport, in
   * viewport-height units. Negative moves against the scroll (feels closer),
   * positive moves with it (feels further away).
   */
  speed?: number;
  className?: string;
  /**
   * Whether the drift runs below 768px. ON by default — mobile is the primary
   * view for this site, so the motion has to be there rather than being a
   * desktop-only garnish. Opt a layer out with `onMobile={false}` if it ever
   * measurably costs frames.
   */
  onMobile?: boolean;
};

/**
 * Transform-only, compositor-friendly parallax layer.
 *
 * Only `transform` is animated, so this stays on the compositor and never
 * triggers layout or paint. Disabled under `prefers-reduced-motion`, where
 * children render in their resting position.
 */
export function Parallax({ children, speed = 0.15, className, onMobile = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const narrow = useIsNarrow();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const off = reduce || (narrow && !onMobile);
  const distance = speed * 100;

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    off ? ["0%", "0%"] : [`${-distance}%`, `${distance}%`],
  );

  return (
    <motion.div ref={ref} style={{ y, willChange: off ? undefined : "transform" }} className={className}>
      {children}
    </motion.div>
  );
}
