import type { Metadata } from "next";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LibraryOffer } from "@/components/offer/LibraryOffer";
import { Footer } from "@/components/layout/Footer";
import { DECODE } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Your guide is on its way",
  robots: { index: false, follow: false },
};

/**
 * /decode thank-you — delivery first, offer second.
 *
 * ---------------------------------------------------------------------------
 * THIS PAGE IS THE DELIVERY MECHANISM, NOT A RECEIPT
 * ---------------------------------------------------------------------------
 * The sending domain is days old and a forward test landed in spam, so the
 * whole de-risking strategy is that the guide is downloadable HERE. The email
 * is redundancy.
 *
 * Which is why the copy no longer opens with "it's in your inbox". That framing
 * points at the least reliable channel we have and invites someone to close the
 * tab and go looking in an inbox the guide may never reach. Download now,
 * email as backup, in that order — and said in that order.
 *
 * ---------------------------------------------------------------------------
 * THE CONFIRMATION BAND IS DELIBERATELY SHORT
 * ---------------------------------------------------------------------------
 * It used to be a full-height hero with an 18rem cover image, which pushed the
 * offer past roughly 1700px on a 390px phone — into the tail of the page where
 * attention has collapsed. Download-first and offer-visible are not in
 * conflict; they only conflict if the confirmation block is padded out.
 *
 * So: no section-pad, a smaller cover, and the offer starts inside the second
 * screenful. If you add anything above LibraryOffer, measure the offset again.
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
                Here it is — grab it now.
              </h1>

              {/*
                The instruction, not the reassurance. "Save it to your phone"
                is the thing that makes this guide useful later, and it's also
                the thing that makes the email irrelevant if it goes astray.
              */}
              <p className="t-lead mt-4 max-w-[46ch] text-ink/85">
                {DECODE.title}, straight down — no login, no app. Save it to
                your phone while you&apos;re here.
              </p>

              <div className="mt-6">
                {url ? (
                  <a
                    href={url}
                    className="btn-coral inline-flex min-h-11 items-center"
                    target="_blank"
                    rel="noopener"
                  >
                    Download the guide
                  </a>
                ) : (
                  <>
                    <button type="button" className="btn-coral" disabled>
                      Download the guide
                    </button>
                    <p className="t-small mt-3 max-w-[46ch] rounded-lg border-2 border-dashed border-ink/40 p-3 text-ink/80">
                      <strong className="font-semibold">Placeholder</strong> —
                      set NEXT_PUBLIC_GUIDE_DECODE_URL in the environment and
                      this becomes a working download. It must be set in
                      PRODUCTION too, not just locally: the value is inlined at
                      build time, so it also needs a redeploy.
                    </p>
                  </>
                )}
              </div>

              {/* Email named as the backup it is, and the spam nudge that protects the domain. */}
              <p className="t-small mt-4 max-w-[46ch] text-ink/75">
                A copy is on its way to your inbox as well. If it&apos;s not
                there in a couple of minutes, check your promotions tab — and
                dragging it across genuinely helps Coco reach you next time.
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
