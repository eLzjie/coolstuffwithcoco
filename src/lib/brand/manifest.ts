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
  /** Filename inside /public/brand/ */
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
    w: 1024,
    h: 1280,
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
  "signal-whale-eye": {
    file: "signal-whale-eye.jpg",
    w: 900,
    h: 900,
    alt: "Coco with her head turned away, eyes still on the camera",
    note: "SIGNAL — the side-eye. Head turned away, eyes tracking the camera, whites of the eye visible.",
    ready: false,
  },
  "signal-yawn": {
    file: "signal-yawn.jpg",
    w: 900,
    h: 900,
    alt: "Coco mid-yawn",
    note: "SIGNAL — the yawn. Mid-yawn, in daylight, clearly not sleepy.",
    ready: false,
  },
  "signal-tail": {
    file: "signal-tail.jpg",
    w: 900,
    h: 900,
    alt: "Coco standing alert with her tail held high",
    note: "SIGNAL — the stiff high wag. Standing alert, weight forward, tail up. Hardest of the three to shoot.",
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

export const brandSrc = (key: BrandKey) => `/brand/${BRAND[key].file}`;
