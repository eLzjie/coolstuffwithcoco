/**
 * traffic_source derivation.
 *
 * A fixed dropdown in GHL, so these strings must match the field's options
 * EXACTLY or the write lands wrong. They're centralised here for that reason —
 * one place to fix if a spelling differs.
 *
 * TODO(Eli): confirm each string byte-for-byte against the GHL dropdown,
 * especially "Paid — Other". The build spec renders it with an em dash; if the
 * dropdown uses a hyphen the value won't match.
 */
export const TRAFFIC_SOURCE = {
  meta: "Meta",
  pinterest: "Pinterest",
  organic: "Organic",
  direct: "Direct",
  paidOther: "Paid — Other",
  referral: "Referral",
} as const;

export type TrafficSource = (typeof TRAFFIC_SOURCE)[keyof typeof TRAFFIC_SOURCE];

const META_SOURCES = new Set([
  "meta",
  "facebook",
  "fb",
  "ig",
  "instagram",
]);

/** Search engines resolve to Organic rather than Referral. */
const SEARCH_HOSTS =
  /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave|startpage|baidu|yandex)\./i;

/** utm_medium values that mean somebody paid for the click. */
const PAID_MEDIUM = /(^|[^a-z])(paid|cpc|ppc|ppa|display|banner)([^a-z]|$)/i;

type Input = {
  utmSource?: string | null;
  utmMedium?: string | null;
  fbclid?: string | null;
  /** document.referrer, or "" */
  referrer?: string | null;
  /** Current host, so a self-referral isn't counted as external. */
  selfHost?: string | null;
};

/**
 * Order matters. The whole point of this taxonomy is comparing paid channels,
 * so paid must be identified before anything can fall through to Organic —
 * otherwise paid traffic from a channel we haven't named books itself as
 * Organic and corrupts the only comparison the field exists for.
 */
export function deriveTrafficSource({
  utmSource,
  utmMedium,
  fbclid,
  referrer,
  selfHost,
}: Input): TrafficSource {
  const source = utmSource?.trim().toLowerCase() ?? "";
  const medium = utmMedium?.trim().toLowerCase() ?? "";

  // 1. Meta — a click id is proof even when the UTMs are missing or mangled.
  if (fbclid || META_SOURCES.has(source)) return TRAFFIC_SOURCE.meta;

  // 2. Pinterest
  if (source === "pinterest" || source === "pin") return TRAFFIC_SOURCE.pinterest;

  // 3. Paid from somewhere we haven't named. Must beat Organic.
  if (PAID_MEDIUM.test(medium)) return TRAFFIC_SOURCE.paidOther;

  // 4. Any other tagged campaign is a deliberate non-paid placement.
  if (source) return TRAFFIC_SOURCE.organic;

  // 5. Untagged arrivals: split search from everything else.
  const host = referrerHost(referrer, selfHost);
  if (!host) return TRAFFIC_SOURCE.direct;
  if (SEARCH_HOSTS.test(`${host}.`)) return TRAFFIC_SOURCE.organic;
  return TRAFFIC_SOURCE.referral;
}

/** Hostname of an external referrer, or null for direct/self/unparseable. */
function referrerHost(
  referrer?: string | null,
  selfHost?: string | null,
): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host) return null;
    if (selfHost && host === selfHost.replace(/^www\./, "")) return null;
    return host;
  } catch {
    return null;
  }
}
