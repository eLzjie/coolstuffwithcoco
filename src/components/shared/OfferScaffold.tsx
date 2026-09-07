"use client";

import { useEffect } from "react";
import { track, type LeadMagnet } from "@/lib/analytics/track";

/**
 * Thank-you page offer scaffold — layout shell and event hooks only.
 *
 * Bundle pricing and copy aren't locked, so nothing here states a price or a
 * guide count. The three events the funnel needs are wired and verifiable via
 * NEXT_PUBLIC_ANALYTICS_DEBUG=1:
 *
 *   offer_view         — on mount
 *   initiate_checkout  — on the primary CTA
 *   decline_offer      — on the "no thanks" path
 *
 * Checkout itself stays in GHL. The CTA is a placeholder link until Eli
 * supplies the checkout URL.
 *
 * TODO(Eli): bundle price (~$27–30), guide count (6–8), the +$9 printed fridge
 * pack order bump, and the $12 single-guide downsell. None are locked, so none
 * appear on the page.
 */
export function OfferScaffold({ magnet }: { magnet: LeadMagnet }) {
  useEffect(() => {
    track("offer_view", { lead_magnet: magnet, content_name: "coco_library" });
  }, [magnet]);

  return (
    <section className="section-pad bg-mint" aria-labelledby="offer-heading">
      <div className="shell max-w-3xl">
        <h2 id="offer-heading" className="t-display-l text-ink">
          While you&apos;re here
        </h2>

        <div className="mt-6 rounded-2xl border-2 border-ink/25 bg-paper p-6 sm:p-8">
          <h3 className="t-h2">Coco&apos;s Library</h3>
          <p className="t-body mt-3 text-ink/80">
            The rest of the guides, together.
          </p>

          <p className="t-small mt-5 rounded-lg border-2 border-dashed border-ink/40 p-4 text-ink/80">
            <strong className="font-semibold">
              Placeholder — offer copy and pricing not locked
            </strong>
            <br />
            TODO(Eli): bundle price, guide count, the printed fridge-pack order
            bump and the single-guide downsell. Deliberately blank rather than
            filled with plausible numbers.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="btn-coral"
              onClick={() =>
                track("initiate_checkout", {
                  lead_magnet: magnet,
                  content_name: "coco_library",
                })
              }
            >
              Add the Library
            </button>

            {/*
              The decline path is a real, visible, non-shaming option. No dark
              patterns at the capture or the offer (compliance rule 8).
            */}
            <button
              type="button"
              className="t-small underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
              onClick={() =>
                track("decline_offer", {
                  lead_magnet: magnet,
                  content_name: "coco_library",
                })
              }
            >
              No thanks — just the free guide
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
