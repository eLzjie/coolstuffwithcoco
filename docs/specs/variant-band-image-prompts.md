# Image prompt spec — variant content bands (2 renders, 5 slots)

For the content bands on `/decode/b` and `/vetbill/b`. Components:
`src/components/decode/BodyLanguageDiagram.tsx` and
`src/components/vetbill/PreventableCompact.tsx`. Slots: `cocoDiagram`,
`cocoBandaged`, `propFirstAidKit`, `propContactsCard`, `propVetWrapRoll` in
`src/lib/brand/manifest.ts`.

**Status: delivered 2026-09-09.** Both renders came back usable on the first
pass. This sheet is the record of what was asked for and what had to be
adapted, so a re-render lands in the same place.

---

## How this set breaks house convention, deliberately

Every other prompt in `docs/specs/` bakes a flat brand wash into the image and
exports JPG:

> `Flat solid background in soft pink #FF99C8, no gradient.`

These five are **alpha cut-outs**, because they composite over a live CSS wash
and the vet-bill band moves its props around. So:

| | The six stills in `/public/ad/` | These five |
|---|---|---|
| Background | baked flat brand hex | fully transparent |
| Format | JPG q≈82 | PNG-24 with alpha |
| Shadow | `Single soft contact shadow` baked | drawn in CSS, or none |
| Aspect | 4:5, 1122×1402 | whatever the subject is, trimmed |

**Trim every replacement to its alpha bounding box.** The two delivered renders
arrived as 1024×1024 with 55–157px of dead transparent margin per edge.
`cocoHero` shipped that way once: it read smaller than its box, and a `w`/`h`
that disagreed with the file was the source of the home page's stubborn 0.004
CLS. The diagram's pin coordinates are percentages of the image box, so
untrimmed padding silently moves every pin.

---

## Shared setup

**Reference attachment:** `public/brand/coco-hero.png`

Set character reference weight high — around **0.6–0.75** on Midjourney
`--cref`, or "keep the subject's face, coat and ear shape identical to the
reference" on Nano Banana / Gemini / GPT-image.

**Character sheet** — restate in every prompt, same as the ad stills:

> French Bulldog, young adult, compact. **Fawn** coat (warm sandy tan,
> ~`#D9AE7E`), paler cream on chest. Dark brown-black mask (~`#3A2E28`) over
> muzzle and under the eyes. Large upright bat ears, dusty pink-grey inner
> ear. Large round warm brown eyes. Broad dark charcoal nose, deep wrinkle
> roll. Fawn paws with **charcoal pads**. Soft 3D character render — clean
> rounded forms, warm even lighting, subtle fur detail, gentle contact shadow.
> Not photoreal, not flat vector, not cartoon-outlined.

Coco is fawn, **not brown-and-white and not brindle**. The dark on her face is
a mask, not patches.

**No text anywhere.** Not on the dog, not on the props. Headlines and labels
are set live in Poppins Bold by the page — baked type can't be edited,
localised or A/B tested, and rendered lettering comes out garbled.

---

## Prompt A — `coco-french-bulldog-body-language-diagram.png`

**Carries:** the R.E.A.D. method as a diagram instead of four text cards. The
page pins numbered markers onto her, so **the pose is a hard requirement.**

```
Soft 3D character render of a fawn French Bulldog standing square
in a neutral, alert, relaxed stance, seen in a clean side-on
three-quarter view turned about 30 degrees toward camera. All five
body regions fully visible and unobstructed: both bat ears upright,
both eyes visible, mouth gently closed, short tail held level and
visible clear of the hind legs, and all four legs separated so the
posture and weight distribution read clearly. Calm neutral
expression — not alert-aroused, not playful, not anxious. This is a
reference pose, so nothing is exaggerated.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Fully transparent background, real alpha channel, no ground plane,
no baked shadow of any kind. The dog's silhouette must fill x 18-82%
and y 8-96% of the frame, standing level, nose tip at approximately
x 76%, tail tip at approximately x 20%. Trim all empty margin — no
transparent padding. Clean rounded 3D forms, subtle fur detail,
appealing character-design quality. 4:5 portrait frame. No text, no
logo, no props.
```

**Negative:** `text, letters, watermark, logo, gradient, background colour, ground plane, baked drop shadow, photorealistic, sitting, lying down, head tilt, play bow, tail wagging, motion blur, tongue out, open mouth, panting, snarling, bared teeth, brindle or white coat, floppy ears, multiple dogs, cropped limbs, tail hidden behind legs`

**Watch for:** **the failure mode is a merged silhouette.** If the front and
back legs overlap into one shape, the posture pin has nothing to point at.

### What was delivered, and the one thing that changed

Trimmed to **730×860**. Silhouette fills x 13–85%, y 9–93%.

**No visible tail** — which the prompt asked for and which a French Bulldog
barely has. Rather than re-rolling, the A pin moved to her topline and points
at posture. The step's own wording makes that the better read anyway:

> Tail height and stiffness, posture, and where their weight is sitting. **The
> tail gets the attention but posture tells the real story.**

So a diagram that pins posture is closer to the guide than one that pins a
tail. Client agreed: *"proceed without that tail, Coco's don't have long tail
either way."* A future re-render need not chase one.

Measured pin positions, and the only numbers to retune if the image changes:

| Step | Pin at | Anchors |
|---|---|---|
| E — Eyes, ears, mouth | x 87%, y 41% | the dark muzzle |
| A — Assess the body | x 24%, y 47% | the topline behind the shoulder |

The E pin sat at x 76%, y 30% first and half-covered an eye, which is a silly
thing to do on the step about reading eyes.

Only E and A are pinned. R ("relax yourself first") and D ("decide") are
instructions to the human — there is nothing on a dog to point at, and
inventing two more pins would make the diagram lie about what the method is.

---

## Prompt B — `coco-french-bulldog-bandaged-paw-recovering.png` + 3 props

**Carries:** the `/vetbill` angle. Tone rule, verbatim from the ad spec:
**protective, never predatory — if the still could sit in an insurance ad,
it's wrong.**

> ### This bends a live prohibition
>
> `community-ad-image-prompts.md` lists **`bandage` in the negative prompt**
> for the `/vetbill` ad still, reasoning: *"the pouch reads as preparedness,
> not treatment… The dog must look healthy — the promise is 'you can be ready
> for this', not 'your dog is ill'."*
>
> Eli asked for the bandage deliberately, so it ships. The rule it bends is
> still live: **if a future render reads as a sympathy shot, it is wrong and
> the old prohibition wins.**

```
Soft 3D character render of a fawn French Bulldog sitting upright
and square to camera, calm and settled, looking straight at the
lens. Her front left paw is neatly wrapped in self-adherent
veterinary wrap in soft light blue, three or four clean even turns
from the toes to just below the wrist. The wrap is clean, tidy and
unstained. No wound, no blood, no swelling and no redness is
visible anywhere. She sits comfortably with weight on the other
three legs and the wrapped paw resting naturally forward. Ears
upright, eyes soft and calm, mouth gently closed. She is recovering
and completely fine — dignified and settled, faintly pleased with
herself. Not sad, not pleading, not pitiable.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Fully transparent background, real alpha channel, no ground plane,
no baked shadow. Trim all empty margin. Clean rounded 3D forms,
subtle fur detail, appealing character-design quality. 4:5 portrait
frame, subject inside the middle 80%. No text, no logo.
```

**Negative:** `text, letters, watermark, logo, gradient, background colour, ground plane, baked drop shadow, photorealistic, sad dog, sick dog, distressed expression, pleading eyes, cone of shame, e-collar, IV line, drip, cage, crate, veterinary clinic, hospital, exam table, needle, syringe, stethoscope, splint, cast, white bandage, red cross, blood, wound, swelling, dark or clinical lighting, brindle or white coat, floppy ears, multiple dogs`

**Watch for:** **the failure mode is a sympathy shot.** If she reads as needing
rescue rather than already recovered, it is the insurance ad the brief forbids.
Soft calm eyes, upright ears, no head tilt. The bandage is evidence the night
is over, not that it is happening.

### The props

Asked for as three separate files. **Delivered as one 1024×1024 frame holding
all four subjects** — Coco left, props in a column right — and split in
post, which worked out better than three generations would have.

The split was measured, not eyeballed: an alpha column profile found a clean
empty gutter at x 617–694, and row profiling inside x 694–969 found the three
props at y 63–349, 431–619 and 729–929 with 82px and 110px gaps. Each piece
was then trimmed to its own alpha bbox.

| Slot | File | Trimmed |
|---|---|---|
| `cocoBandaged` | `coco-french-bulldog-bandaged-paw-recovering.png` | 550×884 |
| `propFirstAidKit` | `prop-pet-first-aid-kit.png` | 264×286 |
| `propContactsCard` | `prop-emergency-contacts-card.png` | 256×188 |
| `propVetWrapRoll` | `prop-vet-wrap-roll.png` | 275×200 |

The kit matches the coral pouch already in
`public/ad/coco-french-bulldog-pet-first-aid-kit.jpg` — that prop exists and
should not be redesigned. The contacts card is blank ruled lines with a pen,
no lettering, standing in for the guide's "fill these in before you ever need
them" page.

**The props are a row under Coco, not floating on her.** They were positioned
over her first and it failed: the asset is trimmed, so she fills the box and
every position inside 0–100% lands on the dog — the wrap roll sat across her
muzzle and read as her eating it. Measured afterwards, the only prop-sized
empty region inside her silhouette is x 4–29%, y 38–62%. One prop fits there;
three do not. A row underneath also just reads better: three objects in a line
are a kit, which is what they are.

---

## Review checklist

- [x] Coco is recognisably the same dog as the reference in both renders
- [x] Fawn coat, charcoal mask, upright bat ears, charcoal pads
- [x] No text or lettering anywhere, including on the props
- [x] No colour outside the locked palette — the vet wrap is sky `#A8DEFA`,
      the pouch coral `#F4837E`
- [x] Coral appears only on a prop, never as a wash — coral is the click
      colour and stays reserved
- [x] The bandaged render reads as recovered, not pitiable
- [x] Real alpha channel on all five, verified byte-level
- [x] Every file trimmed to its alpha bbox, zero dead margin
- [x] `w`/`h` in the manifest re-probed from the trimmed files
- [x] `ready: true` on all five slots
- [x] Lighthouse accessibility 100 on both variants after wiring

---

## Notes

**Source renders** are kept at `docs/specs/source-renders/` — out of
`/public/`, which is web-served, but preserved because they are the only
copies and the splits derive from them.

**TODO(Eli):** the three motion poses (`play-bow`, `loose-wag`, `zoomies`) were
prompted and are not generated. They were intended as a signal row on
`/decode/b`, and the annotated diagram took that slot instead, so there is
nowhere for them to go yet. Prompts are in the session log if that changes.

**Not to be confused with** `docs/illustrations/CTWC illustration prompts.md`,
which is a different job with a different style block — flat vector
children's-book illustration for the guide PDF interiors, not soft 3D renders
for the site. Note its palette is *nearly* the site's but not identical
(`#E8877D` vs `#F4837E` coral, `#F4F0E9` vs `#FDF9F5` cream), which is worth
reconciling before those land in a PDF the site quotes.
