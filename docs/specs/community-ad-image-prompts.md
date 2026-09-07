# Image prompt spec — community ad stills (4 images)

For the **"You've probably met her already"** section on the home page — the strip of ad/video stills that ties the site to the creative someone just clicked. Component: `src/components/home/SeenCoco.tsx`, data: `src/lib/content/community.json` (`adStills`).

These are **ad creative stills**, not candid photos. The five real Coco photos already in `public/brand/community/` cover the candid Instagram grid. This set is the polished, illustrated, ad-facing Coco.

---

## How to use this

Every prompt below is **image-to-image / reference-driven**, not text-only. Attach Coco's render as the character reference so she stays the same dog across all four:

**Reference attachment:** `public/brand/community/coco-png-front-hero.jpg`
(identical file: `public/cooc-hero-page.png`)

Set reference/character weight high — around **0.6–0.75** on Midjourney `--cref`, or "keep the subject's face, coat and ear shape identical to the reference" on Nano Banana / Gemini / GPT-image. Coco's face is the brand's entire trust mechanism; if she reads as a different dog in one still, that still is unusable.

---

## Coco character sheet — lock this across all four

Derived from the supplied reference and the five real photos. Restate it in every prompt.

| Attribute | Value |
|---|---|
| Breed | French Bulldog, young adult, small and compact |
| Coat | **Fawn** — warm sandy tan, roughly `#D9AE7E`, paler cream on chest and belly |
| Mask | Dark brown-black muzzle and eye mask, roughly `#3A2E28` — covers muzzle, wraps under the eyes |
| Ears | Large upright bat ears, dusty pink-grey inner ear, fine dark edging |
| Eyes | Large round warm brown, dark rims, slight upward gaze |
| Nose | Broad, dark charcoal, deep wrinkle roll above it |
| Paws | Fawn fur, **dark charcoal pads**, dark nails |
| Build | Stocky chest, short legs, tucked waist, short tail |
| Style | Soft 3D character render — clean rounded forms, warm even lighting, subtle fur detail, gentle contact shadow. Appealing and characterful, **not** photoreal, **not** flat vector, **not** cartoon-outlined |

Coco is fawn, **not brown-and-white and not brindle**. The dark on her face is a mask, not patches.

---

## Brand palette — locked, use only these

Backgrounds and props must come from this set. Do not let the model invent an accent colour.

| Token | Hex | Use |
|---|---|---|
| Paper | `#FDF9F5` | Base background |
| Ink | `#211C1A` | Type, outlines |
| Coral | `#F4837E` | The one "action" colour — props, buttons |
| Bubblegum | `#FF99C8` | `/decode` territory (curiosity) |
| Sky | `#A8DEFA` | `/vetbill` territory (protective) |
| Mint | `#D0F4E0` | Library / paid |
| Butter | `#FCF5BF` | Community / social |

**Do not render any text into these images.** Headlines are set live in Poppins Bold by the page and the ad tool. Baked-in type can't be edited, localised, or A/B tested, and it will clash with the real type. If the model insists on adding text, remove it in post.

---

## Output specs

| | |
|---|---|
| Aspect ratio | **4:5 portrait** |
| Export size | 1200 × 1500 px (downscaled to 600 × 750 in the grid) |
| Format | JPG, quality ~82 |
| Background | Flat brand colour, **no gradient mesh, no drop shadows behind the subject** |
| Safe margin | Keep Coco fully inside the middle 80% — the grid rotates each tile ±1.6° and crops slightly |

Save to `public/brand/community/` using the exact filenames below, then set `ready: true` on that entry in `src/lib/content/community.json`. Nothing else needs changing.

---

## Prompt 1 — `ad-01.jpg` · The side-eye

**Carries:** the locked `/decode` ad angle, *"Do you know what this look means? Most owners get it wrong."* This is the most important of the four — it is the single image the cold-traffic campaign leans on.

**Wash:** Bubblegum `#FF99C8`

```
Soft 3D character render of a fawn French Bulldog, three-quarter body,
seated. Head turned away to her left while her eyes stay locked on the
viewer — a clear sideways glance with a visible crescent of white at the
inner corner of each eye. Ears upright. Body language slightly withdrawn:
weight shifted back, chin a little tucked.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Flat solid background in soft pink #FF99C8, no gradient. Warm even
lighting from the front left. Single soft contact shadow under her.
Clean rounded 3D forms, subtle fur detail, appealing character-design
quality. Centred, full body inside the middle 80% of a 4:5 portrait
frame. No text, no logo, no props.
```

**Negative:** `text, letters, watermark, logo, gradient background, photorealistic, harsh shadows, brindle or white coat, floppy ears, aggressive expression, bared teeth, multiple dogs`

**Watch for:** the whites of the eyes are the whole point. If the glance isn't unmistakable, regenerate — a softly averted gaze doesn't sell the hook. Do **not** let her look frightened or cowering; the angle is curiosity, not distress.

---

## Prompt 2 — `ad-02.jpg` · Ready, not frightened

**Carries:** the `/vetbill` angle. The tone rule is **protective, never predatory** — if the still could sit in an insurance ad, it's wrong. No sad dog, no cone, no clinic, no needles, no worried owner.

**Wash:** Sky `#A8DEFA`

```
Soft 3D character render of a fawn French Bulldog sitting upright and
calm, facing the viewer straight on. Alert, steady, composed expression —
ears up, chest open, both front paws planted square. She looks well and
looked-after. Beside her on the floor sits a small rounded coral #F4837E
first-aid pouch with a simple cross on it, closed and tidy.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Flat solid background in light blue #A8DEFA, no gradient. Soft even
front lighting, reassuring and bright. Single soft contact shadow.
Clean rounded 3D forms, appealing character-design quality. Centred in a
4:5 portrait frame, full body inside the middle 80%. No text, no logo.
```

**Negative:** `text, letters, watermark, logo, gradient, photorealistic, sad dog, sick dog, cone of shame, bandage, veterinary clinic, hospital, needle, syringe, stethoscope, medication, distressed expression, dark or clinical lighting, brindle or white coat`

**Watch for:** the pouch reads as *preparedness*, not treatment. If it starts looking medical, drop the cross and make it a plain coral pouch. The dog must look healthy — the promise is "you can be ready for this", not "your dog is ill".

---

## Prompt 3 — `ad-03.jpg` · The head tilt

**Carries:** the top-of-funnel curiosity creative and the guide's "weird stuff they do" chapter. This is the friendliest of the four and the most likely to stop a scroll.

**Wash:** Butter `#FCF5BF`

```
Soft 3D character render of a fawn French Bulldog in a pronounced head
tilt — head cocked about 25 degrees to one side, ears up and slightly
asymmetric, eyes wide and curious, mouth closed. Head and upper chest
only, filling most of the frame. Bright, inquisitive, faintly comic.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Flat solid background in pale yellow #FCF5BF, no gradient. Warm even
lighting. Clean rounded 3D forms, subtle fur detail, appealing
character-design quality. Tight portrait crop in a 4:5 frame, head
fully inside the middle 80%. No text, no logo, no props.
```

**Negative:** `text, letters, watermark, logo, gradient, photorealistic, full body, tongue out, bared teeth, motion blur, brindle or white coat, floppy ears, multiple dogs`

**Watch for:** the tilt has to be committed. A 5° tilt reads as a rendering error; 25° reads as a dog listening to you.

---

## Prompt 4 — `ad-04.jpg` · She wrote it down

**Carries:** the email/newsletter creative, and the "these are the things Coco made" idea. Ties the mascot to the actual product.

**Wash:** Mint `#D0F4E0`

```
Soft 3D character render of a fawn French Bulldog lying down in a relaxed
sphinx pose, front paws forward, one paw resting on top of a small stack
of two closed booklets. The booklets are plain, blank-covered, in coral
#F4837E and off-white #FDF9F5, slightly rounded corners, no writing on
them. She looks up at the viewer, calm and pleased with herself.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Flat solid background in pale mint #D0F4E0, no gradient. Warm even
lighting, single soft contact shadow. Clean rounded 3D forms, appealing
character-design quality. 4:5 portrait frame, subject inside the middle
80%. No text or writing anywhere, including on the booklets.
```

**Negative:** `text, letters, writing on covers, watermark, logo, gradient, photorealistic, open books, paper mess, laptop, phone, human hands, brindle or white coat, multiple dogs`

**Watch for:** the booklet covers must stay blank. A model-invented title will be gibberish and the real covers are a separate design job.

---

## Review checklist before these go in

- [ ] Same dog in all four — compare faces side by side, not one at a time
- [ ] Fawn coat with a dark mask in all four (not brindle, not brown-and-white)
- [ ] Zero text or lettering anywhere, including on props
- [ ] Backgrounds are flat locked-palette colours, no gradients
- [ ] Coral appears only on props, never as a background wash — coral is the click colour and must stay reserved
- [ ] Coco fully inside the middle 80% (the grid rotates and crops)
- [ ] `ad-02` reads protective, not medical or sad
- [ ] Exported 1200 × 1500 JPG, filenames exactly `ad-01.jpg` … `ad-04.jpg`
- [ ] `ready: true` set on each entry in `src/lib/content/community.json`

---

## Notes

**TODO(Eli):** these four are written against the *locked ad angles in the brief*, not against creative the media buyer has actually shipped. If real ad stills already exist, use those instead — the section's whole job is showing someone the same face they were served, so genuine creative beats a generated stand-in every time. Treat this spec as the fallback for slots with no real still.

The section gets stronger as more creative ships. Adding a fifth or sixth entry is just another object in the `adStills` array; the grid reflows on its own.
