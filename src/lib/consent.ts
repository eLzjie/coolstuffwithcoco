/**
 * Consent gate — interface only.
 *
 * The site takes EU/UK traffic, so the Pixel and CAPI must not fire before
 * consent where it's required. Whether that's a lightweight banner or full CMP
 * tooling is Eli's decision, so this is deliberately a seam, not an
 * implementation: both plug in behind the same three functions.
 *
 * TO WIRE UP A REAL CMP: replace the body of `hasConsent` with a read of the
 * CMP's state and call `notify()` from its change callback. Nothing else in the
 * codebase needs to know which CMP won.
 */

export type ConsentCategory = "analytics" | "marketing";

export type ConsentState = Record<ConsentCategory, boolean>;

const STORAGE_KEY = "coco.consent.v1";

/**
 * Regions where we gate before firing. Everywhere else defaults to granted.
 *
 * TODO(Eli): confirm this list with whoever signs off on privacy. It is
 * currently EEA + UK + Switzerland and is not legal advice.
 */
const GATED_REGIONS = /^(AT|BE|BG|HR|CY|CZ|DK|EE|FI|FR|DE|GR|HU|IE|IT|LV|LT|LU|MT|NL|PL|PT|RO|SK|SI|ES|SE|IS|LI|NO|GB|CH)$/;

let state: ConsentState | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/**
 * Whether this visitor needs an explicit opt-in.
 *
 * Region detection is not implemented — there is no reliable client-side
 * signal for it. In production this should come from the CDN's geo header
 * (Vercel sets `x-vercel-ip-country`) passed down from a server component.
 *
 * TODO(Eli): decide banner vs CMP, then wire region in from the edge.
 */
export function requiresGate(country?: string) {
  if (!country) return false;
  return GATED_REGIONS.test(country.toUpperCase());
}

function read(): ConsentState {
  if (state) return state;

  // Default-granted outside gated regions. `requiresGate` flips this once
  // region detection is wired in from the edge.
  const fallback: ConsentState = { analytics: true, marketing: true };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    state = raw ? (JSON.parse(raw) as ConsentState) : fallback;
  } catch {
    // Private mode, blocked storage — fail to the fallback rather than throwing.
    state = fallback;
  }

  return state;
}

export function hasConsent(category: ConsentCategory) {
  return read()[category] === true;
}

export function setConsent(next: Partial<ConsentState>) {
  state = { ...read(), ...next };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal — consent then lasts for this page view only.
  }
  notify();
}

export function onConsentChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
