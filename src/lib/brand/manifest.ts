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
  /* ---- Logo family ------------------------------------------------------ */
  logoFull: {
    file: "logo-full.svg",
    w: 320,
    h: 120,
    alt: "Cool Stuff with Coco",
    note: "Full logo, stacked lockup",
    ready: false,
  },
  logoHorizontal: {
    file: "logo-horizontal.svg",
    w: 420,
    h: 96,
    alt: "Cool Stuff with Coco",
    note: "Horizontal logo variant",
    ready: false,
  },
  submark: {
    file: "submark.svg",
    w: 96,
    h: 96,
    alt: "Cool Stuff with Coco",
    note: "Submark",
    ready: false,
  },
  logoMono: {
    file: "logo-mono.svg",
    w: 420,
    h: 96,
    alt: "Cool Stuff with Coco",
    note: "Single-colour logo (footer, on ink)",
    ready: false,
  },

  /* ---- Coco photography ------------------------------------------------- */
  cocoHero: {
    file: "coco-hero.jpg",
    w: 1400,
    h: 1600,
    alt: "Coco, a French Bulldog, looking directly at the camera",
    note: "HERO — Coco head-on, eyes near upper third, shot tight. This is the LCP image; needs to be sharp and centred.",
    ready: false,
  },
  cocoAbout: {
    file: "coco-about.jpg",
    w: 1000,
    h: 1100,
    alt: "Coco sitting, one front paw raised",
    note: "ABOUT — Coco seated, body angled, LEFT foreleg clear of her body so the animated paw can overlay her shoulder.",
    ready: false,
  },
  cocoAvatar: {
    file: "coco-avatar.png",
    w: 200,
    h: 200,
    alt: "Coco",
    note: "Coco avatar likeness (illustrated)",
    ready: false,
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

  /* ---- Guide covers ----------------------------------------------------- */
  coverDecode: {
    file: "cover-decode.jpg",
    w: 800,
    h: 1035,
    alt: "Decode Your Dog — guide cover",
    note: "Cover: Decode Your Dog",
    ready: false,
  },
  coverVetbill: {
    file: "cover-vetbill.jpg",
    w: 800,
    h: 1035,
    alt: "The $1,000 Vet Bill — guide cover",
    note: "Cover: The $1,000 Vet Bill",
    ready: false,
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
