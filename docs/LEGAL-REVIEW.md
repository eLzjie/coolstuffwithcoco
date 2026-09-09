# Legal review — open items

**Status: NOT reviewed by a lawyer.** Everything in `/privacy`, `/terms`,
`/refund-policy` and the consent disclosures was written by reading the actual
code paths and describing them honestly. That makes it accurate. It does not
make it sufficient.

This file is the handover list. It exists because four source files point at
it:

- `src/app/terms/page.tsx`
- `src/app/refund-policy/page.tsx`
- `src/components/layout/LegalPage.tsx`
- `src/lib/content/consent.ts`

---

## Blockers — must be resolved before taking money

These are genuinely blocking. The site can collect emails today; it cannot
sell anything until they're closed.

### 1. Legal entity name

**Blank on purpose.** "Cool Stuff with Coco" is an operating name, not a legal
person. Terms need whoever actually contracts with the customer — a sole
proprietor's own name, or the LLC if one exists.

Guessing this is worse than leaving it blank: terms naming an entity that
doesn't exist are arguably unenforceable, and it misrepresents who the
counterparty is.

**Where it goes:** `src/app/terms/page.tsx` (the "who you're dealing with"
section), plus the controller identity in `src/app/privacy/page.tsx`.

### 2. Governing law and venue

**Blank on purpose.** Needs Eli's state. This determines which consumer
protection statutes apply, and several of the items below resolve differently
depending on it — so it's the first one to answer.

Also decide, with a lawyer: arbitration clause or not. There are real
trade-offs and it's not a default worth picking unadvised.

**Where it goes:** `src/app/terms/page.tsx`.

### 3. Refund mechanics vs the real checkout

The policy currently promises:

| Promise | Value | Source |
|---|---|---|
| Refund window | **14 days** from purchase | `REFUND_DAYS` in `refund-policy/page.tsx` |
| Response time | **3 business days** from the email | same file |
| Conditions | None — no explanation, no hoops | same file |

None of this has been checked against a checkout, because there isn't one yet.
Before the first sale, confirm the payment processor can actually honour all
three. Two specific traps:

- **A processor's own refund window may be shorter than 14 days**, in which
  case a late refund has to be issued manually and someone has to remember.
- **GHL's checkout may not expose a self-serve refund** at all, making the
  3-business-day promise a manual SLA a human has to meet.

A promise the tooling can't keep is worse than a narrower promise. Either
confirm it or change the number — but change it in `REFUND_DAYS`, which is the
single source for every mention on the page.

---

## Needs a lawyer's eyes, not blocking a soft launch

### 4. The veterinary disclaimer on `/vetbill`

**No vet sign-off was obtainable before launch** (confirmed 2026-09-08). Eli
chose to ship behind a hardened disclaimer.

What's in place: `src/components/vetbill/CallNowTable.tsx` states, above any
symptom, that the content has not been reviewed by a veterinarian, is not a
diagnosis, and that an unsure reader should ring their vet. Every row ends by
pointing at a phone call, including the non-urgent tier.

**A disclaimer reduces exposure; it does not remove it.** The build spec's
recommendation still stands: promote `/decode` first, and let `/vetbill` follow
once someone qualified has read the triage categories. Ask counsel whether the
current framing is adequate in the chosen venue, since some states treat
symptom-tier content more strictly than general pet-care advice.

Once a vet has reviewed it, delete the "hasn't been reviewed by a veterinarian"
sentence from the butter panel — and only then.

### 5. TCPA — NO LONGER IN SCOPE, as of 2026-09-09

**Phone collection was removed from both guide forms.** Client instruction:
"we're asking too much, let's just do name and email". The forms now take first
name and email only.

That closes this item rather than answering it. The TCPA is triggered by
collecting a number you might call or text; with no number collected there is
nothing to construct consent around, and the disclosure is now a plain
marketing-email one.

**Two things that follow, both already done:**

- `CONSENT_GUIDE.text` was rewritten — two of its four sentences described the
  phone field, so leaving them would have been a dangling reference to
  something the form no longer has.
- `CONSENT_VERSION` was bumped to `2026-09-09.guide-v2`. Contacts captured
  before that carry `guide-v1` and genuinely agreed to the phone-inclusive
  wording; that record stays accurate and must not be rewritten.

**What is still live, and why this section is kept rather than deleted:** the
server still accepts a phone if one is posted, and `phone_number` still exists
as a GHL custom field, so re-adding the field is a client-only change. It is
not a free one. The TCPA reasoning is preserved in
`src/lib/content/consent.ts` for whoever does that, and the questions that
would need answering again are:

- Whether the chosen state requires **prior express _written_ consent** for the
  contact types envisaged. A Feb 2026 Fifth Circuit decision (*Bradford v.
  Sovereign Pest Control*) read the federal statute as requiring only prior
  express consent for prerecorded calls, but state statutes are frequently
  stricter, so the old wording took the safe construction.
- Whether "may contact you" is adequate disclosure of the **nature** of the
  communications, or whether it needs to enumerate call/text/email.

**Do not let anyone add an SMS promise to this copy.** A2P 10DLC is not filed,
so no SMS can be sent. "May contact you" is permission, not a promise, and
stays true either way; "we'll text you your guide" would be false today.

### 6. Consent versioning — confirm the record is what's wanted

`CONSENT_VERSION` (currently `2026-09-09.guide-v2`, bumped from
`2026-09-08.guide-v1` when phone was dropped) is written to each contact's
`consent_version` field alongside `consent_at`, so any contact traces back to
the exact wording on screen at submit. Both versions are now in the field
across the contact base, which is the mechanism working as intended rather than
a problem.

Confirm this record is what counsel would want to produce if a send were ever
challenged, and whether the **full disclosure text** needs archiving rather
than just a version pointer. If it does, that's a new store — the version
string alone assumes this repo's history remains available.

Rule already documented in the file: bump the version when wording changes what
someone agrees to, never for a typo, and never edit a historical version's text.

### 7. Privacy policy — processor list completeness

`/privacy` was written against the real data flows, not from a template. The
processors it names, and the file that proves each:

| Processor | Purpose | Code |
|---|---|---|
| GoHighLevel | CRM, email delivery | `src/lib/crm/ghl.ts` |
| Meta | Pixel + Conversions API (email hashed) | `src/lib/meta/capi.ts` |
| Google | GA4 + Tag Manager (behavioural, IP) | `src/components/analytics/Tags.tsx` |
| Microsoft | Clarity — heatmaps and **session recording** | `src/components/analytics/Clarity.tsx` |
| Vercel | Hosting, server logs | — |
| Upstash Redis | Rate limiting (IP, short TTL) | `src/lib/rateLimit.ts` |

All six are named on the page, so the list is complete as far as the code
goes. One thing for counsel:

- Whether a **Data Processing Agreement** is needed with each. Note the Upstash
  instance is **shared with the On The Tron project** (namespaced by the
  `coco:rl:` key prefix), which is worth flagging as a cross-project data point
  even though only IP-derived rate-limit counters are stored.

Re-check this table if the host ever changes, since Vercel is named explicitly
rather than described generically.

**Google was added 2026-09-08** alongside GA4 and Tag Manager. Two points for
counsel specifically:

- **Google Consent Mode v2 is wired but every signal defaults to granted**,
  matching the site's existing US-only posture
  (`src/lib/analytics/consentMode.ts`). The mechanism is in place, so honouring
  a denial is a one-line change — but until a banner exists and the region is
  read from the CDN header, an EEA/UK visitor would be tracked by default. That
  is the same targeting-discipline caveat already recorded for the Meta Pixel,
  and it now applies to Google too.
- **No Google Signals / ads data-sharing** has been enabled, and no Google Ads
  account is linked. If either changes, this section needs revisiting — it
  moves the processing from analytics into advertising, which is what
  `ad_user_data` and `ad_personalization` govern.

**Microsoft Clarity (project `yff7ashiza`) is live**, and it is the one
processor here that does **session replay** — mouse movement, scrolling, taps,
and a replayable reconstruction of the visit.

It is installed **inside the GTM container**, not by this codebase. Confirmed
in a browser rather than assumed: the tag loads as
`clarity.ms/tag/yff7ashiza?ref=gtm`. A code-based install was written on
2026-09-09 and removed the same day once that was found, because two installs
means two recorders. See the note at the foot of `src/lib/analytics/ids.ts`.

Three things for counsel, and the second is the one that matters:

- **Text typed into forms is masked by Clarity's default.** Worth confirming
  it has not been switched off in the Clarity dashboard, because the contact
  form carries free text someone may have written about a sick animal, and the
  capture forms carry names and email addresses. None of that belongs in a
  replay.
- **It is NOT gated on this site's consent state.** Measured: it loaded on a
  fresh page view with `coco_consent_v1` set to `analytics:false`. Because the
  tag lives in GTM, our own gate cannot reach it. So a visitor who declines
  analytics is still recorded.

  That is the sharpest edge of the default-granted posture. Today nothing can
  decline, since no banner exists — but it means **gating Clarity is part of
  the cookie-banner job, and it has to be done in GTM** (Consent Mode, or a
  trigger condition on the tag), not in this repo.
- Session replay is the processing most likely to need explicit disclosure
  under EU/UK rules, which reinforces the existing constraint: do not send
  EEA/UK traffic until the banner ships.

### 8. Email address in the disclosures

All legal pages route contact to `info@mail.coolstuffwithcoco.com`
(`SUPPORT_EMAIL` in `src/lib/content/guides.ts`).

Confirm this mailbox is monitored — a refund policy promising a 3-business-day
response to an unwatched address is the kind of detail that turns a small
dispute into a chargeback.

---

## Deliberately NOT done

**No visitor-facing "not reviewed by a lawyer" banner.** It was considered and
rejected: it would undermine the document's authority for every ordinary reader
while doing nothing for the actual risk, which is the content being wrong
rather than the reader being unwarned. The caveat belongs in the repo, where
the person who can act on it will read it. That's here, and in the block
comment at the top of `src/components/layout/LegalPage.tsx`.

**No hotline numbers were invented.** The two in `HOTLINES`
(`src/lib/content/guides.ts`) are real and verifiable — ASPCA Animal Poison
Control (888) 426-4435 and Pet Poison Helpline (855) 764-7661. Never add a
number without verifying it.

**Fixed 2026-09-08, after this file first claimed otherwise:** both lines charge
per incident and the site was **not** saying so. It presented them to someone
about to dial in a panic, which set that person up for a surprise charge at the
worst possible moment. The fee now renders on its own line on both the contact
page and the footer, at full contrast rather than muted.

Amounts verified against each operator's own current pages, September 2026:
ASPCA **$95 per incident**, Pet Poison Helpline **$89 per incident** with
follow-ups included. These change — re-verify before any campaign push, and
prefer "a per-incident fee applies" over printing a figure that can't be
confirmed. Never imply either line is free.
