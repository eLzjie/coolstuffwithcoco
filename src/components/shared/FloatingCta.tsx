"use client";

import { useAllOutOfView } from "@/lib/useOutOfView";

type Props = {
  /** Where the button goes. An in-page anchor, e.g. `#get`. */
  href?: string;
  label?: string;
  /**
   * CSS selector for the elements whose visibility hides the bar — every
   * capture section on the page.
   *
   * A selector rather than an id, because a page with a form above the fold
   * AND a repeat form at the bottom has two of them, and ids can't be shared.
   * Pass `"#get, #get-repeat"` for that shape.
   */
  watch?: string;
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
 *  - EVERY CAPTURE SECTION, matched by selector. If a real form is on screen,
 *    a floating button pointing at one is noise. This is also what keeps the
 *    bar off the consent line: the build spec requires that copy visible
 *    before submit, and the bar cannot cover it because the bar is gone
 *    whenever a form is in view.
 *
 *    A selector and not an id, because the variant pages have TWO forms — one
 *    above the fold and a repeat at the bottom. Watching only the first one
 *    put the bar squarely over the second one's consent line, which is the
 *    single thing this component was told not to do.
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
 * The observer itself lives in `lib/useOutOfView.ts`, shared with StickyNav
 * — including why writing state from an IntersectionObserver callback does
 * not trip `react-hooks/set-state-in-effect`.
 */
export function FloatingCta({
  href = "#get",
  label = "Get the free guide",
  watch = "#get",
}: Props) {
  /*
    The footer is appended to whatever the caller passed. Every page has one,
    and no page should have to remember to opt into not covering its own
    hotline numbers.
  */
  const show = useAllOutOfView(`${watch}, footer`);

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
        /*
          Opaque, and NO backdrop-blur.

          This shipped as `bg-paper/95 backdrop-blur-sm`, which is a blur
          behind a 95%-opaque surface — invisible, and not free: a
          backdrop-filter on a full-width fixed element makes the compositor
          keep a snapshot of everything behind it for the life of the page,
          whether the bar is on screen or translated away.

          Lighthouse on /decode/b showed 89% of LCP as render delay (3.6s)
          with zero load time, against 36% on the control. This was the only
          always-present new element with a compositing cost. Removing it cost
          nothing visually, because there was nothing to see.
        */
        "fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper",
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
