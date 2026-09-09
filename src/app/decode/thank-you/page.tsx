import type { Metadata } from "next";
import Link from "next/link";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LibraryOffer } from "@/components/offer/LibraryOffer";
import { SHOW_ON_PAGE_DOWNLOAD } from "@/lib/content/library";
import { Footer } from "@/components/layout/Footer";
import { DECODE } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Your guide is on its way",
  robots: { index: false, follow: false },
};

/**
 * /decode thank-you — inbox first, offer second.
 *
 * ---------------------------------------------------------------------------
 * THE CONFIRMATION BAND IS DELIBERATELY SHORT
 * ---------------------------------------------------------------------------
 * It used to be a full-height hero with an 18rem cover image, which pushed the
 * offer past roughly 1700px on a 390px phone — into the tail of the page where
 * attention has collapsed. So: no section-pad, a smaller cover, and the offer
 * starts inside the second screenful. If you add anything above LibraryOffer,
 * measure the offset again.
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
export default function DecodeThankYou() {
  const url = process.env.NEXT_PUBLIC_GUIDE_DECODE_URL;

  return (
    <>
      <main id="main">
        <section className="bg-bubblegum">
          <div className="shell py-5">
            <BrandLockup />
          </div>

          <div className="shell grid items-center gap-6 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div>
              <h1 className="t-display-l max-w-[22ch] text-ink">
                Check your inbox.
              </h1>

              <p className="t-lead mt-4 max-w-[46ch] text-ink/85">
                {DECODE.title} is on its way from Coco right now — twelve pages
                on what she&apos;s actually telling you.
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
                slot="coverDecode"
                sizes="(max-width: 1024px) 46vw, 14rem"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </section>

        <LibraryOffer magnet="decode" />
      </main>

      <Footer bare />
    </>
  );
}
