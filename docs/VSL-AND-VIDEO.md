# The thank-you page video — script, production, and one strong recommendation

Chase asked: *"maybe it's a talking-head VSL of Coco pitching it?"*

**Recommendation: don't build an AI talking Coco. Not now, not later.** Build a
captioned real-footage clip with her human's voiceover instead, and not before
launch.

The instinct behind the question is right — a warm human moment on that page is
worth having. It's the *AI-synthesised talking dog* specifically that's the
problem, and the evidence against it is stronger than "it might look a bit
naff".

---

## Why not, in four parts

### 1. It backfired publicly, one month ago, in this exact format

In August 2026 Warner Bros promoted *The End of Oak Street* using DogPack's
AI-animated, synthetically-voiced talking dogs. It drew a multi-platform
backlash, with top comments saying it *"actually damaged the odds I will be
seeing"* the film.

Same species, same year, same technique, and it failed on **trust** — which is
the only asset this brand has.

### 2. The damage tracks *suspicion*, not actual AI use

- Harris Poll / 4As / Infillion, June 2026: **73%** are less likely to trust an
  ad they suspect is AI-made; **78%** say AI makes ads feel less authentic.
- NN/g's experiment found the penalty attaches to *being suspected*, not to
  whether AI was used.

A synthesised dog mouth is close to the most suspicion-triggering artifact you
could put on a page selling to worried dog owners.

### 3. It's a one-way door that contaminates the real photos

Once an AI Coco exists, **every genuine photograph of Coco becomes deniable.**
Animal nonprofits already report audiences asking whether real rescue footage
is AI-generated. The brand's core asset is that Coco is a real dog whose human
learned this stuff the hard way. One synthetic sibling in the library puts that
permanently in question.

This is why the rule below is *no synthesised Coco anywhere on the site* — not
merely "no talking-head video".

### 4. You'd be legally required to label it, on the one page that needs believing

**EU AI Act Article 50** has applied since 2 August 2026 and requires deepfake
disclosure *even with no intent to deceive, and even where no real person is
depicted.* The FTC grants no AI exemption from its deception and endorsement
rules.

So a talking AI Coco needs a visible "AI-generated" badge sitting next to your
price and your offer terms. Self-defeating.

### And the number that was supposed to justify it doesn't exist

The widely-quoted *"VSL converts 2–3× static copy, per Unbounce's 44,000-page
report (12.7% vs 4.8%)"* **does not appear in the source it's attributed to** —
that page rests on the author's personal observation. The similarly-quoted
*"order bumps convert 30–40% per SamCart's $7B"* isn't on SamCart's page
either.

Which means the case for video here should be made on its merits, not on a
laundered statistic. The burden of proof sits with the video.

---

## What to build instead

**Real Coco on screen, her human's voiceover, captions burned in and a real
`<track>`.** This isn't a consolation prize — it fits the locked brand voice
*better*. The spec says "first person from Coco's human, dry rather than cute";
a talking dog is by definition a character voice, which is the one register the
brand has ruled out.

It's also shootable on a phone in an afternoon.

### Placement rules, non-negotiable

| Rule | Why |
|---|---|
| **Below the download.** Always. | Download-outranks-offer is locked, and a `<video>` poster is an LCP candidate that would compete with hero text already carrying JS render delay. |
| **Click-to-play, muted, with a poster.** | No autoplay-with-sound: blocked by Chrome/Safari without prior engagement, and a WCAG 1.4.2 failure (technique F93) if audio runs past 3s with no stop control. |
| **Real WebVTT captions.** | WCAG 1.2.2 Level A for prerecorded video with audio. Burned-in text alone doesn't satisfy it. |
| **Full controls, no forced sequential playback.** | The "can't skip ahead" mechanic VSL advocates recommend violates WCAG 2.2.2 *and* the locked no-dark-patterns rule simultaneously. |
| **Lazy-loaded.** | It must not touch the LCP path. |
| **45–75s, hard ceiling 90s.** | |
| **Suppressed under `prefers-reduced-motion` if ever muted-autoplayed.** | `globals.css` already establishes this discipline at lines 85 and 424. A video must not be the exception. |

### The video is never the sole carrier of the offer

Price, the availability disclosure and the decline path must **all** exist as
page text in the DOM. Video isn't crawlable, isn't reliably screen-readable,
and may not load. There's also a specific trap: a video implying the Library is
finished while the page text admits it isn't creates two conflicting claims on
one page, which is worse than either alone.

### Analytics

Don't rewire `offer_view` to fire on video play. It fires on mount and is the
funnel **denominator** — moving it would silently inflate the offer's apparent
performance. If play tracking is wanted later, it reuses the existing
vocabulary distinguished by `content_name`.

---

## Script — 30 seconds (build this one first)

Written for **human voiceover over real footage**. Nothing here is spoken by
Coco.

| Time | On screen | Voiceover |
|---|---|---|
| 0–4s | Coco close, head tilted | "That head tilt isn't confusion. She's working out where your voice is coming from." |
| 4–9s | The guide open on a phone | "That's in the guide you just downloaded — along with the ears, the tail, and the stuff you'd never guess." |
| 9–16s | Coco alone, watching a door | "Here's what it doesn't cover. Ask owners what worries them most and it isn't the barking or the chewing. It's what happens when they leave." |
| 16–23s | Printables fanned on a table | "So that's what I'm writing next. Telling a bored dog from a genuinely distressed one — and what to do about either. Plus the fill-in stuff: vet records, medication, the sitter handover sheet." |
| 23–30s | Coco settled, looking up | **[PRICE SLOT]** "It isn't finished yet. Fifteen dollars if you're on the list, and I'll email you the day it's up. Link's just below." |

**The price is in ONE marked slot**, at the very end, so it can be re-recorded
in isolation when the number changes. Note it also states the guides aren't
finished *in the same breath* as the price — that pairing is required, not
stylistic.

### Script — 60–75 seconds (only if the 30 performs)

Same opening four beats, then insert before the price beat:

| Time | On screen | Voiceover |
|---|---|---|
| +0–8s | Coco, slow blink | "There's a thing in the guide called the R.E.A.D. method. Relax yourself first, because she reads your stress before you read hers. Then eyes, ears, mouth. Then the body. Then decide — comfortable, or does she need space?" |
| +8–16s | Coco turning away from the camera | "Four steps, and it works on any dog anywhere. It's the page people tell me they screenshot." |
| +16–24s | Empty room, lead on a hook | "What it won't tell you is what she does when the door shuts. That's a different question and it needed its own guide." |

Then the price beat, unchanged.

### Caption track

Ship a real `.vtt`. Keep cues to **two lines, ~42 characters per line**, broken
at clause boundaries rather than mid-phrase — most viewers watch muted, so the
captions *are* the script for them.

```vtt
WEBVTT

00:00:00.000 --> 00:00:04.000
That head tilt isn't confusion.
She's placing where your voice came from.

00:00:04.000 --> 00:00:09.000
That's in the guide you just downloaded —
ears, tail, and the stuff you'd never guess.
```

### What the video must never do

- No clinical advice. **Especially on `/vetbill`**, which has no veterinary
  sign-off. A spoken delivery makes the same words sound more authoritative,
  which *increases* the exposure rather than reducing it.
- No invented testimonials, no urgency, no countdowns.
- **No statistics at all in the audio.** Audio escapes copy review in a way
  body text doesn't. In particular the 85.9% separation-anxiety figure must
  never appear anywhere — the paper's own authors disowned it. The sourced
  numbers (61%, 72%) live in the page text, and the script deliberately
  paraphrases them as "ask owners what worries them most" instead.
- No implication the Library is complete.

---

## Magic Hour — what's actually true

I got this wrong earlier and want to be straight about it: I said Magic Hour
"supports animal faces explicitly." That's what its **marketing** page says.
Its **developer docs are human-only and never mention animals**, and it doesn't
disclose the underlying model.

### The honest capability picture

`POST /v1/ai-talking-photo` is a real, documented product. But:

- **Animal support in this model class is *emergent*, not trained.** The
  reference paper for animal image animation (JoyVASA) trains only on human
  speaking data (HDTF, CelebV-HQ), publishes **no animal metrics**, and shows
  animals in a single qualitative figure. The phoneme-to-mouth prior is
  human-derived and warped onto whatever face is detected.
- **A brachycephalic French Bulldog is the worst case in the category** — no
  protruding muzzle, heavy jowls, short lip line. Everything the human prior
  expects is absent.
- Verdict: **UNVERIFIED for this face.** Not "won't work" — unproven, and
  cheap to disprove.

### The thing nobody expects: in the mode you'd use, there is no prompt

`style.prompt` is **ignored** unless `generation_mode: "prompted"` — and that
mode *explicitly lowers likeness* and cuts max duration from 300s to 45s.

So in the default `realistic` mode the controllable surface is **the photo, the
audio, and the duration**. Which means the highest-leverage "prompt" is the
photo brief and the script, not a text string. Anyone handing over a clever
paragraph of prompt text for this endpoint is handing over something the API
discards.

### Three hard blockers

**1. No asset in the repo qualifies.** Talking Photo needs a tight,
front-facing, well-lit head crop, one face, ≥512×512, unobstructed
eyes/nose/mouth.

| Asset | Reality |
|---|---|
| `coco-hero.png` | 675×1087 **illustrated render** on transparency, full-body seated |
| `coco-avatar.jpg` | also an illustrated render (per the manifest) |
| `coco-about.jpg` | the only real photo — but full-body seated, evening light |

`public/brand/README.md` already asks for exactly the shot needed
(*"coco-hero.jpg 1400×1600, Coco head-on, eyes near the upper third, shot
tight"*) and it hasn't been delivered. **So this is blocked on a new photo from
Ash** — and the build spec says don't hold the launch for those dependencies.

**2. The TTS voices are a legal hazard.** Magic Hour's `voice_name` enum is a
celebrity/character impression library — Morgan Freeman, Obama, Elon Musk, Joe
Rogan, SpongeBob, Darth Vader — documented under "Tech Leaders / Podcasters /
Politicians / Entertainers / Characters", with **no generic narrator tier and
no likeness disclaimer.** Using one in a paid funnel is a right-of-publicity
problem and contradicts Magic Hour's own FAQ.

Use **recorded real audio** from Coco's human, or their own consented voice via
Voice Cloner. Never the enum.

**3. The free tier is personal non-commercial only.** Nothing generated on it
can ship on this page. Creator (~$10/mo billed annually) is the minimum.

### The API, correctly

```
POST /v1/ai-talking-photo
{
  "assets": {
    "image_file_path": "<tight portrait head crop, >=512x512>",
    "audio_file_path": "<your recorded voiceover>"
  }
}
```

Both asset paths are **strictly required**. There is no `text` field, no
`voice_name`, no TTS — TTS is UI-only, not in the API.

Other constraints:
- Output is **hard-capped at 720p** with **no aspect-ratio or orientation
  parameter** — crop the source to portrait *before* submitting, because the
  geometry can't be fixed afterwards.
- **One face per photo.** No two-shot of Coco and her human in a single job.
- Keep clips **well under 30s** — Magic Hour's own guidance, and longer clips
  show documented facial-structure and head drift.
- It's an **async offline job API**: create returns an id, then poll Get Video
  Project or use webhooks. Nothing about it belongs in the Next.js request
  path.
- Don't target `pro` / `standard` / `stable` / `expressive` — deprecated.
- Don't target the **Animation** endpoint (48 stylised `art_style` enums, 54
  audio-reactive camera effects, lyric-video oriented). It will destroy the
  real photograph. Face Swap Video and Head Swap are irrelevant here.

### If you want the subtle-motion version instead

The best achievable thing in the same tool that needs **no new asset** and
makes **no mouth-sync claim**:

```
POST /v1/image-to-video
{
  "assets": { "image_file_path": "public/brand/coco-about.jpg" },
  "audio": false,
  "end_seconds": 5,
  "style": {
    "prompt": "subtle natural motion, gentle breathing, one slow blink, slight ear movement, very slow camera push in, photorealistic, no mouth movement, no speaking"
  }
}
```

**`audio: false` is not optional.** LTX 2.3, Kling 2.5/3.0, Sora 2 and Veo 3.1
all generate native audio, and would put uncontrolled invented speech on a
compliance-locked page.

This matches the site's existing motion vocabulary (`bob`, `drift`, `breathe`)
and reads as a living photograph rather than a puppet.

### The photo brief — the actual high-leverage input

If Ash can shoot one thing this week, it's this:

- **Head-on**, both eyes visible, no profile.
- **Tight crop**: head and a little chest, filling ~60% of frame.
- **Even light from the front** — window light works. No hard side shadow
  across the muzzle, no backlight.
- **Mouth closed.** This is the one that matters most: an open-mouth pant gives
  the model an ambiguous starting position and is where muzzle warping comes
  from.
- **Plain, uncluttered background.**
- **≥1400×1600**, portrait, real photo — not a render.
- Eyes near the upper third.

---

## Settle the unverified question for ~£0

Before any design depends on it:

1. Take one head-on photo of Coco per the brief above.
2. Record 5 seconds of the voiceover.
3. Run one Talking Photo job on the free tier (3 jobs/day, 5s) — **for
   evaluation only**, since the free licence forbids shipping it.
4. Apply the go/no-go below.

That converts an argument into an answer for the price of an afternoon.

### Go / no-go, in 30 seconds

Watch it **muted, twice**. Fail it on any of:

- The muzzle changes shape between frames
- Teeth appear that shouldn't be there
- The eyes go dead or dart unnaturally
- The jaw moves independently of the head
- Tongue artifacts
- Two people say "that's a bit weird"

**And even if it passes all six, the recommendation above still stands** — the
reputational and disclosure arguments don't depend on output quality. A
technically flawless AI talking dog is still an AI talking dog on a trust page.

---

## The hard rules, collected

1. **No video ships for launch.** The build spec's minimum viable Wednesday is
   fields + suppression + Decode delivery + the Decode form + the thank-you
   download. Video isn't on that list.
2. **No AI-generated talking Coco.** Not lip-synced footage, not a synthesised
   voice, not an animated Coco.
3. **No AI-synthesised Coco anywhere on the site, ever** — not just in video.
4. **Video never sits above the download.**
5. **No autoplay with sound.** Captions mandatory. Full controls.
6. **The video is never the sole carrier of price, availability or the decline
   path.**
7. **Never a celebrity/character TTS voice.**
8. **`audio: false` on any image-to-video job.**
9. **No stats in the audio.** Never the 85.9% figure.
10. **Nothing reads as clinical advice**, `/vetbill` most of all.

---

## Where this sits

| | |
|---|---|
| Launch | No video. The page is complete without it — that's by design. |
| v1.1 | 30s real-footage clip, human VO, captions, click-to-play below the download. Needs one photo/video shoot and a voice recording. |
| Never | AI talking Coco. |

If Chase wants to test the talking-animal format, the place for it is a **paid
ad creative**, where it's cheap to kill and isn't standing next to the price on
the page that has to be believed. Not here.
