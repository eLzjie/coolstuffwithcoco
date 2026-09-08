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

### 5. TCPA construction on the guide forms

Phone is collected (optional) on the two guide forms, which brings the TCPA
into scope. `src/lib/content/consent.ts` documents the four requirements the
wording is built against and which mechanism satisfies each.

Two things for counsel to confirm:

- Whether the chosen state requires **prior express _written_ consent** for the
  contact types envisaged. A Feb 2026 Fifth Circuit decision (*Bradford v.
  Sovereign Pest Control*) read the federal statute as requiring only prior
  express consent for prerecorded calls, but state statutes are frequently
  stricter, so the wording takes the safe construction.
- Whether "may contact you" is adequate disclosure of the **nature** of the
  communications, or whether it needs to enumerate call/text/email.

**Do not let anyone add an SMS promise to this copy.** A2P 10DLC is not filed,
so no SMS can be sent. "May contact you" is permission, not a promise, and
stays true either way; "we'll text you your guide" would be false today.

### 6. Consent versioning — confirm the record is what's wanted

`CONSENT_VERSION` (currently `2026-09-08.guide-v1`) is written to each
contact's `consent_version` field alongside `consent_at`, so any contact traces
back to the exact wording on screen at submit.

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
| Vercel | Hosting, server logs | — |
| Upstash Redis | Rate limiting (IP, short TTL) | `src/lib/rateLimit.ts` |

All five are named on the page, so the list is complete as far as the code
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
