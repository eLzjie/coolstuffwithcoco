# Delivery emails — three HTML templates

Paste-ready for GHL's email builder (use the **Code / Custom HTML** block, not
the drag-and-drop editor — it rewrites markup).

| File | Workflow | Trigger |
|---|---|---|
| `01-decode-delivery.html` | WF-1a Decode delivery | Contact Tag `lead-magnet-decode` |
| `02-vetbill-delivery.html` | WF-1b Vet Bill delivery | Contact Tag `lead-magnet-vetbill` |
| `03-newsletter-welcome.html` | WF-1c Newsletter | Contact Tag `lead-magnet-newsletter` |

---

## THE BUG THESE FIX

The live Decode email was going out containing this, literally, as visible text:

```
[Read Decode Your Dog]({DECODE_PDF_URL})
```

Two separate faults, both fatal to the one thing the email exists to do:

1. **`{DECODE_PDF_URL}` is not GHL merge syntax.** GHL wants
   `{{custom_values.decode_pdf_url}}` — double braces, and the
   `custom_values.` prefix. A single-brace token matches nothing, so it renders
   as-is.
2. **Markdown doesn't render in email.** `[text](url)` is markdown; email
   needs an `<a href>`. Even with the merge field fixed, that line would have
   shown as bracket-soup.

Net effect: every subscriber received a dead placeholder instead of their
guide, on a launch whose entire de-risking strategy is that the guide arrives.

**Before sending anything, set the two custom values in GHL** (Settings →
Custom Values) and confirm the exact keys match what's in the HTML:

| Custom value | Merge tag in these templates |
|---|---|
| Decode PDF URL | `{{custom_values.decode_pdf_url}}` |
| Vet Bill PDF URL | `{{custom_values.vetbill_pdf_url}}` |

Send yourself a test and **check the rendered link is a real URL**, not a
merge tag. A merge tag that doesn't resolve renders as its own literal text,
which is exactly how this shipped broken the first time.

---

## Why these are built the way they are

**Tables, inline styles, no `<style>` block.** Gmail strips `<head>` styles on
some clients and Outlook's Word renderer ignores most modern CSS. Every rule
here is inline on a table cell, which is the only thing that renders
everywhere. It looks like 2005 markup because email is 2005.

**No web fonts.** They fail silently in most clients and fall back
unpredictably. System stack only.

**No background images.** Blocked by default in Outlook and often in Gmail, and
anything load-bearing behind one disappears.

**One hosted logo, with a real `alt`.** Images are blocked by default for a
large share of recipients, so the alt text has to carry the brand. Width is set
in both the attribute and the inline style — Outlook honours the attribute,
everything else honours the style.

**600px fixed width.** The safe maximum; wider gets clipped in the Outlook
reading pane.

**Dark mode is left alone deliberately.** Forcing colours with
`prefers-color-scheme` inside email is unreliable and can produce black text on
a black card in Gmail's auto-inverted dark mode. These use a light card on a
light ground, which inverts acceptably.

**A plain-text alternative is included at the bottom of each file, commented
out.** Paste it into GHL's plain-text field. Sending HTML with no text part
measurably hurts deliverability, and on a domain this young that matters more
than usual.

---

## Deliverability notes for a days-old domain

The sending domain is new and a forward test already landed in spam, so the
first sends are the ones that set its reputation.

- **Every template is link-light.** The delivery emails have the guide link,
  one Instagram link, and the unsubscribe. Nothing else. A first email stuffed
  with links reads as promotional to filters.
- **No image-only content.** A high image-to-text ratio is a spam signal.
- **No tracking-pixel-only body.** If GHL adds open tracking, that's fine, but
  the body must carry real text.
- **The unsubscribe link is in every one of them.** Non-negotiable, and it's
  also the single cheapest deliverability protection you have — people who
  can't find it hit "report spam" instead.
- **Don't add the offer to these.** The Decode email says so explicitly in its
  own comment. The thank-you page carries the offer; a first email that both
  delivers a free thing and pitches a paid thing converts worse and complains
  more.

---

## Compliance — do not edit these out

- **Vet Bill** carries the general-guidance-not-veterinary-advice line and both
  poison-control numbers *with their per-incident fees*. Those lines are in the
  guide and the build spec requires them in the email too, not only the first
  one.
- **Poison control fees are stated** because we present the numbers to someone
  who may dial in a panic. ASPCA $95, Pet Poison Helpline $89 — verified
  September 2026. Re-check before any campaign push; prefer "a per-incident fee
  applies" to a stale figure.
- **No statistics** appear in any of these. In particular, never the 85.9%
  separation-anxiety figure — the paper's own authors disowned it.
- **Newsletter has no guide language.** It's a subscribe, not a delivery, so it
  must not say "the guide you downloaded". The build spec calls this out as a
  thing GHL's AI builder gets wrong by copying the pattern from the two before
  it.
