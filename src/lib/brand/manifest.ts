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
 *   3. RE-PROBE the real dimensions and update `w`/`h` to match the file
 *      exactly.
 *
 * Step 3 used to read "nothing else — aspect ratios are already reserved".
 * That was wrong and it bit us: `cocoHero` was declared 1024x1280 against an
 * 815x1087 file, the browser reserved a 0.80 box from the attributes and
 * reflowed to the real 0.75 on load, and that was the home page's stubborn
 * 0.004 CLS. `next/image` also builds its srcset from these numbers, so
 * claiming a size the file does not have asks for candidates that cannot
 * exist. If the crop changes, re-probe and update BOTH numbers.
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
    /*
      512, down from 1254 on 2026-09-09. It renders at 44px on mobile and 56px
      from `sm:` up — nothing on the site asks for more — and the source was a
      1.3MB PNG, the largest file in the repo after the success image. 512
      still leaves better than 4x for a retina screen and any future larger
      placement.

      These numbers must match the file on disk: `next/image` builds its
      srcset from them, so claiming 1254 for a 512px file asks for candidates
      that cannot exist.
    */
    w: 512,
    h: 512,
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
  /* All three signals generated from docs/specs/decode-signal-image-prompts.md
     and sharing the same Bubblegum ground, so stepping through the quiz has no
     background jump. */
  "signal-yawn": {
    file: "/ad/coco-french-bulldog-yawn-calming-signal.jpg",
    w: 1122,
    h: 1402,
    alt: "Coco mid-yawn, eyes squeezed shut and mouth wide open",
    note: "SIGNAL — the yawn. Mid-yawn, in daylight, clearly not sleepy.",
    ready: true,
  },
  "signal-tail": {
    file: "/ad/coco-french-bulldog-stiff-high-tail-arousal.jpg",
    w: 1122,
    h: 1402,
    alt: "Coco standing alert, weight forward, tail held high and stiff",
    note: "SIGNAL — the stiff high wag. Standing alert, weight forward, tail up. Hardest of the three.",
    ready: true,
  },

  /* ---- Guide covers -----------------------------------------------------
     The real thing now: page 1 of each illustrated guide, rendered at 120dpi.
     The designed SVG stand-ins are gone — nothing referenced them once these
     landed, so they were deleted rather than left to rot in /public.

     RENDERED FROM THE PDF, NOT SCREENSHOTTED. Two screenshots of these same
     pages were tried first and carried three defects a re-render doesn't: a
     1px ink line down the left edge of the decode one only (which doubles
     BookletMockup's own border and sits under its spine gradient),
     inconsistent crops so the two covers were different shapes side by side
     on the home page, and 602px against a 320px placement that wants 640 at
     2x.

     120dpi is deliberate: 1020px covers the largest placement (`w-80`, 320px
     CSS) at 3x. Letter at 120dpi is 1020×1320 — aspect 0.7727, which is what
     the 800×1035 reservation was approximating, so the swap costs no shift.

     If the guides are re-cut, re-render rather than screenshot, and re-probe
     w/h: BrandImage passes these straight to next/image as width/height, and
     a lying value here is what caused the home page's 0.004 CLS.
     ---------------------------------------------------------------------- */
  coverDecode: {
    file: "decode-cover.png",
    w: 1020,
    h: 1320,
    alt: "Decode Your Dog — guide cover",
    note: "Cover: Decode Your Dog",
    ready: true,
  },
  coverVetbill: {
    file: "vet-bill-cover.png",
    w: 1020,
    h: 1320,
    alt: "The $1,000 Vet Bill — guide cover",
    note: "Cover: The $1,000 Vet Bill",
    ready: true,
  },

  /* ---- Variant-page illustrations ---------------------------------------
     Delivered 2026-09-09 as two 1024x1024 transparent renders in /public/.
     Split and trimmed into the five slots below — the vet-bill render came
     back as one frame holding Coco plus three props, and separate files let
     the page arrange them instead of being stuck with a baked composition.

     ALL FIVE ARE ALPHA CUT-OUTS, which is a deliberate break from the six
     prompt-generated stills in /public/ad/. Those bake a flat brand wash and
     ship as JPG; these composite over a live CSS wash, so they are PNG and
     their contact shadow is drawn in code, not baked.

     Every one is trimmed to its alpha bounding box. The source renders
     carried 55-157px of dead transparent margin per edge, and `cocoHero`
     already taught us what that costs: it read smaller than its box, and a
     w/h that disagreed with the file was the source of the home page's
     stubborn 0.004 CLS. w/h below were re-probed from the trimmed files.
     ---------------------------------------------------------------------- */
  cocoDiagram: {
    file: "coco-french-bulldog-body-language-diagram.png",
    w: 730,
    h: 860,
    alt: "Coco standing side-on, ears up, showing her whole body",
    note: "DIAGRAM — standing pose carrying the body-language pins",
    ready: true,
  },
  cocoBandaged: {
    file: "coco-french-bulldog-bandaged-paw-recovering.png",
    w: 550,
    h: 884,
    alt: "Coco sitting calmly with a light blue bandage on one front paw",
    note: "VETBILL — recovering and fine. Not a sympathy shot.",
    ready: true,
  },
  propFirstAidKit: {
    file: "prop-pet-first-aid-kit.png",
    w: 264,
    h: 286,
    alt: "",
    note: "PROP — coral first-aid pouch. Decorative, always aria-hidden.",
    ready: true,
  },
  propContactsCard: {
    file: "prop-emergency-contacts-card.png",
    w: 256,
    h: 188,
    alt: "",
    note: "PROP — blank contacts card and pen. Decorative, aria-hidden.",
    ready: true,
  },
  propVetWrapRoll: {
    file: "prop-vet-wrap-roll.png",
    w: 275,
    h: 200,
    alt: "",
    note: "PROP — roll of sky vet wrap. Decorative, aria-hidden.",
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
