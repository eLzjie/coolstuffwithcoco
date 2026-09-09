import type { Metadata } from "next";
import Link from "next/link";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LibraryOffer } from "@/components/offer/LibraryOffer";
import { SHOW_ON_PAGE_DOWNLOAD } from "@/lib/content/library";
import { Footer } from "@/components/layout/Footer";
import { HOTLINES, VETBILL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Your guide is on its way",
  robots: { index: false, follow: false },
};

/**
 * /vetbill thank-you — delivery first, offer second.
 *
 * Same structure as the Decode thank-you page: a short confirmation band so
 * the offer starts inside the second screenful, and email-only delivery.
 *
 * ---------------------------------------------------------------------------
 * WHAT DIFFERS HERE, AND WHY IT MUST
 * ---------------------------------------------------------------------------
 * The reader of THIS guide may be someone with a poorly dog right now. That
 * changes the order of things:
 *
 *  - The poison-control numbers appear on this page, above the offer, with
 *    their per-incident fees. Someone who came here worried should not have to
 *    scroll past a sales section to find a phone number. The fee is stated
 *    because we are handing these to someone who may dial immediately, and a
 *    surprise charge in that moment would be our doing.
 *  - The offer bridge points at the Paperwork Pack, not a behaviour guide. It
 *    is the honest sequel: the most-used page of this guide is the fill-in
 *    emergency page, and the Pack is the rest of that. Pitching a separation
 *    anxiety guide to someone who just downloaded emergency cost ranges would
 *    be a non-sequitur at best.
 *  - Nothing added to this page may read as clinical advice. There is still no
 *    veterinary sign-off on any of this content.
 *
 * ---------------------------------------------------------------------------
 * EMAIL-ONLY. THE DOWNLOAD IS ONE BOOLEAN AWAY.
 * ---------------------------------------------------------------------------
 * Chase: "let's make them check their email — that's the point of getting them
 * to opt in", and "let's just do a generic check-your-email sort of
 * situation". So this page no longer carries the guide.
 *
 * That reverses the build spec's de-risking move. The full quote and the
 * reasoning both ways live on SHOW_ON_PAGE_DOWNLOAD in
 * lib/content/library.ts — read it before changing anything here, and watch
 * the bounce rate for the first 48 hours.
 *
 * The download branch below is kept rather than deleted so the revert is that
 * one constant. NEXT_PUBLIC_GUIDE_*_URL stays set for the same reason (the
 * delivery emails hardcode the PDF links, so nothing else depends on it).
 *
 * What replaced the download is NOT nothing: a "didn't arrive?" path pointing
 * at the promotions tab and /contact. On a days-old sending domain some of
 * these emails will land badly, and the person that happens to needs somewhere
 * to go that isn't the back button.
 */
export default function VetBillThankYou() {
  const url = process.env.NEXT_PUBLIC_GUIDE_VETBILL_URL;

  return (
    <>
      <main id="main">
        <section className="bg-sky">
          <div className="shell py-5">
            <BrandLockup />
          </div>

          <div className="shell grid items-center gap-6 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div>
              <h1 className="t-display-l max-w-[22ch] text-ink">
                Check your inbox.
              </h1>

              <p className="t-lead mt-4 max-w-[46ch] text-ink/85">
                {VETBILL.title} is on its way from Coco right now — what&apos;s
                urgent, what it costs, and the five you can head off.
              </p>

              {/*
                The promotions-tab nudge earns its place: the sending domain is
                days old, and asking someone to drag the email across is the
                single cheapest thing that improves whether the NEXT one
                arrives.
              */}
              <p className="t-body mt-4 max-w-[46ch] text-ink/85">
                If it&apos;s not there in a minute or two, check your
                promotions tab — and dragging it into your main inbox genuinely
                helps Coco reach you next time.
              </p>

              {SHOW_ON_PAGE_DOWNLOAD && url && (
                <div className="mt-6">
                  <a
                    href={url}
                    className="btn-coral inline-flex min-h-11 items-center"
                    target="_blank"
                    rel="noopener"
                  >
                    Or grab it here now
                  </a>
                </div>
              )}

              {/* Somewhere to go that isn't the back button. */}
              <p className="t-small mt-5 max-w-[46ch] text-ink-muted">
                Still nothing after a few minutes?{" "}
                <Link
                  href="/contact"
                  className="underline decoration-2 underline-offset-4"
                >
                  Tell us and we&apos;ll send it straight over
                </Link>
                .
              </p>
            </div>

            <div className="mx-auto w-[min(46vw,12rem)] lg:w-[min(30vw,14rem)]">
              <BrandImage
                slot="coverVetbill"
                sizes="(max-width: 1024px) 46vw, 14rem"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </section>

        {/*
          Hotlines ABOVE the offer, deliberately.

          Someone who downloaded this guide may have a poorly dog right now.
          They must not have to scroll past a pitch to reach a phone number,
          and the fee has to be visible before they dial.
        */}
        {HOTLINES.length > 0 && (
          <section
            className="border-y-2 border-ink bg-butter py-7"
            aria-labelledby="urgent-heading"
          >
            <div className="shell">
              <h2 id="urgent-heading" className="t-h3 text-ink">
                If something is wrong right now, don&apos;t read — ring.
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {HOTLINES.map((h) => (
                  <li key={h.name}>
                    <a
                      href={`tel:${h.number.replace(/[^+\d]/g, "")}`}
                      className="t-h3 inline-flex min-h-11 items-center underline decoration-2 underline-offset-4"
                    >
                      {h.number}
                    </a>
                    <span className="block font-semibold text-ink">
                      {h.name}
                    </span>
                    <span className="t-small block font-semibold text-ink">
                      {h.fee}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="t-small mt-4 max-w-[62ch] text-ink/80">
                Or your own vet, or your nearest out-of-hours clinic. That call
                is always the right move and asking never costs you anything.
              </p>
            </div>
          </section>
        )}

        <LibraryOffer magnet="vetbill" />
      </main>

      <Footer bare />
    </>
  );
}
