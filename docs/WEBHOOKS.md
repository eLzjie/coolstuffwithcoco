# Guide delivery — how it is triggered

**There are no webhooks any more.** This file used to be a setup guide for
three GHL Inbound Webhooks. They were removed on 2026-09-09 and the delivery
workflows now trigger on a tag instead.

Kept at this filename because `docs/PROGRESS.md` links here, and because the
reason it changed is worth not relearning.

---

## The current mechanism, in one paragraph

`POST /api/subscribe` upserts the contact through the GHL API and applies the
tag `lead-magnet-<concept>` — `lead-magnet-decode`, `lead-magnet-vetbill` or
`lead-magnet-newsletter`. Each delivery workflow in GHL triggers on
**Contact Tag** matching its own string. That is the whole path. The route
makes no delivery call of its own.

| Workflow | Trigger | Sends |
|---|---|---|
| WF-1a Decode delivery | Contact Tag `lead-magnet-decode` | `docs/emails/01-decode-delivery.html` |
| WF-1b Vet Bill delivery | Contact Tag `lead-magnet-vetbill` | `docs/emails/02-vetbill-delivery.html` |
| WF-1c Newsletter | Contact Tag `lead-magnet-newsletter` | `docs/emails/03-newsletter-welcome.html` |

`tagsFor()` in `src/lib/crm/ghl.ts` is where those strings live. **A typo there
doesn't error — it produces a subscriber who silently receives nothing.** If
you change a string, change the GHL trigger in the same commit.

---

## Why the webhooks went

An Inbound Webhook trigger fires the workflow but **does not attach a contact
to the run**. Every action in the delivery workflow is contact-scoped — add
tag, send email, add to opportunity — so with no contact in context GHL skipped
all four in turn and exited.

Observed live: the workflow showed **Entered**, then four × **"Action
skipped"**, then **Exited**. The webhook's own Stats showed a successful
delivery. No error anywhere. No guide sent.

That is the worst possible failure shape — it looks like success from every
angle you'd normally check. The "Mapping Reference is required" error seen
earlier was GHL pointing at the same gap.

### Why a tag trigger is better, not just different

- **The failure cannot recur.** A native tag trigger always carries contact
  context. There is no mapping to misconfigure.
- **Idempotency is free.** GHL fires *Tag Added* only when the tag is **new**,
  so a repeat submission of the same magnet cannot re-send. This is why the
  `delivered-*` tags, `markDelivered()` and the `shouldDeliver` branch are all
  gone from the codebase — that logic existed solely to stop the webhook
  double-firing, and the trigger now handles it.
- **The returning-subscriber case still works.** Someone who took Decode last
  week and comes back for Vet Bill gets a genuinely new tag, so that delivery
  fires. This was the exact case the webhook was introduced to solve, and the
  tag handles it without the webhook's downside.
- **One fewer secret.** Webhook URLs are bearer-equivalent — anyone holding one
  can trigger the workflow — and they could never be committed. Now there is
  nothing to hold.

### The one behavioural consequence

If somebody removes a `lead-magnet-*` tag in the GHL UI and that contact
submits again, the guide sends again. That is correct, not a bug: the tag is
the record of "this person has this guide", so clearing it means they don't.

---

## Setting up a delivery workflow

1. **Custom values first.** Settings → Custom Values. Create the two PDF URLs
   and note the exact keys — the email templates reference
   `{{custom_values.decode_pdf_url}}` and `{{custom_values.vetbill_pdf_url}}`.
   Without these the emails send a literal merge tag as visible text, which is
   how the first version shipped broken. See `docs/emails/README.md`.
2. **New workflow → trigger → Contact Tag.** Set it to the exact tag string
   from the table above. No filters.
3. **Actions.** Send the email, then add to the pipeline. The two Add Tag
   actions that used to be here are redundant — the API already applied both
   `lead-magnet-*` and `audience-pets-dogs` before the workflow ran.
4. **Publish**, then submit a real test and check the **execution history**,
   not the trigger's stats. Stats only prove GHL received something; the
   history is what shows whether the actions ran. Success looks like the action
   list *not* saying "Action skipped".

---

## Verify the whole path

```bash
npm run check:ghl      # every custom field the code writes exists
npm run test:api -- --dry        # HTTP boundary only, no CRM writes
npm run cleanup:qa -- --delete   # remove contacts a run created
```

To point any of these at a deployed URL, pass a flag rather than an env var —
it works the same in PowerShell, cmd and bash, and doesn't linger in the shell:

```
npm run check:tags -- --base=https://www.coolstuffwithcoco.com
npm run test:api   -- --base=https://www.coolstuffwithcoco.com --dry
```

**The CRM-writing cases need `ALLOW_CRM_SENDS=1`** and will not run without
it. That is deliberate: since delivery triggers on the tag, those cases make
GHL genuinely send, to `@example.com` addresses that have no MX record and
therefore hard bounce — from a sending domain only days old. Run them when you
actually want sends, having first suppressed the delivery workflows or pointed
the suite at an address that can receive.

`test:crm` is the one that matters here — it asserts the `lead-magnet-*` tags
actually land, which is now the same thing as asserting delivery will fire.

Run `cleanup:qa` afterwards. Those suites write real contacts, and 155 of them
accumulated before that script existed.
