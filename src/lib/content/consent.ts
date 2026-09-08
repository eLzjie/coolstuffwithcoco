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
 * WHAT THE GUIDE DISCLOSURE HAS TO DO (US, phone collected)
 * ---------------------------------------------------------------------------
 * Collecting a phone number brings the TCPA into scope. The requirements the
 * wording below is built against:
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

export const CONSENT_VERSION = "2026-09-08.guide-v1";

/** Shown under the guide opt-in forms, where a phone number is collected. */
export const CONSENT_GUIDE = {
  version: CONSENT_VERSION,
  /**
   * Rendered as one short paragraph. Kept as a single string so what's stored
   * against the contact and what's on screen can't drift apart.
   */
  text:
    "Your guide arrives by email. Cool Stuff with Coco will also send you " +
    "useful dog emails afterwards, and may contact you about your request if " +
    "you've given a phone number — you can opt out of either at any time. " +
    "A phone number is optional and isn't required to get the guide.",
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
