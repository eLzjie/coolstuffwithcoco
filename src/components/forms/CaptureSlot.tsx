import { CaptureForm } from "@/components/forms/CaptureForm";
import { GhlFormEmbed } from "@/components/shared/GhlFormEmbed";
import type { LeadMagnet } from "@/lib/leadMagnet";

const EMBED_URL: Record<LeadMagnet, string | undefined> = {
  decode: process.env.NEXT_PUBLIC_GHL_FORM_DECODE,
  vetbill: process.env.NEXT_PUBLIC_GHL_FORM_VETBILL,
  newsletter: process.env.NEXT_PUBLIC_GHL_FORM_NEWSLETTER,
};

/**
 * Chooses between the in-page form and the GHL iframe embed.
 *
 * The build spec's decision: ship the in-page form (path B), and keep the
 * embed as the escape hatch. If the end-to-end test hasn't passed by launch
 * morning, flip one env var and ship the embed instead — the GHL forms exist
 * regardless, because organic and link-in-bio traffic need them.
 *
 * Default is `inpage`. Set NEXT_PUBLIC_CAPTURE_MODE=embed to fall back.
 *
 * What falling back costs, so the choice is made with open eyes: an iframe
 * submit isn't observable from the parent page, so `lead` can't fire on real
 * success, UTMs reach the contact only via fragile hidden-field plumbing, and
 * Pixel/CAPI can't dedupe on a shared eventId. That tracking gap is the whole
 * reason the in-page form exists.
 */
export function CaptureSlot({
  magnet,
  redirectTo,
  className,
}: {
  magnet: LeadMagnet;
  redirectTo?: string;
  className?: string;
}) {
  const wantsEmbed = process.env.NEXT_PUBLIC_CAPTURE_MODE === "embed";

  /*
    The embed is only a real fallback if its form URL is configured. Flipping
    the mode without setting NEXT_PUBLIC_GHL_FORM_* would otherwise ship a
    labelled empty box where the capture form used to be — on launch morning,
    which is exactly when this switch gets thrown in a hurry.
  */
  const embedUrl = EMBED_URL[magnet];

  if (wantsEmbed && embedUrl) {
    return <GhlFormEmbed magnet={magnet} className={className} />;
  }

  if (wantsEmbed && !embedUrl) {
    console.warn(
      `[CaptureSlot] NEXT_PUBLIC_CAPTURE_MODE=embed but no form URL for ` +
        `"${magnet}" — falling back to the in-page form so capture keeps working.`,
    );
  }

  return (
    <CaptureForm magnet={magnet} redirectTo={redirectTo} className={className} />
  );
}
