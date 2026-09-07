import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
};

/**
 * Once-only entrance, driven by CSS scroll-driven animation.
 *
 * Server component — ships no JavaScript. See the `.reveal` block in
 * globals.css for why this isn't Motion: `whileInView` put `opacity: 0` into
 * the server-rendered HTML, hiding content until hydration.
 *
 * The resting state is the finished state, so anything that can't run the
 * animation (Firefox, older Safari, reduced-motion, JS disabled) shows the
 * finished content instead of a blank box.
 *
 * No stagger prop: on a scroll-driven timeline `animation-delay` is ignored
 * (offsets are expressed through `animation-range`), and each element is
 * already driven by its own position in the viewport — which staggers a list
 * naturally as you scroll past it.
 */
export function Reveal({ children, className, as: Tag = "div" }: Props) {
  return <Tag className={`reveal ${className ?? ""}`}>{children}</Tag>;
}
