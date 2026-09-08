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

---

# Session 2 — 2026-09-08 (branch `staging`)

**Branch:** `staging` at `03a4830`. **`main` is untouched at `7aaaf36`** — nothing
from this session is on main, by request.

## Built

Capture forms and `/api/subscribe`, per the GHL build spec (path B). One form
component in three places, upsert + Inbound Webhook + Meta CAPI, Pixel firing
client-side on a shared `eventId`. The GHL embed remains the escape hatch behind
`NEXT_PUBLIC_CAPTURE_MODE=embed`.

Also: all three quiz signal images wired, favicon generated from Coco's face in
the logo, and the two new signal JPEGs re-encoded (4.4MB to 359KB).

## Verified against the live sub-account, not assumed

Reading the GHL API with the supplied token changed two decisions:

1. **The token is a `pit-` Private Integration Token**, so v2 with a Bearer
   header is right. Scopes present: contacts read/write, custom fields read.
   `locations.readonly` is **not** granted — don't add calls needing it.
2. **Only 5 of the 12 spec'd custom fields exist.** GHL accepts a write to a
   field key that doesn't exist and silently drops it, so seven writes would
   have vanished. Custom fields are now addressed by runtime-resolved **id**,
   and anything missing is named in a warning.

**Run `npm run check:ghl`** for the current gap. It exits non-zero so it can
gate a deploy. Missing at time of writing: `parent_audience`, `lead_magnet`,
`traffic_source`, `campaign`, `utm_term`, `landing_page`. This is the build
spec's sequence step 1, and nothing downstream works without it.

## The three open questions, closed

- **Idempotency** is scoped to the `(email, leadMagnet)` pair, enforced in the
  handler with a `delivered-<magnet>` tag rather than a workflow branch.
- **Consent** travels in the request body and gates Pixel and CAPI *together*.
  Recorded on the contact via `marketing_consent` (which already existed) —
  not a separate database, because the permission record belongs on the record
  the marketing is sent from. The per-browser gate stays in `localStorage`: it
  must be readable before any tag loads and must exist for visitors who never
  submit.
- **`traffic_source`** gains `Paid — Other` and `Referral`. Paid is matched
  *before* the fall-through to Organic. `npm run test:traffic` covers 19 cases.

## Review fixes — found by an independent pass, all real

The worst: **the upsert used to send a merged tag array, and GHL replaces
rather than merges.** A failed lookup, a fuzzy-search miss, or two concurrent
submits could overwrite a contact's real tags with just two — destroying
`delivered-*` markers and every tag the workflows own. Tags now go through the
additive endpoint and the lookup is read-only.

Others: `markDelivered` failure no longer 502s after the guide was sent (which
would have caused duplicate delivery on retry); Pixel/CAPI consent booleans
unified; conversion events never queued for replay; `event_source_url` is the
page not the API route; the discard path returns no `eventId`; the timing check
measures from first interaction not mount; a request timeout so a hung fetch
can't strand the form; server errors clear on keystroke; `LeadMagnet` and the
email regex deduplicated (analytics was missing `newsletter`).

**Security review: no exploitable findings.**

## Gotcha added to the list

`.next/cache/images` serves a **stale optimized image when a file changes but
its filename doesn't** — Next keys the cache on the URL. Verified server-side
with `curl` + `ffprobe` while the browser kept rendering the old aspect ratio.

## Still open

- **Custom fields** (6 missing, blocks accurate reporting) — `npm run check:ghl`
- **`GHL_WEBHOOK_*` URLs** — these only exist after each workflow's Inbound
  Webhook trigger is created and saved. Delivery cannot fire without them.
- **`META_CAPI_ACCESS_TOKEN`** and `NEXT_PUBLIC_META_PIXEL_ID` — CAPI is a
  no-op until both are set.
- **Hosted guide PDF URLs** — the thank-you download is disabled without them,
  and the spec's de-risking move depends on that download existing.
- **End-to-end test on both concepts, before spend.** This is the exact thing
  that surfaced post-launch on the previous project.
- **`"Paid — Other"` em dash** must match the GHL dropdown byte-for-byte.
- Vet sign-off on the call-now table; three OG images; Vercel deployment
  protection off.

---

# Session 3 — 2026-09-08 (branch `staging`)

Legal pages, the contact form, better lead capture, and two CRM data-loss bugs
found and fixed by reading GoHighLevel back rather than trusting a 200.

## Built

- **Real legal pages**, written against the actual data flows rather than from
  a template — `/privacy` names all four processors (GoHighLevel, Meta, Vercel,
  Upstash) and describes what each receives; `/terms` carries a hard
  not-veterinary-advice callout; `/refund-policy` is **14 days**, 3 business
  days to process. `.prose-legal` in `globals.css` styles all three.
- **`/contact` with a working form** posting to a new `/api/contact`, plus the
  emergency hotlines above it framed as "we are the wrong destination".
  `info@mail.coolstuffwithcoco.com` is the single `SUPPORT_EMAIL` constant.
- **Guide opt-ins expanded** to first name (required), last name and phone
  (both optional), email — with a versioned consent disclosure underneath.
  The **newsletter stays email-only**: it's a subscribe, not a delivery, so
  there's nothing to personalise.
- **`InboxPreview` rewritten.** The invented sample email is gone — it was a
  promise about content that didn't exist, and it pushed the actual field below
  the fold on a phone. Heading, three honest bullets, form.
- **`src/lib/content/consent.ts`** — `CONSENT_VERSION` written to each contact
  alongside `consent_at`, so any contact traces back to the exact wording that
  was on screen. Documents the four TCPA points and that **SMS must never be
  promised** (A2P 10DLC isn't filed).
- **US vet costs researched and sourced**, replacing `TODO(Eli): verify source`
  — `COSTS` plus `COST_SOURCES` (CareCredit, Pawlicy, Lemonade, MetLife).
- **`docs/LEGAL-REVIEW.md`** — four source files pointed at a doc that didn't
  exist. It now lists the three blockers before taking money (legal entity,
  governing law/venue, refund mechanics vs the real checkout) and five items
  that want a lawyer but don't block a soft launch.

## Two silent data-loss bugs, both returning a clean 200

Neither was visible from the HTTP boundary, which is why `npm run test:api`
stayed green through both. Both are now covered by **`npm run test:crm`**,
which reads GHL back and asserts on what actually landed.

### 1. First-touch attribution was overwritten

`lead_magnet` records which guide acquired someone. The "have they been here
before?" check used GHL's `GET /contacts/?query=` — which is a **search index
that lags writes**. So a second submission moments after the first looked
brand new, and the attribution was overwritten. A decode-then-vetbill sequence
ended up attributed to VetBill.

Probed directly. Write a tag, then read it back two ways with no delay:

| read path | result |
|---|---|
| `GET /contacts/{id}` | `["probe-immediate"]` — strongly consistent |
| `GET /contacts/?query=` | 0 rows — index hasn't caught up |

A zero-row search result is therefore **ambiguous**: "no such contact" and
"created moments ago" are indistinguishable, and nothing in the response tells
them apart.

Fixed by never consulting the search index. The upsert response carries GHL's
own `new` flag — `{"new": true}` on create, `{"new": false, "succeded": true,
"succeeded": true}` on update (it ships both spellings), same `contact.id`
either way. That comes from the write itself, so it can't lag. `lead_magnet` is
now written **only** when `new` is true, by a targeted `PUT /contacts/{id}`
rather than a second upsert — verified the PUT writes the one field and leaves
tags, email and everything else untouched.

Net effect: one fewer round trip than the search-first version.

### 2. Phone number merged two subscribers into one

**GHL deduplicates contacts on phone number.** Two emails sharing a household
or work number collapsed into ONE record and the later email overwrote the
earlier — so the first person silently stopped receiving anything.

Worth recording that the first hypothesis was **wrong**: plus-addressing in the
test suite looked like the obvious cause, and switching to hyphens changed
nothing. The real cause came from a direct probe — four upserts, two sharing a
phone, produced three contacts.

Fixed by routing the number to a `phone_number` **custom field** and keeping
GHL's native `phone` empty. Nothing is lost: no SMS can be sent anyway, so the
native field bought dedupe risk and no capability. To go native later, send
`phone` on the upsert body — and decide first what should happen when two
subscribers share a number.

## Hotline fees were not disclosed — fixed

Both poison-control lines charge per incident and the site didn't say so. It
presented them to someone frightened and about to dial, which set that person
up for a surprise charge at the worst possible moment.

Verified against each operator's own current pages (September 2026): ASPCA
**$95 per incident**, Pet Poison Helpline **$89 per incident** with follow-ups
included. The fee now renders on its own line on both the contact page and the
footer, at full contrast rather than muted grey. Re-verify before any campaign
push; prefer "a per-incident fee applies" to printing a stale figure.

## Vet sign-off: resolved as not obtainable

Confirmed 2026-09-08 that a vet review can't be had before launch, so
`/vetbill` ships behind a hardened disclaimer instead. The butter panel in
`CallNowTable` now states, **before any symptom is read**, that the content
hasn't been reviewed by a veterinarian, isn't a diagnosis, and that an unsure
reader should ring their vet.

The visitor-facing `TODO(Eli)` that used to render there is gone — it read as
an unfinished site and undercut the disclaimer directly above it. The
reviewer-facing note moved into the file's block comment.

A disclaimer reduces exposure; it does not remove it. **The spec's
recommendation still stands: promote `/decode` first**, and let `/vetbill`
follow once someone qualified has read the triage categories.

## Test state

| Suite | Result |
|---|---|
| `npm run test:api` | 35/35 |
| `npm run test:crm` | 13/13 — **new**, reads GHL back |
| `npm run test:traffic` | 19/19 |
| `npm run check:ghl` | all capture fields exist |
| `npx tsc --noEmit`, `npm run lint`, `npm run build` | clean |

`test:crm` is slower by design: GHL's search index has to catch up before a
contact can be found by email, so each discovery retries with a backoff. Reads
of a known id don't need that.

## Gotcha added to the list

**A green API suite proves nothing about what reached the CRM.** Both bugs
above returned 200 and wrote wrong data. Any assertion about CRM state has to
read the CRM back — and read it **by id**, because the search endpoint lags.

## Review fixes — independent code + security pass, all real

Both reviews ran against the session diff (~1,900 lines). Every finding below
was reproduced before it was fixed; nothing was taken on trust.

### Security

**`safePath()` could be walked out of the origin.** The guard checked the input
string, but `new URL()` resolution can *manufacture* a protocol-relative path
by collapsing `..` at the root. Reproduced:

| input | old result | resolved |
|---|---|---|
| `/..//evil.example/phish?x=1` | `//evil.example/phish?x=1` | `https://evil.example/phish?x=1` |
| `/x/..//evil.example` | `//evil.example` | `https://evil.example/` |
| `/./..//evil.example` | `//evil.example` | `https://evil.example/` |

One unauthenticated POST could therefore point Meta's `event_source_url` at a
domain the attacker owns and write an off-site link into `landing_page` that
staff later click.

The guard now runs on the **resolved** `pathname`, which covers the whole `..`
family instead of playing whack-a-mole with input spellings. It also moved to
`src/lib/safePath.ts`: it had been copy-pasted into both routes, and a
sanitiser with two copies is one that gets fixed once. Percent-encoded and
control-character variants were checked and are not exploitable — the WHATWG
parser handles them.

Covered by four cases in `test:crm`, asserted against what actually reaches the
CRM, since that's the only place the sanitised value is observable end to end.

**Unbounded attribution fields.** UTMs, campaign, referrer and paths had no
length cap while every human-entered field did. A single request could push a
megabyte into a CRM custom field and forward the same payload to the delivery
webhook, five times a minute, with no auth. Now capped at `ATTR_MAX` (200) and
**truncated rather than rejected** — attribution is best-effort telemetry, and
refusing the submission would discard a real lead to protect a UTM value.

**A literal `null` body returned a 500.** `JSON.parse("null")` succeeds, so it
escaped the `try/catch` and threw on the first property read. Now a 400 on both
routes, with regression cases for `null` and a bare array.

**Rate-limit buckets weren't scoped per route.** Contact-form enquiries
consumed the same per-IP allowance as subscribing, so two unrelated actions
throttled each other. The key now carries the endpoint.

Confirmed clean: no secret behind `NEXT_PUBLIC_`, no webhook URL in any client
bundle, no `dangerouslySetInnerHTML`, no header injection, no prototype
pollution, and repeat submissions stay byte-identical so subscriber status
can't be enumerated from a response body.

### Correctness

**`created` was too narrow a definition of first touch.** My `new`-flag fix
traded one bug for a smaller one: `new: true` means "GHL created the record on
this call", which is *not* the same as "this is their first magnet". Anyone who
already existed for another reason — used the contact form, was imported, was
added by hand — would have had `lead_magnet` left blank permanently, even
though their first guide really was the acquiring magnet.

The tag test is back, and it's safe now for a reason worth being precise about:
what made the old version wrong was never the test, it was reading tags from
the lagging `?query=` index. `readContactTags` reads by id. A failed read still
skips the write, because an unset field is backfillable and an overwritten one
isn't. Covered by a `test:crm` case that files an enquiry first, then a guide.

**A tag blip could cost a delivery.** `addTags` ran inside `upsertContact` and
threw, before the caller fired the delivery webhook — so a transient 429 on the
tag endpoint failed the whole request *after* the contact was created. Acquired,
never served. Now best-effort with a logged error: tags are reconstructible, a
guide someone never received is not.

**The contact form overwrote three fields on existing subscribers.** This is
the same class of bug as the phone merge, and the reason it matters is that an
enquiry almost always arrives from someone who is already a contact:

- `landing_page` → replaced with `/contact`, destroying the acquisition page of
  a lead that was paid for.
- `firstName` → sent unconditionally as one string, so `Sam` / `Rivera` became
  firstName `Sam Rivera`.
- `consent_version` → replaced with the contact-form version while
  `marketing_consent` stayed true, leaving an audit trail that claimed they
  accepted wording reading "It doesn't sign you up to anything".

The upsert now writes exactly one field, `contact_message`. Page path and
disclosure version moved into the note, where they describe the enquiry rather
than making a claim about the contact. `firstName` is written by a targeted PUT
only when the record was actually created.

**A discarded submission rendered as success.** Both spam paths return `200`
with no `eventId` — deliberately, so a bot learns nothing. But the client only
checked `ok`, so it announced "check your inbox" and redirected to the download
page for a submission that created no contact and sent no guide. The timing
check catches real people: browser autofill fills every field in one gesture,
so tripping the 1200 ms threshold by accident is easy. Both forms now treat
"ok with no `eventId`" (capture) and "ok with no `received`" (contact) as not
sent, and say so — a retry does go through, so the advice is actionable. It
concedes a little to a honeypot bot; misleading a real person is worse.

**A dead fallback wrote `/` as the acquiring page.**
`safePath(...) || pagePath` can never reach the fallback, because `safePath`
never returns a falsy value. The choice now happens before sanitising.

**`MESSAGE_MIN`/`MESSAGE_MAX` were duplicated** byte-for-byte across the client
and the route — the precise failure `validation.ts` exists to prevent. Moved
there. An over-long message also got `BAD_REQUEST`, which renders as "something
went wrong on our end"; it now has its own `INVALID_MESSAGE` code so the error
lands on the message field.

**Stale comments, all corrected.** Four blocks described code that no longer
existed — a lookup "above" the upsert that had been deleted, a "KNOWN LIMIT"
blaming the search index for a race that is now purely concurrency, a claim
that the contact route "writes no consent record" when it writes
`consent_version`, and `test-crm.mjs` sending `ts` where the server reads
`formTimestamp` (so the spam check was being *skipped*, not satisfied). In a
codebase that leans this hard on explanatory comments, a stale one is a defect.

Also removed `cleanName` (added this session, never called) and the unread
`created` field, and added `contact_message` to `check:ghl`'s blocking set —
without it a missing field silently reduced the enquiry to a best-effort note.

### Mobile pass

No horizontal overflow or clipped text on any new page at 390px. Emergency
phone links were 28px tall; now 44px, because those get tapped one-handed by
someone frightened and 24px "technically passing" is the wrong standard there.

Found by eye rather than by either review: both guide pages still said **"One
email address"** above a form that now asks for four fields. Copy promising
less friction than the form delivers reads as a bait the moment the reader
looks down.

### Test state after the fixes

| Suite | Result |
|---|---|
| `npm run test:api` | 39/39 (was 35 — added null/array body, message codes) |
| `npm run test:crm` | 19/19 (was 13 — added pre-existing contact, path sanitising) |
| `npm run test:traffic` | 19/19 |
| `npm run check:ghl` | passing, now gating `contact_message` too |
| `tsc`, `lint`, `build` | clean |

### Left deliberately

- **`x-forwarded-for` is trusted for the rate-limit key.** Correct on Vercel,
  which overwrites the header. It would be forgeable on a self-hosted
  deployment behind a pass-through proxy — noted in `rateLimit.ts`.
- **The limiter fails open.** A lead is worth more than a throttle, and the
  honeypot plus timing check remain.
- **A repeat submission is measurably faster** than a first one (it skips two
  upstream calls), which is a weak timing signal for subscriber enumeration.
  Not worth restructuring the response path for.
- **IPs and upstream response bodies are logged server-side** for abuse
  diagnosis. Flagged for the privacy review rather than changed.

## Still open

Carried forward, plus new:

- **`docs/LEGAL-REVIEW.md` blockers** — legal entity name and governing
  law/venue are blank on purpose. Guessing is worse than blank. Nothing can be
  sold until a lawyer fills them.
- **Refund mechanics unverified against a checkout** that doesn't exist yet.
  The 14-day window and 3-business-day response are promises no processor has
  confirmed. Change `REFUND_DAYS` if it can't be honoured.
- **`firstName` casing** — GHL lowercases it while `firstNameRaw` preserves the
  original. Check this before relying on a name merge field in an email.
- Visual/mobile pass and a Lighthouse re-run on the new legal, contact and
  newsletter sections.

---

# Session 4 — 2026-09-08 (branch `staging`)

Analytics (GA4 + GTM), then SEO/GEO/AEO. The research phase changed the plan
twice, and reading the delivered guides turned up a content contradiction.

## GA4 and Tag Manager

`track.ts` already called `window.gtag`, so most of this was wiring plus the
GA4 name mapping it lacked. Events now use GA4's **recommended** names
(`generate_lead`, `view_item`, `begin_checkout`, `purchase`, `view_promotion`)
so they land in built-in reports rather than "unassigned".

Three things that are wrong by default and are now handled:

- **`send_page_view: false`.** `AnalyticsBoot` already fires `page_view` per
  pathname change. Leaving the config tag's own enabled double-counts the first
  view of every session — only the first, which reads as a data quirk rather
  than a bug.
- **Consent Mode v2 runs `beforeInteractive`, from the root layout.** Next
  requires that strategy at the root, and Google reads consent state at tag
  initialisation — a default set afterwards applies to nothing already sent,
  silently. Every signal defaults to granted, matching the US-only posture, so
  it changes nothing today; a banner later only has to call `setConsent()`.
- **GA4 gets a curated param set.** Forwarding `getAttribution()` would spend
  the 50-custom-dimension property budget on UTMs GA4 already parses from the
  URL, and unregistered params are dropped. Meta still gets the full body.

Both ids come from `NEXT_PUBLIC_` env vars, **unset outside production** — so
dev, preview and the test suites can't pollute the one property the ad spend is
judged on. Unset renders no tag at all.

### `npm run check:tags`

Asserts the rendered markup: one GA4 loader, one config, consent present as a
real early inline script, loaders deferred rather than inlined ahead of it.
14/14 with ids set, 2/2 asserting nothing renders without them.

It documents two traps that made its own first version report false failures:
**a `<link rel="preload">` is not a loader** (it fetches without executing), and
**React serialises every inline script into the RSC flight payload too**, so
everything appears twice in the HTML. Both made correct output look broken.

**What it cannot check:** a GA4 Configuration tag added inside the GTM
container. That's the likeliest cause of double-counting and it lives in
Google's UI. Documented loudly in `Tags.tsx`; verify in GA4 Realtime that one
page load produces one `page_view`.

## Two pieces of standard GEO advice, dropped after research

- **FAQ rich results were fully removed on 7 May 2026.** `FAQPage` is still
  valid schema but produces no rich result for anyone. It's emitted as a cheap
  byproduct, labelled as such — nobody should add to it expecting SERP
  decoration.
- **llms.txt is ignored in practice.** Of 500M+ AI crawler visits in one 2026
  study, 408 fetched it, and Google has said publicly it won't support it,
  comparing it to the keywords meta tag. Not built.

Both point the same way: **crawlers read the HTML.** So the work went into
visible content and hygiene rather than schema files.

## The guides contradicted the site

The v5 PDFs landed in `docs/specs/`, and reading them showed the cost table
disagreed with the guide it advertises:

| | site said | guide says |
|---|---|---|
| Bloat surgery | $3,000–8,000 | **$2,000–7,500** |
| Swallowed object | $2,000–3,500 | **$1,500–5,000** |
| Emergency exam | $100–250 | **$150–500** (incl. diagnostics) |

A reader takes the page's number, downloads the PDF, and finds a different one.
The page yields — the guide is what they keep. `COSTS` now mirrors Section 1 of
the guide exactly, and `COST_SOURCES` carries the guide's own attributions
(Rover 2026, Forbes, ASPCA, RVC) instead of the separately-researched set.

**Rule now recorded in `guides.ts`: the guide is the source of truth for
anything a reader can compare. Don't re-research these separately.**

Same pass also found:

- Both chapter lists were **missing a section** that's in the guide (decode's
  7-day challenge; vetbill's five costly mistakes).
- The hazard audit was described as twenty minutes; the guide says ten.
- `CallNowTable` said "Six of them" while the table held eight. Now counted
  from `TRIAGE.length` — a hardcoded count beside a mapped array breaks
  silently every time the data is edited.
- **All three `SIGNALS` claims checked out** against the guide, so those
  `verify: true` flags are cleared with the evidence quoted in the docblock.
- `TRIAGE` rows now come from the guide's own Section 2 rather than being
  written here — better provenance, and the page and PDF can't drift.
  **One deliberate difference kept:** the guide's second column says "safe to
  monitor"; the site still says "ring your vet today". A landing page is read
  without the guide's surrounding caveats, so it shouldn't hand out permission
  to wait.

## New content on /decode and /vetbill

- **The R.E.A.D. method** gets its own section on /decode. A named, four-step,
  self-contained framework is *quotable* — an assistant can lift it as a unit
  and attribute it, in a way it can't lift three paragraphs of good advice.
  It's also the guide's most useful page, and giving it away doesn't
  cannibalise the download.
- **Answer-first Q&A** on both pages (9 and 7 questions), from the guides only.
  The technique is the ordering: question as heading, direct answer in the
  **first sentence**, detail after. "There are a few reasons dogs eat grass…"
  is unquotable; "Grass eating is normal and usually harmless" can be lifted
  with attribution.
- **The Preventable Five** on /vetbill. This one is load-bearing for *tone*,
  not SEO: the rest of the page is necessarily large frightening numbers, and
  that's only defensible alongside what to actually do. Don't remove it to
  shorten the page.
- Both Q&A sections sit **before** the capture form. Someone who arrived
  searching "how much is an emergency vet visit" gets the answer rather than
  being made to trade an email for it.
- Insurance answer stays **neutral by design** — the guide opens that section
  by saying it isn't licensed to advise, and the page must match.

## SEO hygiene

- **`sitemap.ts` no longer stamps `new Date()`.** Every URL previously claimed
  to have changed at deploy time, so a CSS tweak announced that the privacy
  policy and both guides were rewritten. Crawlers weight `lastmod` by whether
  it has been truthful, so that spends the signal for nothing. Hand-maintained
  dates now.
- **`robots.ts` names the AI crawlers explicitly** — GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended and the rest. The wildcard already allowed
  them; naming them records that it's a *decision*, because "allow everything"
  and "we decided to allow the AI crawlers" look identical in a config file.
  Being crawlable is the precondition for being cited.
- **Generated OG images** for all three main pages via `ImageResponse`. All
  three `og*` manifest slots were `ready: false` while
  `twitter: summary_large_image` was declared — promising a large-image card
  and supplying no image, which renders blank everywhere a link is shared.

### The OG gotcha worth knowing

The routes built and served valid 1200×630 PNGs while every page still rendered
**no `og:image` at all**. The cause was in the page metadata:

```ts
openGraph: { images: BRAND.ogDecode.ready ? [...] : undefined }
```

An `images` key that is **present-but-undefined suppresses the file convention
entirely** — it does not fall through to it. Deleting the key made og:image,
its type/width/height/alt *and* twitter:image all appear.

Consequence: the `og*` manifest slots are now unreferenced, and flipping their
`ready` flag does nothing on its own. Switching to designed artwork means
deleting the three `opengraph-image.tsx` files and pointing `openGraph.images`
at the real files — in that order.

## Test state

| Suite | Result |
|---|---|
| `npm run test:api` | 39/39 |
| `npm run test:crm` | 19/19 |
| `npm run test:traffic` | 19/19 |
| `npm run check:ghl` | passing |
| `npm run check:tags` | 14/14 with ids, 2/2 without — **new** |
| `tsc`, `lint`, `build` | clean |

Mobile verified at 390px on both guide pages: no horizontal scroll, no clipped
text, new sections render correctly.

## Still open

- **LCP not re-measured.** Lighthouse isn't installed in this environment. The
  loaders are `afterInteractive` and verified not inlined, which is the
  mechanism that keeps them off the LCP path — but that's an architectural
  guarantee, not a measurement. Worth one real Lighthouse run before spend.
- **Mark `generate_lead` as a key event in the GA4 UI.** The code sends it;
  GA4 won't treat it as a conversion until someone ticks that box.
- **Don't add a GA4 tag to the GTM container** (see above).
- Designed OG artwork, to replace the generated cards.
- Everything in `docs/LEGAL-REVIEW.md` — entity name and governing law still
  blank, refund mechanics still unverified against a checkout.
