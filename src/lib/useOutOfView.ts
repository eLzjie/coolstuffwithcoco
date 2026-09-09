"use client";

import { useEffect, useState } from "react";

/**
 * True once every element matching `selector` has left the viewport.
 *
 * ---------------------------------------------------------------------------
 * WHY A HOOK
 * ---------------------------------------------------------------------------
 * Two components want the same question answered. `FloatingCta` asks "are all
 * the forms and the footer off screen?" to decide whether to show a bottom
 * bar; `StickyNav` asks "has the hero's top bar scrolled away?" to decide
 * whether to show a header. Same primitive, opposite-looking features.
 *
 * Keeping it in one place also keeps the reasoning below in one place, which
 * is the part that actually matters.
 *
 * ---------------------------------------------------------------------------
 * WHY setState HERE IS FINE
 * ---------------------------------------------------------------------------
 * `react-hooks/set-state-in-effect` is an error in this repo, and rightly. It
 * catches state written during an effect's own body. This writes from an
 * IntersectionObserver callback, which the browser dispatches as its own task
 * — the same category as a click handler, not a render.
 *
 * The initial value is `false`, so the server HTML and the first paint carry
 * nothing. The observer's first callback then tells the truth about where the
 * visitor actually is, which matters on a restored scroll position.
 *
 * Returns `false` when the selector matches nothing. That is the safe
 * direction: a bar that never appears beats one pinned to the screen forever
 * because the thing it was watching does not exist on this page.
 */
export function useAllOutOfView(
  selector: string,
  /**
   * Shrinks the viewport from the bottom before deciding. A little early on
   * both edges: a bar should be gone before the thing it watches reaches the
   * very bottom of the screen, not at the moment its first pixel does.
   */
  bottomMarginPx = 80,
): boolean {
  const [outOfView, setOutOfView] = useState(false);

  useEffect(() => {
    const targets = [...document.querySelectorAll(selector)];
    if (targets.length === 0) return;

    /*
      Keyed by element rather than counted, so a duplicated callback for the
      same element cannot push a running total negative.
    */
    const visible = new Set<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setOutOfView(visible.size === 0);
      },
      { rootMargin: `0px 0px -${bottomMarginPx}px 0px`, threshold: 0 },
    );

    for (const t of targets) io.observe(t);
    return () => io.disconnect();
  }, [selector, bottomMarginPx]);

  return outOfView;
}
