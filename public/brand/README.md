# Brand assets

Drop Ash's files in here. Nothing in this folder exists yet — every slot is
rendering a labelled placeholder box until the real file lands.

## How the swap works

1. Put the file in this folder using **exactly** the filename listed in
   `src/lib/brand/manifest.ts`.
2. Flip that slot's `ready` to `true` in the manifest.
3. Done. Aspect ratios are already reserved from the manifest's `w`/`h`, so
   swapping an asset in never shifts layout (CLS stays 0).

Only change `w`/`h` if the real asset has a different aspect ratio — and change
both together, then re-check the section it appears in.

## What's needed

| Filename | Size | What it is |
|---|---|---|
| `logo-full.svg` | 320×120 | Full stacked lockup |
| `logo-horizontal.svg` | 420×96 | Horizontal variant — used in every page header |
| `submark.svg` | 96×96 | Submark |
| `logo-mono.svg` | 420×96 | Single colour, sits on ink in the footer |
| `coco-hero.jpg` | 1400×1600 | **The LCP image.** Coco head-on, eyes near the upper third, shot tight. Needs to be sharp — it's the first thing anyone sees. |
| `coco-about.jpg` | 1000×1100 | Coco seated, body angled, **left foreleg clear of her body** so the animated paw can overlay her shoulder |
| `coco-avatar.png` | 200×200 | Illustrated avatar likeness |
| `signal-whale-eye.jpg` | 900x900 | **/decode signature moment.** Head turned away, eyes tracking the camera, whites visible |
| `signal-yawn.jpg` | 900x900 | **/decode.** Mid-yawn, daylight, clearly not sleepy |
| `signal-tail.jpg` | 900x900 | **/decode.** Standing alert, weight forward, tail up. Hardest of the three to shoot |
| `cover-decode.jpg` | 800×1035 | Guide cover |
| `cover-vetbill.jpg` | 800×1035 | Guide cover |
| `og-home.jpg` | 1200×630 | Open Graph |
| `og-decode.jpg` | 1200×630 | Open Graph |
| `og-vetbill.jpg` | 1200×630 | Open Graph |

## Favicon

The favicon crop replaces `src/app/favicon.ico`, not a file in here.

## community/

Instagram posts and ad stills, listed in `src/lib/content/community.json`.
Add the file here, then set `ready: true` on that entry.

- `ig-01.jpg` … `ig-06.jpg` — square, 640×640
- `ad-01.jpg` … `ad-04.jpg` — 4:5 portrait, 600×750

## A note on the paw

The waving paw in the About section is an SVG we draw in code, not an asset —
so it doesn't need anything from Ash. It's positioned for the `coco-about.jpg`
framing described above. If the real shot is framed differently, adjust
`--paw-x` / `--paw-y` in `src/components/home/AboutCoco.tsx` rather than
editing the SVG.
