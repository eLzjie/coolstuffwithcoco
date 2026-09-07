# Cool Stuff with Coco

Marketing site and lead-magnet funnel. Next.js (App Router) + TypeScript + Tailwind 4, deployed on Vercel.

Three public pages plus scaffolds:

| Route | What it is |
|---|---|
| `/` | Home. Builds belief in the brand, routes to whichever free guide fits. |
| `/decode` | Paid-traffic landing page — *Decode Your Dog*. Email capture only. |
| `/vetbill` | Paid-traffic landing page — *The $1,000 Vet Bill*. Email capture only. |
| `/decode/thank-you`, `/vetbill/thank-you` | Scaffolds: delivery + bundle offer, event hooks wired, `noindex`. |
| `/privacy`, `/terms`, `/refund-policy`, `/contact` | Legal scaffolds. No legal text drafted — see below. |

---

## Setup

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

```bash
npm run build   # production build
npm run lint    # eslint
npm start       # serve the production build
```

Node 22+. Nothing needs to be provisioned to run locally — every external dependency degrades to a labelled placeholder.

---

## Environment variables

Copy `.env.example` to `.env.local`. **Anything prefixed `NEXT_PUBLIC_` ships in the client bundle and is public** — never put a secret behind that prefix.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_GHL_FORM_DECODE` | GHL form URL. Blank → placeholder box renders. |
| `NEXT_PUBLIC_GHL_FORM_VETBILL` | As above. |
| `NEXT_PUBLIC_GHL_FORM_NEWSLETTER` | As above, for the footer capture. |
| `NEXT_PUBLIC_GUIDE_DECODE_URL` | Hosted PDF. Blank → download button renders disabled with a note. |
| `NEXT_PUBLIC_GUIDE_VETBILL_URL` | As above. |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | `1` logs every tracked event with its full payload to the console. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel id. Public by design. Must load from behind the consent gate. |

---

## Swapping in Ash's real assets

Everything visual is a labelled placeholder right now. Nothing is a stock photo, and every placeholder states what belongs there.

1. Drop the file into `public/brand/` using **exactly** the filename in `src/lib/brand/manifest.ts`.
2. Flip that slot's `ready` to `true`.
3. Done.

Aspect ratios are already reserved from the manifest's `w`/`h`, so a swap never shifts layout — CLS stays 0. Only change `w`/`h` if the real asset has a different ratio, and change both together.

`public/brand/README.md` has the full asset list with shot notes. The two that matter most:

- **`coco-hero.jpg`** — the LCP image on all three pages. Coco head-on, eyes near the upper third, shot tight.
- **`coco-about.jpg`** — Coco seated, body angled, **left foreleg clear of her body** so the animated paw can overlay her shoulder. If the framing differs, adjust `--paw-x` / `--paw-y` in `src/components/home/AboutCoco.tsx` rather than editing the SVG.

The Instagram grid and ad stills read from `src/lib/content/community.json` — add the file, set `ready: true` on the entry.

---

## The CRM mechanism

The form lives in **GoHighLevel** and is embedded here. `src/components/shared/GhlFormEmbed.tsx` renders a labelled placeholder until the env vars are set, then renders the iframe.

### Known cost of the iframe — read before launch

A cross-origin iframe means this page **cannot observe submit**. Consequences:

1. **`lead` cannot fire on real success.** It is deliberately *not* fired — firing it on render or on click would report conversions that didn't happen and train the ad account on a false signal. `form_start` fires on first interaction with the embed region, which is the most honest client-side signal available through an iframe.
2. **UTMs don't reach the contact record.** They're captured in `src/lib/utm.ts` and appended to the iframe `src` as a best effort, which only works if the GHL form has hidden fields with matching names.
3. **Pixel + CAPI can't dedupe on a shared `event_id`** — there's no server-side submit to generate the pair.

This is the tracking gap that was flagged from a previous project. It's a deliberate, informed trade for shipping speed.

### Changing the mechanism

The fix is a custom in-page form: a React form posting to `/api/subscribe`, which upserts to GHL server-side and fires the Conversions API with a shared `event_id`. **Neither exists yet** — not built on purpose, so there's only one form path in the codebase rather than two competing ones.

To build it:

1. Add `src/lib/crm/ghl.ts` exporting a single `upsertContact()`. Keep it the only place that knows how GHL is reached, so swapping the mechanism (v2 contacts endpoint / inbound webhook / the form's own POST endpoint) is a one-file change.
2. Add `app/api/subscribe/route.ts` — call `upsertContact()`, then fire CAPI with an `event_id` returned to the client so the Pixel can match it.
3. Replace `<GhlFormEmbed>` with the real form. Read credentials from server-only env vars (no `NEXT_PUBLIC_` prefix).

Tags to send with every capture (already assembled in `src/lib/utm.ts`):

`parent_audience=pets-dogs` (the Homeowners tree must never merge), `lead_magnet`, `traffic_source`, `campaign`, the five raw UTMs, `page_path`, `landing_variant`.

---

## The analytics wrapper

`src/lib/analytics/track.ts` is the only file that touches `fbq` or `gtag`. **Never call them from a component.**

```ts
import { track } from "@/lib/analytics/track";
track("view_content", { lead_magnet: "decode" });
```

Events: `page_view`, `view_content`, `form_start`, `lead`, `offer_view`, `initiate_checkout`, `purchase_bundle`, `purchase_single`, `purchase_bump`, `decline_offer`.

Set `NEXT_PUBLIC_ANALYTICS_DEBUG=1` and every event logs with its full payload — verifies the vocabulary without opening Events Manager.

Events fired before consent are **queued**, then flushed if consent is granted.

### Consent

`src/lib/consent.ts` is an **interface, not an implementation** — banner or full CMP both plug in behind the same three functions. Region detection isn't wired: there's no reliable client-side signal, so it should come from the CDN's geo header (`x-vercel-ip-country`) passed down from a server component.

The Pixel script itself is **not loaded yet** — it must load from the gate's granted callback.

---

## Design system

Palette is **locked** (inherited from the guide PDFs and email template). Tokens live in `src/app/globals.css`. Don't add hues — derive with `color-mix()`.

Measured WCAG contrast:

| Pair | Ratio | Verdict |
|---|---|---|
| Ink on Paper | 16.09 | pass |
| **Coral on Paper** | **2.39** | **fails body *and* large text** |
| Ink on Coral | 6.74 | pass |
| Ink on the four pastels | 8.54–15.21 | pass |

**Coral is a fill only.** Never coral text on paper, at any size — it misses even the 3:1 large-text bar. Display type is Ink; text sitting on coral is Ink.

`--color-ink-muted` is ink at **75%**, which is the *lowest* opacity that clears 4.5:1 on all six backgrounds (Bubblegum is the binding constraint at 4.98). Anything lighter fails AA there. Below 75% is for decorative borders and icons only.

The four pastels carry meaning rather than decoration:

- **Bubblegum** → `/decode` territory (curiosity)
- **Sky** → `/vetbill` territory (protective)
- **Mint** → the Library / paid tease
- **Butter** → community and social proof

So the two guide panels on the home page already wear the colour of the page they lead to.

Type: Poppins Bold headings / Inter body, self-hosted via `next/font`. Sentence case throughout — no all-caps eyebrow labels.

---

## Motion

Mobile is the primary view, so the motion runs there too — it isn't a desktop-only garnish.

| Moment | Mechanism |
|---|---|
| Hero pull-back | Motion `useScroll` — Coco scales down as the circle field rises |
| Statement counter-slide | Motion — two lines slide past each other on scroll |
| Section reveals | **CSS** scroll-driven (`animation-timeline: view()`) |
| Guide panels parting | **CSS** scroll-driven |
| Waving paw | CSS keyframes, three decaying swings, origin at the shoulder |
| Ambient shapes | CSS loops — `drift`, `bob`, `breathe`, `spin-slow` |

### Two rules that are load-bearing

**1. Nothing that carries content may be hidden waiting on hydration.** Section reveals and the guide panels were originally Motion `whileInView`, which puts `opacity: 0` into the *server-rendered* HTML — so content stayed invisible until ~196KB of JS hydrated, including the guide panels, which are the primary conversion route. They're CSS scroll-driven now: the resting state **is** the finished state, so Firefox, Safari < 26, reduced-motion and JS-disabled all show finished content.

**2. Nothing animates the LCP element.** The hero `h1` has no entrance animation at all. It was briefly a `motion.h1` with `initial: opacity 0`, which cost **2.35s of LCP render delay**. The load sequence is now CSS (`.rise` in `globals.css`), which runs on first paint with no JS dependency, and the h1 is excluded from it entirely.

`prefers-reduced-motion: reduce` is respected everywhere — every animation has a static end state and the pages are fully usable and legible with motion off. Ambient loops only ever apply to `aria-hidden` decoration, animate `transform` only, and stop dead under reduced motion.

---

## Measured results

Lighthouse, mobile, simulated throttling, against `npm run build && npm start`:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 96 | 100 | 100 | 100 | 2.7s | **0** |
| `/decode` | 96 | 100 | 100 | 100 | 2.7s | **0** |
| `/vetbill` | 98 | 100 | 100 | 100 | 2.4s | **0** |

Accessibility 100 and CLS 0 are met. Performance comfortably clears the 90 floor.

**LCP does not yet meet the under-2s target** (2.4–2.7s). Fonts and CSS all complete by 99ms, so the remaining delay is main-thread contention from ~196KB of JS (React + Motion) under Lighthouse's 4× CPU throttle. The lever is Motion's bundle: converting the hero pull-back and the statement band to CSS `animation-timeline: scroll()` — the same technique already used for the reveals — would remove Motion almost entirely and should bring LCP under 2s. That's a deliberate open trade-off, not an oversight.

Note also that these numbers are with **placeholder boxes, not real images**. Once `coco-hero.jpg` lands it becomes the LCP element, so re-measure after the asset swap.

---

## Compliance — read before launch

Not optional, and not safe to quietly edit away.

1. **Disclaimer in every page footer** — general guidance, not veterinary care. Present on all pages.
2. **Hotlines are deliberately blank.** `HOTLINES` in `src/lib/content/guides.ts` is an empty array and the footer renders a `TODO(Eli)` in its place. A pet emergency number produced from memory is a liability, not a placeholder. Add the two verified numbers and they render as `tel:` links.
3. **The call-now table needs a vet's sign-off.** `src/components/vetbill/CallNowTable.tsx` carries its disclaimer *inside its own frame*, every row points at a phone call (including the non-urgent tier, which is labelled "Ring your vet today", never "wait"), and it's framed as categories rather than a diagnosis. **It has not been reviewed by a vet.**
4. **Pet insurance is regulated.** The money chapter is described as informational only — never a recommendation.
5. **The refund policy must be live before checkout is.** Checkout is in GHL; `/refund-policy` exists to be linked from there. Don't take money until it says something real.
6. **No unverified statistics.** Every factual claim is marked `TODO(Eli): verify`. All cost figures are `TODO(Eli)` placeholders rather than plausible-looking invented ranges. The single-source search-volume figures are kept off the site entirely.
7. **Permission-based capture.** The statement of what someone is signing up for renders with the form, whether or not the embed is wired. Nothing pre-ticked, and the offer's decline path is visible and non-shaming.
8. **No legal text drafted here.** The four legal routes are scaffolds stating what each needs to cover.

Search the repo for `TODO(Eli)` for the full list of everything awaiting sign-off.

---

## Open questions

- **Domain.** The brand is "Cool Stuff with Coco" and the IG handle is `@coolstuffwithcoco`, but the purchased domain per the brief is `coolthingswithcoco.com`. `SITE_URL` in `src/lib/content/guides.ts` still points at the purchased domain rather than silently repointing at one that may not be owned — every canonical URL, the sitemap, robots and the JSON-LD read from that one constant, so switching it is a one-line change.
- **Guide contents.** The PDFs weren't available, so every chapter title and description is paraphrased from the brief's summary table and needs a pass against the real files.
- **Instagram feed.** Reads from a local JSON file because Graph API access needs a token and a business account. The component's data shape already matches the API response, so upgrading is a loader swap, not a redesign.
- **Bundle offer.** Price, guide count, order bump and downsell aren't locked, so the thank-you pages state none of them.
