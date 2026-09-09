import { BrandImage } from "@/components/brand/BrandImage";
import type { BrandKey } from "@/lib/brand/manifest";

type Props = {
  /** A cover slot: `coverDecode` or `coverVetbill`. */
  slot: BrandKey;
  /** Responsive sizes hint. Required for anything not fixed-width. */
  sizes?: string;
  /** Set on the LCP image only — above the fold, this usually is one. */
  priority?: boolean;
  className?: string;
  /**
   * Tilt direction. The booklet leans away from the copy it sits beside, so a
   * mockup to the RIGHT of a headline gets `"right"` (leaning right, spine
   * toward the text).
   */
  lean?: "left" | "right";
};

/**
 * A guide cover with physical presence.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * Chase's review, on the landing pages: "we don't have call to action... I
 * would click out because we don't know what we're getting here."
 *
 * That was literally true. `cover-decode.svg` and `cover-vetbill.svg` exist and
 * read well, but they were rendered only on the home page and the thank-you
 * pages — before the click and after the conversion, never on the page doing
 * the asking. So a visitor was handed a photo of a dog and asked for an email,
 * with no picture of the thing being offered anywhere on screen.
 *
 * ---------------------------------------------------------------------------
 * WHY IT'S CSS AND NOT A NEW ASSET
 * ---------------------------------------------------------------------------
 * The covers are flat rectangles. Flat reads as a poster; a booklet reads as
 * something you receive. The difference is three cheap tricks — a page stack
 * peeking out at the fore-edge, a spine shade, and a small rotation — and all
 * three are CSS over the existing SVG. No new file to draw, nothing to keep in
 * sync, and it inherits any future cover swap for free.
 *
 * `translate`/`rotate` only, no filters, so this composites and costs nothing.
 * There is no animation at all: it is furniture, not a moment, and the one
 * orchestrated moment on these pages is already the hero's load sequence.
 *
 * ---------------------------------------------------------------------------
 * NOT USING THE REAL PDF COVER, DELIBERATELY
 * ---------------------------------------------------------------------------
 * Page 1 of each guide is exactly the reserved 800×1035 aspect (0.773), so the
 * real cover would drop in with zero CLS — but it currently has the word
 * ILLUSTRATION printed across it. The SVG stand-in is the better asset until
 * the guides are finished. When they are, swap the file in `manifest.ts` and
 * this component needs no change.
 *
 * Server component. No JS.
 */
export function BookletMockup({
  slot,
  sizes,
  priority,
  className,
  lean = "right",
}: Props) {
  const tilt = lean === "right" ? "rotate(2.2deg)" : "rotate(-2.2deg)";

  return (
    /*
      The wrapper carries the width; the inner group carries the tilt. Splitting
      them means a caller can size this with a plain `w-*` class without having
      to think about what the rotation does to the box.
    */
    <div className={className}>
      <div className="relative" style={{ transform: tilt }}>
        {/*
          The page stack. Two edges, not five — at the ~120–260px this renders
          at, a third is a muddy line rather than another page. Offsets are
          fixed px on purpose: pages are the same thickness whatever size the
          book is, so scaling them with the cover would read as wrong.

          `aria-hidden` and no text: this is depth, and a screen reader already
          gets the cover's alt from BrandImage below.
        */}
        <div
          aria-hidden
          className="absolute inset-0 translate-x-[6px] translate-y-[5px] rounded-[10px] border-2 border-ink bg-paper-warm"
        />
        <div
          aria-hidden
          className="absolute inset-0 translate-x-[3px] translate-y-[2.5px] rounded-[10px] border-2 border-ink bg-paper"
        />

        {/*
          The cover itself. The hard `0 3px 0` ink shadow is the same one the
          buttons use — it's this brand's shadow language, so a soft blurred
          drop shadow here would look borrowed from somewhere else.
        */}
        <div
          className="relative overflow-hidden rounded-[10px] border-2 border-ink"
          style={{ boxShadow: "4px 5px 0 var(--color-ink)" }}
        >
          <BrandImage
            slot={slot}
            sizes={sizes}
            priority={priority}
            className="block w-full"
          />

          {/*
            The spine. A closed book seen slightly from the right shows its
            spine as a narrow darker band down the left edge, with the gutter
            shadow falling away from it. `multiply` keeps it honest against
            whatever the cover art is, so this works for both covers and for
            the real PDF cover later.
          */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[7%]"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--color-ink) 34%, transparent) 0%, color-mix(in oklab, var(--color-ink) 10%, transparent) 55%, transparent 100%)",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </div>
    </div>
  );
}
