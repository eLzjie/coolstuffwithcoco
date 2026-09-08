import type { Metadata } from "next";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { LibraryOffer } from "@/components/offer/LibraryOffer";
import { Footer } from "@/components/layout/Footer";
import { HOTLINES, VETBILL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Your guide is on its way",
  robots: { index: false, follow: false },
};

/**
 * /vetbill thank-you — delivery first, offer second.
 *
 * Same structure and the same reasoning as the Decode thank-you page: this
 * page IS the delivery mechanism rather than a receipt, the confirmation band
 * is short so the offer starts inside the second screenful, and the email is
 * named as the backup channel it actually is.
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
                Here it is — grab it now.
              </h1>

              <p className="t-lead mt-4 max-w-[46ch] text-ink/85">
                {VETBILL.title}, straight down. Save it to your phone, and do
                the fill-in page on 12 tonight while nothing is wrong.
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
                      set NEXT_PUBLIC_GUIDE_VETBILL_URL in the environment and
                      this becomes a working download. It must be set in
                      PRODUCTION too, not just locally: the value is inlined at
                      build time, so it also needs a redeploy.
                    </p>
                  </>
                )}
              </div>

              <p className="t-small mt-4 max-w-[46ch] text-ink/75">
                A copy is on its way to your inbox as well. If it&apos;s not
                there in a couple of minutes, check your promotions tab.
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
