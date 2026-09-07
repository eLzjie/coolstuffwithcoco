/**
 * Brand asset manifest.
 *
 * Ash is delivering the real files. Until then every slot below points at a
 * filename that does not exist yet, and <BrandImage> renders a labelled
 * placeholder box instead of a broken image.
 *
 * TO SWAP IN REAL ASSETS:
 *   1. Drop the file into /public/brand/ using exactly the `file` name below.
 *   2. Flip `ready` to true for that slot.
 *   3. Nothing else. Aspect ratios are already reserved, so CLS stays 0.
 *
 * Do not change `w`/`h` when swapping — they reserve layout space. If the real
 * asset has a different aspect ratio, update both numbers together and re-check
 * the section it appears in.
 */

export type AssetSlot = {
  /**
   * Filename inside /public/brand/ — or an absolute public path starting with
   * "/" when the asset lives elsewhere and shouldn't be duplicated (e.g. an
   * ad still in /public/ad/ that also serves as a signal photo).
   */
  file: string;
  /** Intrinsic width in px — reserves layout space */
  w: number;
  /** Intrinsic height in px — reserves layout space */
  h: number;
  /** Alt text. Written now so it ships correct even before the image lands. */
  alt: string;
  /** What Ash needs to deliver. Shown inside the placeholder box. */
  note: string;
  /** Flip to true once the real file is in /public/brand/ */
  ready: boolean;
};

export const BRAND = {
  /* ---- Logo -------------------------------------------------------------
     The delivered logo is a SQUARE badge (the pastel "COCO" lockup with Coco
     peeking over the top), not a horizontal wordmark. It's used at a larger
     size than a wordmark would be, because the badge contains lettering that
     has to stay legible.

     TODO(Eli): a horizontal variant and a single-colour version would both
     earn their keep — the badge is wide-ish for a tight mobile nav, and a
     mono version would sit better on the ink footer. Not blocking.
     ---------------------------------------------------------------------- */
  logoBadge: {
    file: "logo.png",
    w: 1254,
    h: 1254,
    alt: "Cool Stuff with Coco",
    note: "Square badge logo",
    ready: true,
  },

  /* ---- Coco ------------------------------------------------------------- */
  cocoHero: {
    file: "coco-hero.png",
    // MUST match the file exactly. This was once declared 1024x1280 against an
    // 815x1087 file, so the browser reserved a 0.80 box from these attributes
    // and reflowed to the real 0.75 on load. If the crop changes, re-probe and
    // update BOTH numbers.
    //
    // Cropped from 815 to 675 wide: the render carried ~166px of empty
    // transparent margin (113 left, 53 right), so a fifth of the layout width
    // was blank and Coco read smaller than her box. Full height kept — content
    // starts at y=3, so there was nothing to trim vertically.
    w: 675,
    h: 1087,
    alt: "Coco, a fawn French Bulldog, sitting and looking at the camera",
    note: "HERO — illustrated render, seated, head tilted. This is the LCP image.",
    ready: true,
  },
  cocoAbout: {
    file: "coco-about.jpg",
    w: 1024,
    h: 1280,
    alt: "Coco sitting on a cushioned outdoor chair in evening light",
    note: "ABOUT — real photo, Coco seated square-on. The animated paw overlays her left side.",
    ready: true,
  },
  cocoAvatar: {
    file: "coco-avatar.jpg",
    w: 1024,
    h: 1280,
    alt: "Coco",
    note: "Avatar likeness (illustrated render)",
    ready: true,
  },

  /* ---- "Guess the signal" on /decode -----------------------------------
     One photo per signal. These carry the page's signature moment, so they
     matter more than most: each has to show the signal clearly enough that a
     visitor can read it and commit to a guess. Keys match the ids in SIGNALS.
     ---------------------------------------------------------------------- */
  /*
    Already covered: the /decode ad still was generated from the side-eye
    prompt, so it IS this signal. Referenced in place from /public/ad/ rather
    than copied, so there's one file on disk and one thing to replace.
  */
  "signal-whale-eye": {
    file: "/ad/coco-french-bulldog-side-eye-body-language.jpg",
    w: 1122,
    h: 1402,
    alt: "Coco with her head turned away, eyes still on the camera and the whites showing",
    note: "SIGNAL — the side-eye. Head turned away, eyes tracking the camera, whites of the eye visible.",
    ready: true,
  },
  /*
    Still to generate — prompts in docs/specs/decode-signal-image-prompts.md.
    Both must land on the same Bubblegum ground as the side-eye above, because
    the quiz steps through them one at a time and a background change between
    taps reads as a glitch. Drop into /public/ad/ and flip `ready`.
  */
  "signal-yawn": {
    file: "/ad/coco-french-bulldog-yawn-calming-signal.jpg",
    w: 1122,
    h: 1402,
    alt: "Coco mid-yawn, eyes squeezed shut and mouth wide open",
    note: "SIGNAL — the yawn. Mid-yawn, in daylight, clearly not sleepy.",
    ready: false,
  },
  "signal-tail": {
    file: "/ad/coco-french-bulldog-stiff-high-tail-arousal.jpg",
    w: 1122,
    h: 1402,
    alt: "Coco standing alert, weight forward, tail held high and stiff",
    note: "SIGNAL — the stiff high wag. Standing alert, weight forward, tail up. Hardest of the three.",
    ready: false,
  },

  /* ---- Guide covers -----------------------------------------------------
     Designed SVG stand-ins, drawn in the locked palette — not labelled grey
     boxes. They read as real covers at thumbnail size, which is the only size
     they ever appear at on the site.

     TODO(Eli): swap for the real PDF cover art when it exists. Change the
     filename to .jpg/.png and keep w/h at 800×1035 (A-series-ish 1:1.294) or
     update both numbers together.
     ---------------------------------------------------------------------- */
  coverDecode: {
    file: "cover-decode.svg",
    w: 800,
    h: 1035,
    alt: "Decode Your Dog — guide cover",
    note: "Cover: Decode Your Dog",
    ready: true,
  },
  coverVetbill: {
    file: "cover-vetbill.svg",
    w: 800,
    h: 1035,
    alt: "The $1,000 Vet Bill — guide cover",
    note: "Cover: The $1,000 Vet Bill",
    ready: true,
  },

  /* ---- Open Graph ------------------------------------------------------- */
  ogHome: {
    file: "og-home.jpg",
    w: 1200,
    h: 630,
    alt: "Cool Stuff with Coco",
    note: "OG image — home",
    ready: false,
  },
  ogDecode: {
    file: "og-decode.jpg",
    w: 1200,
    h: 630,
    alt: "Decode Your Dog",
    note: "OG image — /decode",
    ready: false,
  },
  ogVetbill: {
    file: "og-vetbill.jpg",
    w: 1200,
    h: 630,
    alt: "The $1,000 Vet Bill",
    note: "OG image — /vetbill",
    ready: false,
  },
} satisfies Record<string, AssetSlot>;

export type BrandKey = keyof typeof BRAND;

export const brandSrc = (key: BrandKey) => {
  const file = BRAND[key].file;
  return file.startsWith("/") ? file : `/brand/${file}`;
};
