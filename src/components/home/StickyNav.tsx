"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { useAllOutOfView } from "@/lib/useOutOfView";

/**
 * The home page's sticky header.
 *
 * ---------------------------------------------------------------------------
 * WHY A NAVBAR HERE AND A BOTTOM BAR ON THE LANDING PAGES
 * ---------------------------------------------------------------------------
 * `FloatingCta` works on `/decode/b` because those pages have exactly one
 * ask: this form, this guide. The home page has two guides, so a single
 * floating "Get the free guide" button would have to silently pick one, and
 * "which one" is precisely the decision the home page exists to help with.
 *
 * A header solves it instead of dodging it: the button goes to `#guides`,
 * where both are laid out side by side. It also keeps the brand on screen,
 * which a bottom CTA bar does not.
 *
 * ---------------------------------------------------------------------------
 * THIS IS NOT ON THE LANDING PAGES, DELIBERATELY
 * ---------------------------------------------------------------------------
 * The funnel plan is explicit: no top nav on `/decode` or `/vetbill`, no
 * outbound links competing with the form, and the logo there is not even a
 * link. A persistent header offering a route somewhere else is the exact
 * thing those pages are built without. Home only.
 *
 * ---------------------------------------------------------------------------
 * IT IS THE SAME BAR, FOLLOWING YOU DOWN
 * ---------------------------------------------------------------------------
 * The Hero already renders this bar at the top of the page — `BrandLockup`
 * left, one `btn-coral-sm` to `#guides` right. This is a copy of it that
 * appears once the original scrolls away, so it reads as the same bar
 * sticking rather than a second, different thing arriving.
 *
 * Which is also why it watches `#topbar` (the Hero's own bar) rather than the
 * hero section: the handover happens exactly when the real one leaves.
 *
 * No `backdrop-blur`. `FloatingCta` shipped with a blur behind a 95%-opaque
 * surface — invisible, and a full-width fixed backdrop-filter makes the
 * compositor hold a snapshot of the page behind it for as long as the page is
 * open. Opaque is cheaper and looks identical.
 */
export function StickyNav() {
  const show = useAllOutOfView("#topbar", 0);

  return (
    <div
      /*
        Fixed and slid out rather than unmounted, so the entrance can animate.
        `aria-hidden` plus `tabIndex` on the interactive children keeps an
        off-screen bar out of the accessibility tree and the tab order.

        z-30, below the consent notice's z-50 — a first-time visitor should
        answer the cookie question rather than have a nav bar sitting on top
        of it. They are at opposite edges anyway.
      */
      aria-hidden={!show}
      className={[
        "fixed inset-x-0 top-0 z-30 border-b-2 border-ink bg-paper",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        show ? "translate-y-0" : "-translate-y-full",
      ].join(" ")}
    >
      <div className="shell flex items-center justify-between gap-4 py-2.5">
        {/*
          Not a link. We are already on `/`, so a logo linking home would be a
          self-link that does nothing — and `BrandLockup`'s own note records
          that a mismatched label on that link tripped an axe rule once.
        */}
        <BrandLockup />

        <Link
          href="#guides"
          className="btn-coral btn-coral-sm min-h-11"
          tabIndex={show ? undefined : -1}
        >
          Free guides
        </Link>
      </div>
    </div>
  );
}
