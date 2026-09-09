import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Footer } from "@/components/layout/Footer";
import { Paw } from "@/components/brand/Icons";
import { DECODE, VETBILL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "That page isn't here",
  /*
    A 404 must never be indexed. Next returns the correct 404 status, but the
    metadata is belt-and-braces — a soft-404 in the index is worse than none.
  */
  robots: { index: false, follow: false },
};

/**
 * The 404 page.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS REPLACES
 * ---------------------------------------------------------------------------
 * Nothing — there was no `not-found.tsx`, so every mistyped URL and every
 * stale ad link got Next's built-in fallback: unstyled black-on-white, the
 * words "This page could not be found", no nav, no footer, no route back.
 *
 * That matters more than it looks on a site whose traffic is paid. A dead ad
 * link, a truncated URL in a DM, an old path someone bookmarked — each one is
 * a visitor who was interested enough to click and got a blank page.
 *
 * ---------------------------------------------------------------------------
 * SO IT IS A ROUTER, NOT AN APOLOGY
 * ---------------------------------------------------------------------------
 * The job is to get someone to the thing they were probably after. Both guides
 * are named and linked, because "go home and find it yourself" wastes the one
 * click of intent we have. No joke about a dog eating the page — the brand is
 * dry, and someone who has just hit a dead end wants the exit, not a gag.
 *
 * Server component. Static, no JS.
 */
export default function NotFound() {
  return (
    <>
      <main id="main">
        <section className="bg-butter">
          <div className="shell py-5">
            <BrandLockup />
          </div>

          <div className="shell pb-14 pt-4">
            <Paw aria-hidden className="mb-6 h-9 w-9 text-ink" />

            <h1 className="t-display-l max-w-[24ch] text-ink">
              That page isn&apos;t here.
            </h1>

            <p className="t-lead mt-4 max-w-[44ch] text-ink/85">
              Either the link was wrong or we moved something. Both guides are
              free and still where they should be:
            </p>

            {/*
              The two lead magnets, named. A generic "back to home" button
              would technically resolve the dead end and waste the click.
            */}
            <ul className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
              <li>
                <Link
                  href="/decode"
                  className="block h-full rounded-2xl border-2 border-ink bg-paper p-5 transition-colors hover:bg-paper-warm"
                >
                  <span className="t-h3 block text-ink">{DECODE.title}</span>
                  <span className="t-small mt-1.5 block text-ink-muted">
                    {DECODE.subhook}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/vetbill"
                  className="block h-full rounded-2xl border-2 border-ink bg-paper p-5 transition-colors hover:bg-paper-warm"
                >
                  <span className="t-h3 block text-ink">{VETBILL.title}</span>
                  <span className="t-small mt-1.5 block text-ink-muted">
                    {VETBILL.subhook}
                  </span>
                </Link>
              </li>
            </ul>

            <p className="t-small mt-8 text-ink-muted">
              Or start from{" "}
              <Link
                href="/"
                className="underline decoration-2 underline-offset-4"
              >
                the beginning
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      {/*
        Full footer, not `bare`. The hotlines live in it, and someone who
        landed here from a shared Vet Bill link may be the person who needs
        them — a dead end is the worst place to hide a phone number.
      */}
      <Footer />
    </>
  );
}
