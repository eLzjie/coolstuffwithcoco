import type { Metadata } from "next";
import { BrandImage } from "@/components/brand/BrandImage";
import { OfferScaffold } from "@/components/shared/OfferScaffold";
import { Footer } from "@/components/layout/Footer";
import { DECODE } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Your guide is on its way",
  robots: { index: false, follow: false },
};

/**
 * Scaffold only — layout shell and event hooks.
 *
 * Delivery is by hosted URL, not GHL's native file delivery (which the brief
 * says is unreliable).
 *
 * TODO(Eli): put the hosted PDF URL in NEXT_PUBLIC_GUIDE_DECODE_URL. Until
 * then the download button renders disabled with a visible placeholder note,
 * rather than linking somewhere that 404s.
 */
export default function DecodeThankYou() {
  const url = process.env.NEXT_PUBLIC_GUIDE_DECODE_URL;

  return (
    <>
      <main id="main">
        <section className="bg-bubblegum">
          <div className="shell py-6">
            <BrandImage slot="logoHorizontal" className="h-9 w-auto" sizes="180px" />
          </div>

          <div className="shell grid items-center gap-10 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="t-display-l max-w-[20ch] text-ink">
                Right — it&apos;s in your inbox.
              </h1>
              <p className="t-lead mt-5 text-ink/80">
                {DECODE.title} is on its way. If it hasn&apos;t turned up in a
                couple of minutes, check your promotions tab — Coco ends up
                there a lot.
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
                      set NEXT_PUBLIC_GUIDE_DECODE_URL to the hosted PDF and
                      this becomes a working download.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mx-auto w-[min(60vw,18rem)]">
              <BrandImage slot="coverDecode" sizes="18rem" className="w-full rounded-xl" />
            </div>
          </div>
        </section>

        <OfferScaffold magnet="decode" />
      </main>

      <Footer bare />
    </>
  );
}
