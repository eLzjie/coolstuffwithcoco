/**
 * Consent disclosures, versioned.
 *
 * ---------------------------------------------------------------------------
 * WHY THERE IS A VERSION STRING
 * ---------------------------------------------------------------------------
 * A consent record is only defensible if you can show WHAT the person agreed
 * to, not just that they ticked something. The version is written to the
 * contact's `consent_version` field at capture, so any given contact can be
 * traced back to the exact wording on screen when they submitted.
 *
 * BUMP THE VERSION whenever the wording below changes in a way that alters
 * what someone is agreeing to. Don't bump it for a typo fix. Never edit a
 * historical version's text — add a new one.
 *
 * ---------------------------------------------------------------------------
 * NO PHONE IS COLLECTED ANY MORE (2026-09-09) — TCPA IS OUT OF SCOPE
 * ---------------------------------------------------------------------------
 * The guide forms now take first name and email only. Client instruction:
 * "we're asking too much, let's just do name and email".
 *
 * That removes the TCPA question entirely, because the TCPA is triggered by
 * collecting a number you might call or text. The disclosure below is now a
 * plain marketing-email disclosure: the guide arrives by email, more email
 * follows, and unsubscribing is one click.
 *
 * CONSENT_VERSION was bumped to guide-v2 for this. Rule from the top of this
 * file: bump whenever the wording changes what someone is agreeing to, and
 * never edit a historical version's text. Contacts captured before this carry
 * guide-v1 and agreed to the phone-inclusive wording; that record stays true.
 *
 * ---------------------------------------------------------------------------
 * THE TCPA REASONING IS KEPT BELOW ON PURPOSE — READ IT IF PHONE COMES BACK
 * ---------------------------------------------------------------------------
 * The server still accepts a phone if one is posted and `phone_number` still
 * exists as a GHL custom field, so re-adding the field is a client-only
 * change. It is NOT a free one. The moment a number is collected, everything
 * below applies again and the disclosure has to be rewritten to satisfy it.
 *
 * The requirements the guide-v1 wording was built against:
 *
 *   1. Disclose the NATURE of the communications — not just "we'll be in touch".
 *   2. Identify the seller by name.
 *   3. State that consent is NOT a condition of getting the thing.
 *   4. Keep a record of when and to what they consented.
 *
 * (1)-(3) are in the text. (4) is this version string plus `consent_at`.
 *
 * Note: a Feb 2026 Fifth Circuit decision (Bradford v. Sovereign Pest
 * Control) held the TCPA itself requires only "prior express consent" rather
 * than written consent for prerecorded calls — but state statutes still
 * require more in many places, so the safe construction is unchanged.
 *
 * NOT LEGAL ADVICE. This wording is written to be honest and to cover the
 * points above; it has not been reviewed by a lawyer. See docs/LEGAL-REVIEW.md.
 *
 * ---------------------------------------------------------------------------
 * DO NOT promise SMS
 * ---------------------------------------------------------------------------
 * A2P 10DLC is not filed, so no SMS can actually be sent. The wording says
 * "may contact you", which is permission rather than a promise — that stays
 * true whether or not texting is ever switched on.
 */

/**
 * Bumped from "2026-09-08.guide-v1" when phone and last name were dropped
 * from the guide forms. Contacts captured under v1 agreed to wording that
 * described a phone field; leaving them on v1 is correct, not a gap.
 */
export const CONSENT_VERSION = "2026-09-09.guide-v2";

/**
 * Shown under the guide opt-in forms. First name and email only.
 *
 * Two sentences, and both are load-bearing. The first sets the expectation
 * that the guide arrives by email — which matters more now that the
 * thank-you page no longer carries the download. The second discloses the
 * ongoing marketing email BEFORE submit, which the build spec requires:
 * submit plus this visible disclosure IS the permission, so there is no
 * pre-ticked box and no separate checkbox.
 *
 * Do not trim this for punchiness. It is shorter than v1 only because the
 * phone sentences described a field that no longer exists.
 */
export const CONSENT_GUIDE = {
  version: CONSENT_VERSION,
  /**
   * Rendered as one short paragraph. Kept as a single string so what's stored
   * against the contact and what's on screen can't drift apart.
   */
  text:
    "Your guide arrives by email. Cool Stuff with Coco will send you useful " +
    "dog emails afterwards too — unsubscribe any time, every email has a link.",
} as const;

/** Shown under the newsletter form. Email only, so no phone language. */
export const CONSENT_NEWSLETTER = {
  version: "2026-09-08.newsletter-v1",
  text:
    "Cool Stuff with Coco will send you useful dog emails a couple of times a " +
    "month. Unsubscribe any time — every email has a link.",
} as const;

/** Shown under the contact form. Not marketing consent. */
export const CONSENT_CONTACT = {
  version: "2026-09-08.contact-v1",
  text:
    "We'll use what you send here to reply to you. It doesn't sign you up to " +
    "anything.",
} as const;
