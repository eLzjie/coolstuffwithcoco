# The A/B landing page test

Four landing pages, two tests. Written down because whoever reads the result
in a week won't be whoever set it up, and a split test you can't interpret is
just two pages.

---

## The four pages

| Arm | Route | Indexed | In sitemap | Words in `<main>` |
|---|---|---|---|---|
| A (control) | `/decode` | yes | yes | 1,118 |
| B (variant) | `/decode/b` | **no** | **no** | 430 |
| A (control) | `/vetbill` | yes | yes | 1,727 |
| B (variant) | `/vetbill/b` | **no** | **no** | 910 |

**A is the page we built through August and September:** long, FAQ-rich,
SEO-optimised, form at the very bottom. On `/decode` the email field sits
8,753px down — about twelve phone screens.

**B is Chase's brief, near-verbatim:** the whole ask above the fold, a picture
of the booklet, Coco and the product imagery below the fold, and a floating CTA
in between.

---

## What is being tested, and what is deliberately NOT

**Structure only.** This is the single most important thing to understand
before reading the result.

Every reader-facing word on the B pages is either lifted from
`src/lib/content/guides.ts` unchanged, or is structural microcopy ("Free.
Arrives by email straight away."). The headline on `/decode/b` is
`DECODE.hook` — the same locked ad angle the media buyer is bidding on, byte
for byte.

The original plan called for a new pain-point headline on B. That was dropped
on purpose: **changing copy and structure in the same arm produces a result
nobody can act on.** If B wins, "was it the layout Chase asked for, or a
headline nobody agreed to?" has no answer.

If the copy is worth testing too, that is a **third arm**, not an edit to B.

### What differs between the arms

| | A | B |
|---|---|---|
| Form position | bottom of page | above the fold |
| Booklet image | nowhere | above the fold, beside the headline |
| Coco's photo | in the hero | below the fold |
| FAQ | yes (589 / 573 words) | **absent** |
| Chapter blurbs | yes | replaced by `ContentsStrip` |
| Cost data (`/vetbill`) | `<ul>` of ranges | `CostChart` bars |
| Signal reference | quiz only | quiz + `SignalGrid` (23 items) |
| R.E.A.D. method | 4 text cards | pinned onto a diagram of Coco |
| Preventable five | full section | compact rows beside a recovering Coco |
| Floating CTA | no | yes |
| Capture wash | bubblegum | butter / sky |

The FAQ being absent from B is itself a question worth answering: it is the
largest block on each A page and our main answer-engine asset, so "does it earn
its length on paid traffic" is a real thing to learn.

### Why B's washes are less pink

Chase: *"it's somewhat feminine. I think we should try to speak to both
audiences."* `/decode` runs bubblegum on both its hero and its capture section.
On `/decode/b` bubblegum appears nowhere — butter for the capture surfaces, sky
for the quiz.

**Note the limit of that change:** the guide cover art itself is still
bubblegum pink, and on B it is now the most prominent pink thing on the page,
right beside the headline. Changing the cover is a brand decision, not a code
one. Flagged, not done.

---

## Above-the-fold budget

The requirement, measured at 390×844 (an iPhone 14-class screen) with ~745px
usable once browser chrome is subtracted:

| Element | `/decode/b` | `/vetbill/b` |
|---|---|---|
| Logo bar | 60px | 60px |
| Headline | 170px | 170px |
| Booklet | 199px | 199px |
| Name field | 395px | 395px |
| Email field | 498px | 498px |
| **CTA button** | **577px** | **577px** |
| Consent line | 677px | 677px |
| **Headroom** | **68px** | **68px** |

**The consent line is inside that budget and must stay there.** The build spec
requires it visible before submit, never in a tooltip or behind a disclosure.
If the budget ever slips, cut the subhook — never the consent line.

Two things bought the room, and both are worth keeping regardless of the test:

- **One button, not two.** A's hero has a `btn-coral` + `btn-quiet` pair that
  wraps to two rows at 390px, costing ~126px.
- **No heading on the form card.** It said "Send me the guide" — the same five
  words as the button directly beneath it — for 28px.

A third came out of measurement: `.t-hero`'s 40px mobile size ran the
33-character headline to **five lines** in the narrow column beside the
booklet, 192px of the budget. `.t-hero-compact` (32px) sets it in three.

### Re-checking it

```js
// Playwright, viewport 390x844
const consent = [...document.querySelectorAll('#get form p')].pop();
consent.getBoundingClientRect().bottom < 745   // must be true
```

---

## Wiring — every constraint here is load-bearing

**`magnet="decode"` / `magnet="vetbill"`, NOT new `LeadMagnet` values.**
`src/lib/leadMagnet.ts` is a closed union, `/api/subscribe` 400s anything
outside it, and `tagsFor()` emits the tag that **is** the GHL delivery trigger.
A new value would mean a new GHL workflow before a variant could deliver
anything at all.

**The thank-you pages are shared.** `/decode/b` redirects to
`/decode/thank-you`, the same page A uses. Forking it would fork the delivery
copy and the waitlist offer with it.

**`noindex, nofollow`, no canonical, absent from `sitemap.ts`.** Four
near-duplicate pages competing for the same queries is how you lose all four.
A canonical pointing at A was considered and rejected — it invites Google to
fold the two together and serve whichever it prefers, which would quietly
break the test. Verified:

```
/decode      robots: index, follow      canonical: .../decode
/decode/b    robots: noindex, nofollow  canonical: none
```

Lighthouse scores B's SEO at 66 because of the `noindex`. That is the
mechanism working, not a regression.

---

## How the arms are told apart in the data

Two independent paths, both already verified.

**In GoHighLevel — the `landing_page` custom field.** `src/lib/utm.ts` records
`window.location.pathname` at first touch, so a contact who converted on
`/decode/b` carries `/decode/b` there automatically. No new field, no schema
change.

This is also why a **middleware-rewrite split test was rejected**: under a
rewrite the pathname stays `/decode` for both arms and this attribution
silently collapses into one bucket.

**In GA4 — `page_path` on the `generate_lead` event.** Both arms send
`magnet="decode"`, so without this every lead is attributed to "decode" and
the test is unreadable. Added to the `track("lead", …)` call in `CaptureForm`;
`ga4Params` forwards it.

### Reading the result

Segment on `landing_page` in GHL, or `page_path` in GA4. The number that
matters is **leads ÷ sessions per arm**, not raw lead count — traffic will not
split evenly unless the media buyer splits it deliberately.

Tell the media buyer which arm each ad points at. Nothing in the code splits
traffic; that is an ad-platform job.

---

## When a winner is picked

1. The winning layout becomes `/decode` (and `/vetbill`).
2. The `/b` route is deleted, not left noindexed forever.
3. If B wins, A's FAQ needs a home — it is the answer-engine asset and
   deleting it costs organic reach. Put it on the A-shaped page that survives,
   or a `/faq` route.
4. `/vetbill` should adopt `CostChart` either way. A currently renders the same
   `COSTS` data as a plain list, so the chart exists on one arm only.

---

## Two things about `/vetbill/b` that look like problems and aren't

**It misses the ~600-word target at 910 words.** Measured breakdown:

| | Words | Share |
|---|---|---|
| Triage table + veterinary disclaimer | 303 | 33% |
| "Ranges, not quotes" caveat + 4 sources | 90 | 10% |
| **Compliance subtotal** | **393** | **43%** |
| Everything else | 517 | |

Both arms grew on 2026-09-09 when the founder-bio band was replaced with real
guide content — `/decode/b` 353 to 430 (the R.E.A.D. method), `/vetbill/b`
767 to 910 (the preventable five). That was deliberate: the note being answered
was "the band should carry content", and a word target is a proxy for
wordiness, not a goal in itself.

Strip the compliance copy and what is left is comparable to `/decode/b`. That
copy is **not** the wordiness the brief was complaining about, and it stays:

- `CallNowTable` carries the veterinary disclaimer, which is the single thing
  making this page shippable without a vet's sign-off. See
  `docs/LEGAL-REVIEW.md` §4. **Do not trim triage rows to hit a word target.**
- `CostChart` carries the ranges caveat and its four sources. A visitor
  quoting our numbers at a clinic counter has been misled by us.

**Its Lighthouse perf score swings between runs.** Both variants have returned
1.2s *and* 2.9s FCP on identical builds, while the A pages return 95 / 1.2s /
2.9s on three consecutive runs. The real network waterfall is identical either
way — every request finishes inside 35ms — so it is Lighthouse recomputing its
simulated critical path from a CPU trace that varies on this machine.

**Run Lighthouse against the Vercel preview URL before spend**, not localhost.

---

## Deployment

Both variants live on production paths off the same project. No second Vercel
project, no `staging.` subdomain — the plan considered one and it buys nothing
here, since `noindex` already does the isolation work.

**Preview URLs are behind Vercel Authentication.** Confirmed 2026-09-09: every
path on both `coolstuffwithcoco-<hash>-chaseyrita.vercel.app` and the
`-git-staging-` branch alias returns `302 → Login – Vercel`. They open for
anyone signed into the Vercel team and are a login wall for everyone else.

To share a preview with someone outside the team: Project → Settings →
Deployment Protection, or use Vercel's Share link, which mints a
token-bearing URL without making the deployment publicly crawlable.
