import { ImageResponse } from "next/og";
import { VETBILL } from "@/lib/content/guides";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

/**
 * /vetbill Open Graph card. See src/app/opengraph-image.tsx for why these are
 * generated rather than designed files, and when to delete them.
 *
 * Sky accent to match the page wash. The subtitle deliberately leads with
 * readiness rather than the bill — a shared link is the first thing many
 * people see of this page, and "protective, never predatory" has to hold in a
 * preview card too.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${VETBILL.title} — a free guide from Coco`;

export default function Image() {
  return new ImageResponse(
    ogImage({
      eyebrow: "Free guide",
      title: VETBILL.title,
      sub: "Know what's urgent, and what it costs, before you need to.",
      accent: "#A8DEFA",
    }),
    size,
  );
}
