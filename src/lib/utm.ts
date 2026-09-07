/**
 * Campaign attribution capture.
 *
 * Captured once on landing and persisted for the session, so a visitor who
 * lands on /decode from an ad and later submits still carries the campaign
 * that brought them. Read by the analytics wrapper on every event.
 *
 * NOTE: with the GHL iframe embed in place these values are NOT reaching the
 * contact record — the iframe can't see them. They are captured and available
 * here so that the moment the form moves in-page, passing them through is a
 * one-line change. See GhlFormEmbed for the full picture.
 */

const STORAGE_KEY = "coco.attribution.v1";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Meta's click id — the strongest signal we get for matching. */
  fbclid?: string;
  traffic_source?: string;
  campaign?: string;
  page_path?: string;
  landing_variant?: string;
  /** Never merges with the Homeowners tree. */
  parent_audience: "pets-dogs";
};

/** Constant across every capture. The Homeowners tree must stay separate. */
export const PARENT_AUDIENCE = "pets-dogs" as const;

export function captureAttribution(): Attribution {
  const base: Attribution = { parent_audience: PARENT_AUDIENCE };

  if (typeof window === "undefined") return base;

  const existing = readStored();
  const params = new URLSearchParams(window.location.search);

  const fresh: Attribution = { ...base };
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) fresh[key] = v;
  }

  const fbclid = params.get("fbclid");
  if (fbclid) fresh.fbclid = fbclid;

  // Only overwrite stored attribution when this landing actually carries
  // campaign params. Otherwise an internal navigation would blank it out.
  const carriesCampaign = Object.keys(fresh).length > 1;
  const merged: Attribution = carriesCampaign ? fresh : { ...fresh, ...existing };

  merged.traffic_source = merged.utm_source ?? (merged.fbclid ? "meta" : referrerSource());
  merged.campaign = merged.utm_campaign;
  merged.page_path = window.location.pathname;
  merged.landing_variant = params.get("v") ?? "default";

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Private mode — attribution then lives for this page view only.
  }

  return merged;
}

function referrerSource() {
  if (!document.referrer) return "direct";
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === window.location.hostname ? "internal" : host;
  } catch {
    return "unknown";
  }
}

function readStored(): Partial<Attribution> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Attribution>) : {};
  } catch {
    return {};
  }
}

export function getAttribution(): Attribution {
  return { parent_audience: PARENT_AUDIENCE, ...readStored() };
}
