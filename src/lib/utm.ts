/**
 * Campaign attribution capture — FIRST TOUCH.
 *
 * Captured once on landing and persisted for the session. First touch wins:
 * an existing stored value is never overwritten by a later page, so someone
 * who lands on a Meta ad and then browses to the home page still carries the
 * ad that brought them.
 *
 * (This reverses the earlier last-touch behaviour. The capture spec is explicit
 * about it, and last-touch would credit an internal navigation over the ad.)
 *
 * The request body uses camelCase; the GHL contact fields are snake_case. The
 * mapping lives in lib/crm/ghl.ts, so this file only deals in camelCase.
 *
 * Everything here degrades to an in-memory value when sessionStorage is
 * unavailable (private mode, blocked storage). It never throws.
 */

const STORAGE_KEY = "coco_attribution";

const UTM_PARAMS = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_content", "utmContent"],
  ["utm_term", "utmTerm"],
] as const;

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  /** Meta's click id — the strongest signal we get for match quality. */
  fbclid: string | null;
  /** document.referrer at first touch, for traffic_source derivation. */
  referrer: string | null;
  /** Which page captured them. */
  landingPage: string | null;
};

const EMPTY: Attribution = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
  fbclid: null,
  referrer: null,
  landingPage: null,
};

/** Survives a blocked sessionStorage for the life of the page. */
let memory: Attribution | null = null;

/**
 * Call once on landing. Safe to call on every navigation — it only writes the
 * first time, which is what makes attribution first-touch.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY;

  const stored = read();
  if (stored) return stored;

  const params = new URLSearchParams(window.location.search);
  const fresh: Attribution = { ...EMPTY };

  for (const [param, key] of UTM_PARAMS) {
    fresh[key] = params.get(param) || null;
  }
  fresh.fbclid = params.get("fbclid") || null;
  fresh.referrer = document.referrer || null;
  fresh.landingPage = window.location.pathname;

  write(fresh);
  return fresh;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return EMPTY;
  return read() ?? captureAttribution();
}

function read(): Attribution | null {
  if (memory) return memory;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    memory = { ...EMPTY, ...parsed };
    return memory;
  } catch {
    // Blocked storage or malformed JSON — treat as "nothing stored yet".
    return null;
  }
}

function write(value: Attribution) {
  memory = value;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Non-fatal: `memory` still carries it for this page view.
  }
}
