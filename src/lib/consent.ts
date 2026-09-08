"use client";

/**
 * Consent gate — the per-browser decision about whether tracking may fire.
 *
 * ---------------------------------------------------------------------------
 * Two different things, often confused. This file is only the first.
 * ---------------------------------------------------------------------------
 *  1. The GATE (here). "May the Pixel fire in this browser?" Per-browser, must
 *     be readable synchronously before any tag loads, and has to exist for
 *     visitors who never submit anything. That's why it's localStorage and not
 *     a database: a network round-trip can't gate a script that's already
 *     loading, and there's no contact record to look up for a visitor who
 *     hasn't given an email yet.
 *
 *  2. The RECORD. "This person agreed to marketing email." Belongs on the GHL
 *     contact — `marketing_consent`, written at capture. See lib/crm/ghl.ts.
 *
 * localStorage, not sessionStorage, deliberately: consent should outlive the
 * tab. Re-asking on every visit is worse for the visitor and worse for
 * conversion.
 *
 * ---------------------------------------------------------------------------
 * LAUNCH POSTURE — default granted, US-only targeting
 * ---------------------------------------------------------------------------
 * Region detection is NOT wired: there's no reliable client-side signal, so it
 * has to come from the CDN geo header (`x-vercel-ip-country`) passed down from
 * a server component. Until that lands, the gate can't do its job, and the
 * honest mitigation is a targeting constraint rather than pretending otherwise:
 * do not send EU/UK traffic to these pages.
 *
 * TODO(Eli): decide banner vs CMP, wire the region in from the edge, then flip
 * the default to denied for gated regions. Until then this is a targeting
 * discipline, not a technical control — and it needs to stay written down.
 */

export type ConsentCategory = "analytics" | "marketing";
export type ConsentState = Record<ConsentCategory, boolean>;

const STORAGE_KEY = "coco_consent_v1";

/** Default granted — see LAUNCH POSTURE above. */
const DEFAULT: ConsentState = { analytics: true, marketing: true };

let state: ConsentState | null = null;
const listeners = new Set<() => void>();

function read(): ConsentState {
  if (state) return state;
  if (typeof window === "undefined") return DEFAULT;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    state = raw ? { ...DEFAULT, ...(JSON.parse(raw) as ConsentState) } : DEFAULT;
  } catch {
    // Private mode or blocked storage — fall back rather than throwing.
    state = DEFAULT;
  }
  return state;
}

export function hasConsent(category: ConsentCategory): boolean {
  return read()[category] === true;
}

/**
 * The single boolean sent with a form submission.
 *
 * Requires BOTH categories, and that's the point: the server gates CAPI on
 * this value while the client's Pixel call goes through track(), which gates
 * on `analytics`. If the two could disagree — marketing granted, analytics
 * denied — the server would send CAPI while the client suppressed the Pixel,
 * so Meta would receive one half of a deduplicated pair and count it as a
 * whole conversion.
 *
 * Requiring both makes disagreement impossible by construction rather than by
 * everyone remembering to keep two call sites in step. It's latent today
 * (both default granted, nothing calls setConsent) and would have surfaced
 * the day the banner shipped.
 */
export function consentForSubmit(): boolean {
  return hasConsent("analytics") && hasConsent("marketing");
}

export function setConsent(next: Partial<ConsentState>) {
  state = { ...read(), ...next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal: the choice then applies for this page view only.
  }
  listeners.forEach((fn) => fn());
}

export function onConsentChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
