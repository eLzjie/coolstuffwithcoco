/**
 * The three things someone can opt into.
 *
 * Defined here rather than in the CRM or analytics module because both need
 * it and neither should depend on the other. Two separate definitions had
 * already drifted — analytics was missing `newsletter`, which typechecked
 * fine until the newsletter form was wired up.
 */
export const LEAD_MAGNETS = ["decode", "vetbill", "newsletter"] as const;

export type LeadMagnet = (typeof LEAD_MAGNETS)[number];

export function isLeadMagnet(v: unknown): v is LeadMagnet {
  return typeof v === "string" && (LEAD_MAGNETS as readonly string[]).includes(v);
}
