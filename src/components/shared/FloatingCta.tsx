"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Where the button goes. An in-page anchor, e.g. `#get`. */
  href?: string;
  label?: string;
  /**
   * The element whose visibility hides the bar — the capture section. Passed
   * as an id so this component never needs a ref threaded down through a
   * server-rendered page.
   */
  watchId?: string;
};

/**
 * The floating call-to-action. Chase asked for "a dynamic floating CTA".
 *
 * ---------------------------------------------------------------------------
 * WHY IT NEEDS TO EXIST
 * ---------------------------------------------------------------------------
 * The form is at the bottom of the page. Above the fold there are two links
 * that jump 5,000px down to it. Between those two points a visitor scrolling
 * through the content has no way to act on it — they have to remember there
 * was a button, scroll back, or reach the end. Chase: "I would click out."
 *
 * ---------------------------------------------------------------------------
 * WHEN IT HIDES, AND WHY EACH CASE MATTERS
 * ---------------------------------------------------------------------------
 * Two elements suppress it, both observed by one IntersectionObserver:
 *
 *  - THE CAPTURE SECTION. If the real form is on screen, a floating button
 *    pointing at it is noise. This is also what keeps the bar off the consent
 *    line: the build spec requires that copy visible before submit, and the
 *    bar cannot cover it because the bar is gone whenever it's in view.
 *
 *  - THE FOOTER. The hotline numbers live down there. A fixed bar sitting over
 *    (888) 426-4435 while someone tries to read it in a panic is the single
 *    worst thing this component could do, so the footer hides it too. Selected
 *    by tag rather than id — `<footer>` is unambiguous and it means no page
 *    has to add an attribute to be safe.
 *
 * Not hidden after a successful submit. The guide forms redirect to the
 * thank-you page ~1.2s after success, so the window where the bar could point
 * at a success panel is about a second long and ends in a navigation. Add it
 * if a form ever succeeds without navigating — `useRecentCapture` is the hook,
 * and it would need a real `subscribe` to fire mid-page.
 *
 * ---------------------------------------------------------------------------
 * WHY setState HERE IS FINE
 * ---------------------------------------------------------------------------
 * `react-hooks/set-state-in-effect` is an error in this repo, and rightly. It
 * catches state written during an effect's own body. This writes from an
 * IntersectionObserver callback, which the browser dispatches as its own task
 * — the same category as a click handler, not a render.
 *
 * The initial state is `false` (hidden), so the server HTML and first paint
 * carry no bar. The observer's first callback then tells the truth about where
 * the visitor actually is, which matters on a restored scroll position.
 */
export function FloatingCta({
  href = "#get",
  label = "Get the free guide",
  watchId = "get",
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const targets = [
      document.getElementById(watchId),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    /*
      One observer, several targets, and the decision is "is ANY of them on
      screen". `visible` is keyed by element rather than counted, so a
      duplicated callback for the same element can't push the count negative.
    */
    const visible = new Set<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setShow(visible.size === 0);
      },
      /*
        A little early on both edges: the bar should be gone before the form's
        heading reaches the bottom of the screen, not at the moment its first
        pixel does.
      */
      { rootMargin: "0px 0px -80px 0px", threshold: 0 },
    );

    for (const t of targets) io.observe(t);
    return () => io.disconnect();
  }, [watchId]);

  return (
    <div
      /*
        Slid out of view rather than unmounted, so the exit can animate. It's
        `position: fixed`, so an off-screen bar costs no layout and can't be
        scrolled to — but it IS still in the accessibility tree and the tab
        order, hence `aria-hidden` here and `tabIndex` on the link.
      */
      aria-hidden={!show}
      className={[
        "fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper/95 backdrop-blur-sm",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        show ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="shell flex items-center justify-between gap-4 py-3">
        {/*
          A reason, not just a button. The bar interrupts, so it should say
          something the visitor didn't already know — the price is the strongest
          thing we have and it's zero.
        */}
        <p className="t-small hidden font-semibold text-ink sm:block">
          Free. One email, no card.
        </p>

        <a
          href={href}
          /* min-h-11 = 44px, the minimum comfortable tap target. */
          className="btn-coral min-h-11 w-full justify-center sm:w-auto"
          /*
            Not focusable while off screen. Without this, tabbing from the top
            of the page lands on an invisible button and the focus ring appears
            over nothing.
          */
          tabIndex={show ? undefined : -1}
        >
          {label}
        </a>
      </div>
    </div>
  );
}
