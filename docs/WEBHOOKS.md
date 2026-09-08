# Webhook setup — GHL side and Next.js side

How a form submission on the site ends up triggering a GoHighLevel workflow that emails the guide.

**Read the direction of travel first, because it's the thing that confuses everyone:**

> Our site **sends** the webhook. GHL **receives** it.
>
> GHL gives you a URL. Our server POSTs to that URL. That POST is what starts the workflow. GHL never calls us.

So there is **nothing to build on our side** beyond pasting three URLs into environment variables. The code that sends them already exists.

---

## The short answer to "is it GET or POST?"

**POST.** Always.

- Our handler sends `POST` with a JSON body and `Content-Type: application/json`.
- GHL's Inbound Webhook trigger accepts POST and reads the JSON body.
- A GET can't carry a JSON body, so it can't carry the email. If you ever see a GHL doc offering a GET test, it's for checking the URL is alive — not for real data.

You never choose the method anywhere in the GHL UI. GHL just gives you a URL that listens; our code decides the method, and it's already POST.

---

## The whole flow, once

```
  Visitor submits the form on /decode
            |
            v
  POST /api/subscribe            (our server, src/app/api/subscribe/route.ts)
            |
            |-- 1. upsert the contact in GHL   (v2 API, Bearer token)
            |        creates or updates, writes custom fields + tags
            |
            |-- 2. POST to the Inbound Webhook URL   <-- THIS is the trigger
            |        GHL_WEBHOOK_DECODE
            |            |
            |            v
            |     WF-1a Decode delivery fires
            |        tag, email the hosted PDF URL, add to pipeline
            |
            |-- 3. Meta CAPI Lead  (server-side, hashed email)
            v
  { ok: true, eventId }  ->  browser fires the Pixel with the same eventId
```

### Why both step 1 and step 2 exist

This is the part that trips people up, and collapsing them is the classic mistake.

- The **upsert** (step 1) puts the data on the contact. It does **not** fire GHL's *"Form submitted"* trigger, because no GHL form was submitted — we used the API. That trigger is simply dead on this path.
- **"Contact Created"** is also the wrong trigger. Someone who already downloaded Decode is an *existing* contact, so it wouldn't fire when they come back for the Vet Bill — and they'd never receive the second guide.
- The **Inbound Webhook** (step 2) fires on **every** submission regardless of whether the contact already existed. That's the only trigger that behaves correctly here.

**Both calls are required. Don't try to merge them.**

---

## Part 1 — GHL side (do this first)

The webhook URL doesn't exist until you've created and saved the workflow trigger, so this has to come before the env vars.

Repeat for all three: **Decode**, **Vet Bill**, **Newsletter**.

### Step 1. Create the workflow

1. **Automation → Workflows → + Create Workflow → Start from scratch**
2. Name it exactly: `WF-1a Decode delivery` (then `WF-1b Vet Bill delivery`, `WF-1c Newsletter welcome`)
3. Save.

### Step 2. Add the Inbound Webhook trigger

1. Click **+ Add New Trigger**
2. Search for and choose **Inbound Webhook**
3. It will show you a **Webhook URL**. It looks roughly like:
   `https://services.leadconnectorhq.com/hooks/<location>/webhook-trigger/<uuid>`
4. **Save the trigger, then save the workflow.**

> **The URL is only real after you save.** If you copy it from an unsaved trigger it may not fire. Save first, then re-open and copy.

5. Copy the URL somewhere safe. You need it in Part 2.

### Step 3. Give GHL a sample payload so the fields become mappable

This is the step people skip, and then the workflow can't see `{{inboundWebhookRequest.email}}`.

GHL learns the shape of the payload from a real request. Until it receives one, there are no fields to map in the email template.

Two ways to send it one:

**Option A — from this repo (recommended, it's the real payload):**

```bash
# Paste the webhook URL you just copied
curl -X POST "<PASTE_WEBHOOK_URL>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you+cocotest@yourdomain.com",
    "lead_magnet": "decode",
    "parent_audience": "Pets > Dogs",
    "traffic_source": "Meta",
    "campaign": "decode_curiosity_v1",
    "utm_source": "meta",
    "utm_medium": "paid_social",
    "utm_campaign": "decode_curiosity_v1",
    "utm_content": "video_a",
    "utm_term": null,
    "landing_page": "/decode"
  }'
```

**Option B —** submit the real form once with `GHL_WEBHOOK_DECODE` already set (Part 2), which sends exactly the same shape.

6. Back in the trigger, click **Fetch Sample Request** / **Check for new requests**. The payload should appear.
7. Now the fields are available in the workflow as:
   `{{inboundWebhookRequest.email}}`, `{{inboundWebhookRequest.lead_magnet}}`, and so on for every key above.

> **Verify this specifically.** Whether the Inbound Webhook trigger reliably exposes payload fields inside the workflow is the one thing in the build spec marked *recommended but unconfirmed*. Confirm it before relying on it — see [If the fields don't appear](#if-the-fields-dont-appear).

### Step 4. Build the actions

For `WF-1a Decode delivery`, keep it flat — no waits, no branches:

1. **Add Contact Tag** → `lead-magnet-decode`
2. **Send Email** → the delivery email, containing the **hosted PDF URL**
3. **Add to Pipeline** → `Coco Subscriber Value`, stage `Opted in`
4. (after the send) move to stage `Guide sent`

For `WF-1b Vet Bill delivery`: identical, plus the *"general guidance, not veterinary care"* line in the email body.

For `WF-1c Newsletter welcome`: tag + welcome email **only**. No PDF, no nurture, no pipeline — every stage past the first is meaningless for a newsletter subscriber and would corrupt the conversion rates on the board.

### Step 5. Publish

Toggle the workflow from **Draft** to **Publish**. A draft workflow accepts the webhook and does nothing, which looks exactly like a broken webhook.

---

## Part 2 — Next.js side

Paste the three URLs into `.env.local`:

```bash
GHL_WEBHOOK_DECODE=https://services.leadconnectorhq.com/hooks/.../webhook-trigger/...
GHL_WEBHOOK_VETBILL=https://services.leadconnectorhq.com/hooks/.../webhook-trigger/...
GHL_WEBHOOK_NEWSLETTER=https://services.leadconnectorhq.com/hooks/.../webhook-trigger/...
```

That's it. No code changes.

**Notes:**

- These are **server-only**. No `NEXT_PUBLIC_` prefix — anyone with the URL can trigger your delivery workflow, so it stays out of the client bundle.
- Restart `npm run dev` after editing `.env.local`; env vars are read at boot.
- On Vercel, add the same three under **Settings → Environment Variables**, for Production *and* Preview. A missing one there is the most likely cause of "it worked locally".
- If a URL is missing, `/api/subscribe` returns `UPSTREAM_ERROR` and logs which variable is unset. It deliberately does **not** pretend to succeed — a silent success would mean a lead that paid for a click and got nothing.

### What we send

`src/lib/crm/ghl.ts` → `fireDeliveryWebhook()`:

| Key | Example | Notes |
|---|---|---|
| `contact_id` | `lIN66MntYGQWt75f9x6G` | **map on this** — the record the upsert just wrote |
| `email` | `someone@example.com` | trimmed, lowercased |
| `first_name` | `Sam` | may be `null` (newsletter collects none) |
| `last_name` | `Rivera` | may be `null` — optional on the forms |
| `phone` | `5551234567` | may be `null`; digits only |
| `lead_magnet` | `decode` | `decode` / `vetbill` / `newsletter` |
| `parent_audience` | `Pets > Dogs` | constant |
| `traffic_source` | `Meta` | one of the six enum values |
| `campaign` | `decode_curiosity_v1` | |
| `utm_source` … `utm_term` | | first-touch, may be `null` |
| `landing_page` | `/decode` | which page captured them |

---

## Part 3 — Test it end to end

Do this **before** any spend. This is the exact failure that surfaced post-launch on the previous project.

```bash
npm run check:ghl        # do the custom fields exist? (must pass first)
npm run dev
```

1. Set `NEXT_PUBLIC_ANALYTICS_DEBUG=1` in `.env.local`.
2. Open `http://localhost:3000/decode?utm_source=meta&utm_medium=paid_social&utm_campaign=test1`
3. Submit a real address you can read.
4. **Check all five:**

| # | Where | Expect |
|---|---|---|
| 1 | Browser console | `[coco:track] form_start` then `[coco:track] lead` with an `eventId` |
| 2 | Terminal | no `[subscribe]` errors |
| 3 | GHL → Contacts | the contact exists, with `utm_source=meta`, `traffic_source=Meta`, tags `audience-pets-dogs`, `lead-magnet-decode`, `delivered-decode` |
| 4 | GHL → the workflow → **Enrolment History** | one enrolment |
| 5 | Your inbox | the guide email, with a working PDF link |

5. **Now submit the same address again.** You should get: success in the browser, **no second email**, and still exactly one enrolment. That's the `(email, leadMagnet)` idempotency working.
6. **Then submit that same address on `/vetbill`.** You *should* get a second email — a different magnet must deliver. If it doesn't, the idempotency is scoped too broadly.

Step 6 is the one worth being fussy about. It's the case that "Contact Created" would get wrong, and it's invisible until a returning subscriber quietly never receives the second guide.

---

## THE FAILURE THAT ACTUALLY HAPPENED — read this first

**Symptom:** the workflow shows **Entered**, then every action shows
**"Action skipped"**, then **Exited**. No tag, no email, no pipeline entry, and
no error anywhere. The webhook Stats show a successful delivery. The subscriber
gets no PDF.

Observed live on 2026-09-08.

**Cause:** an Inbound Webhook trigger does **not** attach a contact to the
workflow run. Every action in the delivery workflow is contact-scoped — add
tag, send email, add to opportunity — so with no contact in context GHL skips
each one and exits. The run reports as successful because, technically, nothing
failed.

This is also what the "Mapping Reference is required" error is pointing at.

**It is not a problem with this codebase.** Verified against production the
same day: the API creates the contact and tags it
(`audience-pets-dogs`, `lead-magnet-decode`, `delivered-decode`) before the
webhook is ever called. The contact exists. The workflow just isn't looking at
it.

### Fix A — switch the trigger to a tag. Recommended.

Instead of an Inbound Webhook, trigger the delivery workflow on:

> **Contact Tag** — tag is `lead-magnet-decode` (and `lead-magnet-vetbill` in
> the other workflow)

Why this is better, not just easier:

- **`upsertContact` already applies that tag via the API**, so there's nothing
  new to build on our side.
- A native tag trigger **always** carries contact context, so the skipped-action
  failure cannot happen. There is no mapping to misconfigure.
- **It dedupes for free.** A repeat submission of the same magnet adds no *new*
  tag, so the workflow can't re-fire and send a second copy.
- A returning subscriber taking the *second* guide gets a genuinely new tag, so
  that delivery still fires — which is the case the webhook existed to solve in
  the first place.

If you take this route, the `GHL_WEBHOOK_*` env vars and the webhook call
become dead weight. Leave them set until the tag trigger is confirmed working,
then remove them in one change.

### Fix B — keep the webhook, and map the contact

In the Inbound Webhook trigger's **Mapping Reference**, map a payload field to
the contact identifier. Prefer **`contact_id`** — the payload now carries it
(added 2026-09-08), taken from the upsert immediately before the webhook fires,
so the workflow resolves the exact record rather than fuzzy-matching an email.

`email`, `first_name`, `last_name` and `phone` are also in the payload so a
mapping keyed on email can populate a contact it has to create.

After changing the mapping you **must re-publish** the workflow.

### How to tell it's fixed

The action list stops saying "Action skipped". Check the workflow's execution
history rather than trusting the webhook's Stats — Stats only proves GHL
*received* the POST, which was already true while nothing was being delivered.

---

## Troubleshooting

**Workflow never fires.**
Draft instead of Published (step 5) — by far the most common. Then: wrong URL pasted, or the URL copied before the trigger was saved. Check **Enrolment History** on the workflow; if it's empty, GHL never received the request.

**Fires but the email is blank / shows `{{inboundWebhookRequest.email}}` literally.**
GHL hasn't learned the payload shape. Re-do step 3, then re-map the merge fields in the email.

**Contact appears but custom fields are empty.**
The field doesn't exist in the sub-account. GHL accepts a write to a nonexistent field and **silently drops it**. Run `npm run check:ghl` — at last check, 6 of the fields written at capture were missing.

**`UPSTREAM_ERROR` in the browser.**
Check the terminal. It's one of: a missing `GHL_WEBHOOK_*`, an expired `GHL_API_KEY`, or the webhook returning non-2xx.

**Two emails for one submission.**
Either the `delivered-*` tag isn't being written (check the contact's tags), or a second workflow is also triggering on `lead-magnet-decode`. Note that the nurture workflows (WF-2a/2b) *do* trigger on that tag by design — they just shouldn't send the guide itself.

**Everything works locally, nothing works deployed.**
Env vars not set on Vercel, or set for Preview but not Production.

### If the fields don't appear

The documented fallback, and it's a one-file change:

Have the webhook carry only `email` and `lead_magnet`, and let the **contact upsert** carry everything else. The workflow then reads the custom fields off the contact record instead of the webhook payload.

Only `fireDeliveryWebhook()` in `src/lib/crm/ghl.ts` changes. Worth discovering early, while there's runway.

---

## Security note

The webhook URL is a **bearer credential**. Anyone holding it can enrol arbitrary addresses into your delivery workflow.

- Never commit it. `.env.local` is gitignored; `.env.example` holds keys with no values.
- Never expose it with `NEXT_PUBLIC_`.
- If it leaks, regenerate it: delete the Inbound Webhook trigger, add a new one, paste the new URL.

There's no signature verification available on GHL's inbound webhooks, so URL secrecy is the only control. That's acceptable here because the worst case is junk enrolments — but it's also why rate limiting sits in front of `/api/subscribe`, so our endpoint can't be used as a free amplifier.
