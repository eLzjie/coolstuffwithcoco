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
 * BANNER SHIPPED 2026-09-09 (`components/consent/ConsentBanner.tsx`), so
 * `setConsent` finally has a caller and a visitor can actually decline. What
 * that changes and what it does not:
 *
 *  - DECLINING NOW WORKS. It writes the gate, flips all four Google Consent
 *    Mode signals to denied, and `track()` stops firing. That was already
 *    plumbed; it just had no UI.
 *  - THE DEFAULT IS STILL GRANTED, which makes this an opt-OUT notice (a US
 *    posture) rather than GDPR consent. Flipping the default to denied is a
 *    business decision, not a technical one — it would suppress measurement
 *    for every visitor until they click, and that is Eli's call to make.
 *  - THE REGION SIGNAL IS STILL NOT WIRED. `x-vercel-ip-country` from a server
 *    component is how the default becomes denied for EEA/UK only, which is the
 *    shape that costs nothing in the US and complies in Europe.
 *  - MICROSOFT CLARITY IS NOT COVERED BY THIS. It records sessions and it is
 *    installed inside the GTM container, so our gate cannot reach it. That has
 *    to be done in GTM. Until it is, declining does NOT stop session replay,
 *    which is why the banner copy does not claim it does. See
 *    `docs/LEGAL-REVIEW.md` §7.
 *
 * So the targeting discipline still stands: do not send EU/UK traffic until
 * the region default and the Clarity gate are both done.
 */

import {
  CONSENT_STORAGE_KEY,
  updateGoogleConsent,
} from "@/lib/analytics/consentMode";

export type ConsentCategory = "analytics" | "marketing";
export type ConsentState = Record<ConsentCategory, boolean>;

/*
  The key lives in analytics/consentMode.ts, not here, purely because a SERVER
  component has to read it to inline the Consent Mode default before any tag
  loads — and this module is "use client". See the note there. One definition,
  imported in the direction that is safe.
*/
const STORAGE_KEY = CONSENT_STORAGE_KEY;

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

/**
 * Has this browser made a choice yet?
 *
 * Separate from `hasConsent` because the default is granted: "analytics is
 * true" cannot tell you whether that is a decision or an absence of one, and
 * the banner only exists to ask people in the second group.
 *
 * Presence of the key IS the answer, so it reads raw rather than going through
 * `read()` — which merges over DEFAULT and loses the distinction.
 *
 * Returns `true` (decided) in two cases where the honest answer is "don't
 * ask":
 *
 *  - ON THE SERVER. There is no localStorage to read, and rendering a banner
 *    into the HTML that hydration might immediately remove is a flash of
 *    content plus a mismatch. The banner appears after hydration instead;
 *    it is `position: fixed`, so arriving late costs no layout shift.
 *  - WHEN STORAGE IS BLOCKED. We could ask, but we could not remember the
 *    answer, so we would ask again on every single page view. Nagging someone
 *    forever is worse than not asking, and private mode is already the
 *    least-tracked state a visitor can be in.
 */
export function hasDecided(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return true;
  }
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

  /*
    Google's tags are told directly, not through the listener loop.

    Consent Mode is a property of the already-loaded tag rather than something
    our own code checks, so it can't be expressed as a track() gate — a denied
    visitor whose tag was never updated keeps writing cookies no matter what
    track() does. Doing it here means a banner added later needs no analytics
    work at all: it calls setConsent and Google follows.
  */
  updateGoogleConsent(state);

  listeners.forEach((fn) => fn());
}

export function onConsentChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

