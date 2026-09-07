# Image prompt spec — /decode signal photos (2 needed)

For **"Guess the signal"** on `/decode` — the three-step quiz that carries the page's locked ad angle ("most owners get it wrong"). Component: `src/components/decode/GuessTheSignal.tsx`, slots: `signal-*` in `src/lib/brand/manifest.ts`.

## Status: 1 of 3 already covered

| Signal | Image | Status |
|---|---|---|
| The side-eye | `coco-french-bulldog-side-eye-body-language.jpg` | **Done** — the ad still was generated from the side-eye prompt, so it *is* this signal. Referenced in place from `/public/ad/`. |
| The out-of-nowhere yawn | `coco-french-bulldog-yawn-calming-signal.jpg` | Needed — prompt below |
| The wag that isn't a welcome | `coco-french-bulldog-stiff-high-tail-arousal.jpg` | Needed — prompt below |

---

## Why these two are harder than the ad stills

The ad stills only need to look like Coco. **These have to be readable as a specific signal**, because the visitor is asked to look at the photo and commit to a guess. If the signal is ambiguous, the quiz doesn't work — the reveal lands on someone who couldn't see what they were meant to be reading.

So the pass/fail test for each is one question: **could someone who has never seen the guide identify what her body is doing?** If not, regenerate. Don't settle.

---

## Shared setup

**Reference attachment:** `public/brand/coco-hero.png`
Set character reference weight high (~0.6–0.75 on `--cref`, or "keep the subject's face, coat and ear shape identical to the reference").

**Character sheet** — restate in every prompt, same as the ad stills:

> French Bulldog, young adult, compact. **Fawn** coat (warm sandy tan, ~`#D9AE7E`), paler cream on chest. Dark brown-black mask (~`#3A2E28`) over muzzle and under the eyes. Large upright bat ears, dusty pink-grey inner ear. Large round warm brown eyes. Broad dark charcoal nose, deep wrinkle roll. Fawn paws with **charcoal pads**. Soft 3D character render — clean rounded forms, warm even lighting, subtle fur detail, gentle contact shadow. Not photoreal, not flat vector, not cartoon-outlined.

**Background: Bubblegum `#FF99C8`, flat, no gradient.** Matching the side-eye still is deliberate and non-negotiable — the quiz steps through the three one at a time, so a background change between taps reads as a glitch rather than a new question.

**Output:** 4:5 portrait, 1122 × 1402 (matching the existing still), JPG q≈82, into `public/brand/../ad/`. Then flip `ready: true` on that slot.

**No text anywhere.** The question and answers are live HTML.

---

## Prompt A — `coco-french-bulldog-yawn-calming-signal.jpg`

**The signal:** a yawn that isn't tiredness. The quiz answer is "she's settling herself down", and the wrong answer is "she's tired" — so the image must read as an *active, deliberate* yawn in broad daylight, not a sleepy one. Alert body, wide-open mouth.

```
Soft 3D character render of a fawn French Bulldog mid-yawn, three-quarter
body, seated upright and alert. Mouth open wide in a big deliberate yawn,
eyes squeezed almost shut, head tilted slightly upward, tongue curling
low in the mouth. Ears still upright and forward. Body posture awake and
engaged — sitting square, weight balanced, not slumped or drowsy.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Flat solid background in soft pink #FF99C8, no gradient. Warm even
lighting from the front, bright daylight feel. Single soft contact
shadow. Clean rounded 3D forms, subtle fur detail, appealing
character-design quality. 4:5 portrait frame, subject inside the middle
80%. No text, no logo, no props.
```

**Negative:** `text, letters, watermark, logo, gradient, photorealistic, sleeping, lying down, curled up, drowsy, half-closed sleepy eyes, bed, blanket, night, dark lighting, snarling, teeth bared aggressively, brindle or white coat, floppy ears, multiple dogs`

**Watch for:**
- **It must not read as sleepy.** A drooping body or a bed in frame gives away the wrong answer and kills the question. Upright and awake.
- **It must not read as aggressive.** A wide-open mouth with visible teeth can tip into a snarl — that's a different signal entirely and would be actively misleading in a body-language guide. Soft mouth, relaxed lips, eyes shut rather than hard-staring.
- Ears forward and up, not pinned back.

---

## Prompt B — `coco-french-bulldog-stiff-high-tail-arousal.jpg`

**The signal:** high, stiff, tense — arousal, not welcome. The quiz answer is "she's wound up, could go either way". This is the hardest of the three, because "tense" has to be visible in a dog that's inherently cute, and a French Bulldog's tail is a short stub with very little to read.

**Compensate by putting the signal in the whole body, not the tail.** Weight forward over the front paws, spine and neck straight, head high, ears hard forward, mouth closed tight, a fixed forward stare past the camera. Short tail lifted as high and rigid as the breed allows.

```
Soft 3D character render of a fawn French Bulldog standing squarely,
full body in profile-three-quarter view. Tense, keyed-up posture: weight
shifted forward over the front paws, legs straight and locked, spine and
neck held in a rigid straight line, chest pushed forward. Head up and
high, ears hard forward, mouth closed tight, eyes fixed in an intent
forward stare past the camera. Short stub tail lifted high and held
stiff. Every line of the body taut and still, like a dog that has just
spotted something.

Keep the dog's face, fawn coat, dark muzzle mask and bat-ear shape
identical to the reference image.

Flat solid background in soft pink #FF99C8, no gradient. Warm even
lighting. Single soft contact shadow. Clean rounded 3D forms, subtle fur
detail, appealing character-design quality. 4:5 portrait frame, full
body inside the middle 80%. No text, no logo, no props.
```

**Negative:** `text, letters, watermark, logo, gradient, photorealistic, sitting, lying down, relaxed posture, loose wagging tail, play bow, open mouth, panting, tongue out, smiling, soft happy expression, snarling, bared teeth, growling, brindle or white coat, floppy ears, multiple dogs`

**Watch for:**
- **The failure mode is "happy dog standing up".** If the body looks loose, or the mouth is open and panting, the image says the *wrong* answer and the question becomes unanswerable. Tight mouth, straight spine, forward weight.
- **The other failure mode is aggression.** No bared teeth, no wrinkled snarl, no lunging. The signal is *aroused and could go either way* — genuinely ambiguous is correct here. It should make a viewer slightly uneasy without looking like an attack.
- Standing, not sitting. The forward weight shift is most of the read.

---

## Review checklist

- [ ] Show each to someone who hasn't read the guide — can they say what her body is doing?
- [ ] All three sit on the same `#FF99C8` ground, so stepping through the quiz has no background jump
- [ ] Same dog as the side-eye still and the hero — compare faces directly
- [ ] Fawn coat, dark mask, charcoal pads
- [ ] The yawn reads awake, not sleepy, and not aggressive
- [ ] The tail image reads tense, not happy, and not attacking
- [ ] No text or props anywhere
- [ ] 1122 × 1402, JPG q≈82, exact filenames from the table above
- [ ] `ready: true` set on the slot in `src/lib/brand/manifest.ts`

## A note on accuracy

**TODO(Eli): verify.** These three signal explanations are standard body-language reads, but they're still claims made in a guide people will act on — and the tail one in particular is the kind of thing a behaviourist would want to phrase carefully. Worth a pass by whoever signs off the guide text, since the image and the explanation have to agree.

If a generated image can't be made to read the signal honestly, the better answer is to **cut that signal from the quiz** rather than ship an ambiguous photo with a confident explanation attached. Two clear signals beat three muddy ones.
