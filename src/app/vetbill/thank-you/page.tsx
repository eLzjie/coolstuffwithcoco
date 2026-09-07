import type { Metadata } from "next";
import { BrandImage } from "@/components/brand/BrandImage";
import { OfferScaffold } from "@/components/shared/OfferScaffold";
import { Footer } from "@/components/layout/Footer";
import { VETBILL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Your guide is on its way",
  robots: { index: false, follow: false },
};

/**
 * Scaffold only — layout shell and event hooks.
 *
 * TODO(Eli): put the hosted PDF URL in NEXT_PUBLIC_GUIDE_VETBILL_URL.
 */
export default function VetBillThankYou() {
  const url = process.env.NEXT_PUBLIC_GUIDE_VETBILL_URL;

  return (
    <>
      <main id="main">
        <section className="bg-sky">
          <div className="shell py-6">
            <BrandImage slot="logoBadge" className="h-14 w-14 sm:h-16 sm:w-16" sizes="64px" />
          </div>

          <div className="shell grid items-center gap-10 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="t-display-l max-w-[20ch] text-ink">
                Sent. Now do the boring bit.
              </h1>
              <p className="t-lead mt-5 text-ink/80">
                {VETBILL.title} is in your inbox. Open it and fill in the
                emergency contacts page today, while nothing is wrong — that
                page is the whole point of the guide.
              </p>

              <div className="mt-8">
                {url ? (
                  <a href={url} className="btn-coral" download>
                    Download it now
                  </a>
                ) : (
                  <>
                    <button type="button" className="btn-coral" disabled>
                      Download it now
                    </button>
                    <p className="t-small mt-3 max-w-[46ch] rounded-lg border-2 border-dashed border-ink/40 p-3 text-ink/80">
                      <strong className="font-semibold">Placeholder</strong> —
                      set NEXT_PUBLIC_GUIDE_VETBILL_URL to the hosted PDF and
                      this becomes a working download.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mx-auto w-[min(60vw,18rem)]">
              <BrandImage slot="coverVetbill" sizes="18rem" className="w-full rounded-xl" />
            </div>
          </div>
        </section>

        <OfferScaffold magnet="vetbill" />
      </main>

      <Footer bare />
    </>
  );
}
