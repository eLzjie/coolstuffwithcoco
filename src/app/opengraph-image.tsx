import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/content/guides";
import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

/**
 * Home page Open Graph / Twitter card image.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS GENERATED RATHER THAN A FILE
 * ---------------------------------------------------------------------------
 * All three `og*` slots in the brand manifest are `ready: false`, so
 * `openGraph.images` resolved to `undefined` on the home page and both guide
 * pages — while `twitter: { card: "summary_large_image" }` was still declared
 * in the root layout. That combination promises a large-image card and then
 * supplies no image, which renders as a broken or blank preview everywhere a
 * link is shared: Messages, WhatsApp, Slack, X, Facebook.
 *
 * Shared links are how a lead magnet spreads, so leaving that blocked on an
 * asset nobody had produced yet was the wrong trade. This renders type on
 * brand colours at build time — no designer, no file, no CLS risk.
 *
 * IT NOW INCLUDES COCO — 2026-09-10, on Chase's note that "sharing for this
 * link should be better".
 *
 * This used to say Coco was left out because `ImageResponse` would need her
 * photo fetched over HTTP at render time, and a slow or failed fetch produces
 * a broken card rather than a card without a dog. That reasoning was right
 * about the failure mode and wrong about the only way to get her in: the file
 * is read off disk at module scope below and inlined as a data URI, so there
 * is no request to fail. A missing file breaks the BUILD, which is where you
 * want to find out.
 *
 * The remaining honest caveat is that this is still generated type rather
 * than a designed card — see "when the designed artwork arrives" below.
 *
 * File-based convention: Next serves this at /opengraph-image and wires the
 * meta tags automatically — og:image plus type, width, height and alt, and the
 * twitter:image too, which is why there is no separate twitter-image file.
 *
 * ---------------------------------------------------------------------------
 * GOTCHA THAT COST AN HOUR — an explicit `openGraph.images` key wins
 * ---------------------------------------------------------------------------
 * These routes built and served valid PNGs while every page still rendered NO
 * og:image at all. The cause was in the page metadata, not here: each page had
 *
 *     openGraph: { images: BRAND.ogDecode.ready ? [...] : undefined }
 *
 * and an `images` key that is PRESENT-BUT-UNDEFINED suppresses the file
 * convention entirely. It does not fall through to it. Deleting the key made
 * all the tags appear.
 *
 * So: don't reintroduce a conditional `images` key on these pages. If a page
 * needs a bespoke image, either give it its own opengraph-image file or set
 * `images` to a real value — never to a maybe.
 *
 * ---------------------------------------------------------------------------
 * WHEN THE DESIGNED ARTWORK ARRIVES
 * ---------------------------------------------------------------------------
 * The `ogHome` / `ogDecode` / `ogVetbill` slots in the brand manifest are now
 * unreferenced. Flipping their `ready` flag will do NOTHING on its own. To
 * switch over, delete the three opengraph-image.tsx files and point each
 * page's `openGraph.images` at the real file — in that order, or there will be
 * a window with no card image at all.
 */
/*
  Read once, at module scope, so the file is touched at build time rather than
  per render — and so a missing or renamed asset fails the build instead of
  silently shipping a card with a hole in it.

  `node:fs` is available because this route runs on the Node runtime; do not
  add `export const runtime = "edge"` here without replacing this.
*/
const COCO_DATA_URI = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/brand/coco-hero.png"),
).toString("base64")}`;

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${SITE_NAME} — free guides for dog owners`;

export default function Image() {
  return new ImageResponse(
    ogImage({
      eyebrow: "Cool Stuff for Good Dogs",
      title: "Read your dog better",
      sub: "Free, plain-spoken guides. Written for the stuff that actually comes up.",
      accent: "#F4837E",
      art: COCO_DATA_URI,
    }),
    size,
  );
}
