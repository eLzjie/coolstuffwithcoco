import { ImageResponse } from "next/og";
import { DECODE } from "@/lib/content/guides";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

/**
 * /decode Open Graph card. See src/app/opengraph-image.tsx for why these are
 * generated rather than designed files, and when to delete them.
 *
 * Bubblegum accent, matching the page's own wash so a shared link and the
 * landing page look like the same thing.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${DECODE.title} — a free guide from Coco`;

export default function Image() {
  return new ImageResponse(
    ogImage({
      eyebrow: "Free guide",
      title: DECODE.title,
      sub: "What your dog is actually trying to tell you.",
      accent: "#FF99C8",
    }),
    size,
  );
}
