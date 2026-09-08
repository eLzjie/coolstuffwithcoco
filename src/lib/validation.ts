/**
 * Shared input rules, so the client and the route handler can't drift.
 *
 * They were duplicated byte-for-byte in two files. The email regex is
 * deliberately loose and that looseness is load-bearing: an RFC-compliant
 * pattern rejects valid addresses and is a known conversion leak. The real
 * validation is whether the delivery email arrives.
 */

/** Shape check only. Do not "improve" this into a stricter pattern. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** RFC 5321 caps the whole address at 254 characters. */
export const EMAIL_MAX = 254;

export const NAME_MAX = 60;
export const PHONE_MAX = 25;

/**
 * Cap for every attribution string (UTMs, campaign, referrer, fbclid, path).
 *
 * These are never typed by a person — they're read off the URL and the
 * referrer, so nothing legitimate comes close to 200 characters. Without a cap
 * they were the one unbounded path into the CRM: a single POST could write a
 * megabyte into a custom field and forward the same payload to the delivery
 * webhook, five times a minute, from an endpoint that needs no auth.
 *
 * Truncating is the right failure here rather than a 400. Attribution is
 * best-effort telemetry — refusing the whole submission would throw away a
 * real lead to protect a UTM value, which is the wrong trade.
 */
export const ATTR_MAX = 200;

/**
 * Contact-form message bounds.
 *
 * Here rather than in the route because they were duplicated byte-for-byte in
 * api/contact/route.ts and components/forms/ContactForm.tsx — which is the
 * exact failure this module exists to prevent. Bump one copy and the client
 * accepts a message the server rejects as BAD_REQUEST, which renders as
 * "something went wrong on our end": a dead end the visitor cannot act on.
 */
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && v.length <= EMAIL_MAX && EMAIL_RE.test(v);
}

/**
 * Phone validation, deliberately permissive.
 *
 * Accepts anything that contains 7–15 digits once punctuation is stripped.
 * 15 is the E.164 maximum; 7 is short enough not to reject a local format.
 *
 * We do NOT enforce a country or format. The field is optional and nothing
 * dials it today, so rejecting a real number over formatting would cost a
 * lead for no benefit. Normalisation happens server-side.
 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Strips everything except digits and a single leading `+`.
 *
 * Not converted to E.164 — that needs a country to guess from, and guessing
 * wrong corrupts the number. Stored close to what the person typed, tidied.
 */
export function normalisePhone(value: string): string {
  const trimmed = value.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

