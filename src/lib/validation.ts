/**
 * Shared input rules, so the client and the route handler can't drift.
 *
 * They were duplicated byte-for-byte in two files. The regex is deliberately
 * loose and that looseness is load-bearing, so it needs to be one thing:
 * an RFC-compliant pattern rejects valid addresses and is a known conversion
 * leak. The real validation is whether the delivery email arrives.
 */

/** Shape check only. Do not "improve" this into a stricter pattern. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** RFC 5321 caps the whole address at 254 characters. */
export const EMAIL_MAX = 254;

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length > 0 && v.length <= EMAIL_MAX && EMAIL_RE.test(v);
}
