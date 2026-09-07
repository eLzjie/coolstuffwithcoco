# Progress log — Cool Stuff with Coco

**Last updated:** 2026-09-08
**Repo:** `github.com/eLzjie/coolthingswithcoco` · branch `main` at `ef4fa9e`
**Domain:** coolstuffwithcoco.com
**Stack:** Next.js 16.3.4 (App Router) · React 19.2.8 · Tailwind 4 (CSS-first tokens) · Motion 13

> The repo is still named `coolthingswithcoco`. That's only a repo name and doesn't affect anything served — the site, the brand and the IG handle all agree on "stuff".

---

## Where things stand

The three public pages are **built, responsive, instrumented and pushed**. Real assets are in for everything except two quiz photos and three Open Graph images.

**Email capture is not built yet.** That's tomorrow's work, and it's blocked on three questions (see [Next up](#next-up--capture-forms)).

| | Status |
|---|---|
| Home, `/decode`, `/vetbill` | Built |
| Thank-you pages | Scaffolds — layout + event hooks, no offer copy |
| `/privacy` `/terms` `/refund-policy` `/contact` | Route scaffolds, no legal text |
| Email capture forms | **Not built** — placeholder embed slot in place |
| Checkout | Out of scope, lives in GHL |

### Measured (Lighthouse mobile, production build)

| Page | Perf | A11y | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 2.1s | 0 |
| `/decode` | 94 | 100 | 100 | 100 | 3.1s | 0 |
| `/vetbill` | 97 | 100 | 100 | 100 | 2.6s | 0 |

Accessibility 100 and CLS 0 across all three. `/decode`'s LCP is the one soft spot — Coco is the LCP element there and she was deliberately made bigger; capping her display width on that page alone would claw it back if the media buyer's CPL suffers.

---

## Decisions that override the brief

**These are the ones to re-read before touching anything**, because the written brief says the opposite and following it would undo the work.

| # | Brief said | Actual | Why |
|---|---|---|---|
| 1 | Name is "Cool **Things** with Coco"; only the IG handle is "stuff" (§8) | **"Cool Stuff with Coco"** everywhere, domain `coolstuffwithcoco.com` | Eli corrected it 2026-09-07. Name, handle and domain now all agree; the §8 naming clash is fully closed. |
| 2 | Coral is the primary accent | **Coral is a fill only, never text** | Measured 2.39:1 on Paper — fails body *and* large text. Display type is Ink. |
| 3 | `parent_audience = pets-dogs` | `"Pets > Dogs"` | The later forms spec changed it. **If a GHL workflow branches on `pets-dogs` it will silently break.** |
| 4 | Custom in-page form, no iframe | Iframe placeholder currently in place | Eli's call 2026-09-07 for speed. The forms spec reverses it again — see below. |
| 5 | Disable parallax on mobile (my call) | **Parallax runs on mobile** | Mobile is the primary view, not a secondary target. |

### Locked design constraints

- **Coral (`#F4837E`) is a fill only.** 2.39:1 on Paper. Buttons get Ink text on coral (6.74:1).
- **`--color-ink-muted` is ink at 75%** — the *lowest* opacity clearing 4.5:1 on all six backgrounds. Bubblegum binds it at 4.98. Anything lighter fails AA there. Below 75% is decorative borders and icons only.
- **The four pastels carry meaning:** Bubblegum = `/decode` (curiosity), Sky = `/vetbill` (protective), Mint = Library/paid, Butter = community. The two home guide panels already wear the colour of the page they lead to.
- **`--coco-*` tokens** (fawn, shade, pad, mask) are for *drawn depictions of Coco only* — sampled from her photos. Never UI colour.

### Two motion rules that are load-bearing

Both were real bugs, both cost measurable metrics, and both are easy to reintroduce:

1. **Nothing that carries content may be hidden waiting on hydration.** Motion's `whileInView` writes `opacity: 0` into the *server-rendered* HTML — it was hiding the two guide panels (the primary conversion route) until ~196KB of JS hydrated. Section reveals and the panels are CSS scroll-driven now: the resting state **is** the finished state, so Firefox, Safari < 26, reduced-motion and JS-disabled all show finished content.
2. **Nothing animates the LCP element.** The hero `h1` was briefly a `motion.h1` with `initial: opacity 0` and cost **2.35s of LCP render delay**. The load sequence is CSS (`.rise`) and the h1 is excluded from it entirely. No `h1` anywhere carries `reveal-heading`.

Also: overshoot on scroll-driven entrances must live in the **keyframes**, not the timing function — on a scroll timeline the scroll *is* the easing, so a bouncy cubic-bézier does nothing. `animation-delay` is likewise ignored, which is why `Reveal` has no stagger prop.

---

## Assets

### In and working

| Asset | Notes |
|---|---|
| `logo.png` | Square badge, 1254². Nav + footer, paired with the `coolstuffwithcoco` wordmark |
| `coco-hero.png` | 675×1087. **Cropped** from 815 — carried ~166px of empty transparent margin, so a fifth of the layout width was blank |
| `coco-about.jpg` | Real photo, the waving-paw section |
| `coco-avatar.jpg` | Illustrated render |
| `cover-decode.svg` `cover-vetbill.svg` | Designed SVG covers in the locked palette |
| `ig-01` … `ig-06` | Six real photos, Instagram grid |
| 4 ad stills in `/public/ad/` | Descriptive filenames, JPG q82 (7.4MB → 752KB) |
| 1 of 3 quiz signals | The side-eye still doubles as the whale-eye signal |

### Still needed

1. **Two quiz signal photos** — the yawn and the stiff high tail. Prompts written: [`docs/specs/decode-signal-image-prompts.md`](specs/decode-signal-image-prompts.md). These are harder than the ad stills because they must be *readable as a specific signal*, not just look like Coco.
2. **Three OG images** (`og-home`, `og-decode`, `og-vetbill`, 1200×630) — currently `ready: false`, so pages ship without an OG image.
3. **Real guide PDFs** — every chapter title and description is paraphrased from the brief's summary table, not the actual files.
4. Optional: a horizontal logo variant and a single-colour version for the ink footer.

### How to swap an asset

1. Drop the file into `/public/brand/` (or `/public/ad/`) with the exact filename in `src/lib/brand/manifest.ts`.
2. Flip `ready: true`.
3. **Re-probe the dimensions and update `w`/`h` to match the file exactly.**

Step 3 is not optional and it bit us: `cocoHero` was declared 1024×1280 against an 815×1087 file, so the browser reserved a 0.80 box from the attributes and reflowed to the real 0.75 on load. That was the source of the home page's stubborn 0.004 CLS.

---

## Gotchas worth remembering

**Replacing an image without changing its filename serves a stale optimized version.** Next keys its image cache on the URL, so it never re-optimizes. It cost real debugging time: the file on disk was correct, `curl` returned the right dimensions, and the browser kept rendering the old aspect ratio. `rm -rf .next/cache/images` fixes it locally. **On Vercel, version or content-hash the filename when swapping an image in production**, or the old one can persist.

**Element screenshots time out on this site.** The ambient CSS loops never settle, so Playwright's "wait for element to be stable" never resolves. Scroll and take viewport screenshots instead.

**The dev server caches optimized images too** — and the browser caches on top of that. Verify image changes against a *fresh port* (new origin = no browser cache), or check the bytes with `curl` + `ffprobe`.

---

## Next up — capture forms

Spec: the "Coco Capture Forms & Subscribe Endpoint" prompt. Plan presented and awaiting answers.

**Scope:** one form component in three places (`/decode`, `/vetbill`, home newsletter), one `POST /api/subscribe` that upserts to GHL and fires a delivery webhook, Pixel + CAPI on a shared `eventId`. Email field only. **Nothing checkout-related.**

### Three blocking questions

1. **Idempotency contradicts itself.** Step 4 says a repeat submission "does not re-fire delivery"; the webhook rationale says it "fires on every submission regardless of whether the contact already exists." These only reconcile if idempotency is scoped to the **(email, leadMagnet) pair** — same pair, don't re-fire; different magnet (a subscriber returning for the second guide), do fire. That needs somewhere to remember the pair; cheapest is a per-concept `delivered:*` tag on the GHL contact. **Does writing those tags conflict with the workflows?**
2. **How does server-side CAPI learn consent state?** Only the browser knows it. Either the request carries a consent flag (a change to the documented request body) or the gate covers the Pixel only. Also: region detection isn't wired — is the gate active at launch, or default-granted?
3. **Where does paid non-Meta, non-Pinterest traffic land** in the four-value `traffic_source` enum (`Meta | Pinterest | Organic | Direct`)? It currently has nowhere to go.

### Safe defaults, will proceed unless objected to

- **Rate limiting in-memory**, behind an interface — best-effort on serverless, not truly enforced. Swap to Upstash Redis if real abuse appears.
- **`parent_audience = "Pets > Dogs"`** per the newer spec (see override #3 — check your workflows).
- **Consent stays on `localStorage`.** The spec's "no localStorage" reads as scoped to the form; moving consent to `sessionStorage` means re-asking every visit, which is worse for the visitor.
- **Newsletter stays in the `InboxPreview` section** above the footer, *not* inside `<Footer>` — the footer is shared with `/decode` and `/vetbill`, where nothing may compete with the form.

### One scope collision to resolve

`OfferScaffold` **already exists** on both thank-you pages and fires `offer_view` / `initiate_checkout` / `decline_offer`, built because the site brief §4.4 asked for it. The forms spec says don't define those events and nothing checkout-related in the diff. **Recommendation: leave it untouched** — it's pre-existing, not something the forms task would add. Say the word to strip it and it's a separate commit.

---

## Compliance state

| Item | Status |
|---|---|
| Disclaimer on every page footer | Done — short form + long form |
| Two emergency hotlines | **Done** — ASPCA `(888) 426-4435`, Pet Poison Helpline `(855) 764-7661`, as `tel:` links at the *top* of the footer |
| Call-now table framing | Done — disclaimer inside the component's own frame, every row points at a phone call, tier two labelled "Ring your vet today" and never "wait" |
| **Vet sign-off on the call-now table** | **NOT DONE — blocks launch.** Categories come from the brief's description, not a clinical source |
| Pet insurance | Informational only, never a recommendation |
| Refund policy live before checkout | Route scaffolded, no copy. **Blocks taking money** |
| No unverified statistics | Done — all cost figures are `TODO` placeholders rather than invented ranges; the single-source search-volume figures are off the site entirely |
| Permission-based capture | Copy renders with the form, nothing pre-ticked, decline path visible |
| Legal text | Not drafted — deliberately. Four scaffolds state what each must cover |

Both hotlines are **US**. If the site takes meaningful UK/EU traffic they need a regional equivalent alongside them.

`grep -rn "TODO(Eli)" src/ docs/` for the full list — roughly 35 across 19 files. The heaviest is `src/lib/content/guides.ts` (11), which is where the unverified copy lives.

---

## Commits

```
ef4fa9e  Use the existing side-eye still for the first quiz signal
34f1239  Add wordmark lockup and rebalance the landing page heroes
d09de54  Add the four ad stills with descriptive filenames
a26534e  Fix mobile CTA wrap and rebalance the desktop fold
dd14c2e  Make scroll entrances playful and give Coco her real colouring
568b120  Ship on coolstuffwithcoco.com and add the verified hotlines
4e6588e  Wire in real Coco assets, logo and SVG guide covers
fb18bab  Add image prompt spec for the four community ad stills
7ff2e59  Document setup, asset swap and CRM mechanism
841836d  Add landing pages, thank-you scaffolds and legal routes
1b96381  Build home page
c808e47  Add motion primitives
f1e5dca  Add event, consent and attribution layer
eddefb7  Add brand asset layer with placeholder fallbacks
d1ccdb5  Set up Next.js shell with locked brand tokens
```

## Docs

- [`README.md`](../README.md) — setup, env vars, asset swap, CRM mechanism, contrast table, motion rules
- [`docs/specs/community-ad-image-prompts.md`](specs/community-ad-image-prompts.md) — the four ad stills (all generated)
- [`docs/specs/decode-signal-image-prompts.md`](specs/decode-signal-image-prompts.md) — the two remaining quiz signals
- [`public/brand/README.md`](../public/brand/README.md) — asset list with shot notes

---

## Before launch

1. Vet sign-off on the call-now table
2. Refund policy copy live, before checkout is
3. Real guide PDFs, then re-check every chapter title against them
4. Build the capture forms (answers to the three questions above)
5. Decide banner vs CMP, then load the Pixel from behind the gate
6. Three OG images, two quiz signal photos
7. Confirm `parent_audience` doesn't break existing workflows
8. Re-run Lighthouse after the asset swaps — LCP moves when real images land
