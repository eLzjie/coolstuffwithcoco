"use client";

import { useSyncExternalStore } from "react";

/**
 * Remembers the email someone just submitted, for the length of the tab.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * The thank-you page offers a waitlist, and the visitor gave us their email
 * about four seconds earlier. Asking for it again on the very next screen is
 * friction that also reads as slightly insulting — "you already have this".
 *
 * The obvious alternatives are both worse:
 *
 *  - PUT IT IN THE REDIRECT URL. Never. That writes a real email address into
 *    browser history, into the Referer header sent to every third party the
 *    page loads, and into any analytics tool that records page paths. A URL is
 *    the one place PII must not go.
 *  - LOOK IT UP SERVER-SIDE. There is nothing to look it up BY. The thank-you
 *    page is a static route with no session and no cookie.
 *
 * So: sessionStorage. Same-origin, never sent to a server unless we choose to
 * send it, and gone when the tab closes — which is the right lifetime, because
 * this exists to bridge one navigation and nothing more.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS IS NOT
 * ---------------------------------------------------------------------------
 * Not a session, not authentication, and not a source of truth. Anyone can
 * type anything into their own sessionStorage, so the server re-validates the
 * address on the way in exactly as it would from a form. All this saves is the
 * typing.
 *
 * It can be empty for perfectly ordinary reasons — a direct visit to the
 * thank-you page, a shared link, a new tab, private mode, blocked storage. So
 * every consumer needs a path that works without it. See LibraryOffer, which
 * falls back to showing the field.
 */

const KEY = "coco_recent_capture";

/** Called on a successful submit. Best-effort by design. */
export function rememberCapture(email: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, email);
  } catch {
    /*
      Blocked storage or private mode. Non-fatal: the waitlist just asks for
      the address instead, which is the same experience a direct visitor gets.
    */
  }
}

/** The address submitted this session, or null if we don't have one. */
export function recentCapture(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(KEY);
    return v && v.includes("@") ? v : null;
  } catch {
    return null;
  }
}

/**
 * Forget it.
 *
 * Called once the waitlist has been joined, so a back-navigation doesn't
 * re-offer a one-tap action that has already happened.
 */
export function clearCapture() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

/* -------------------------------------------------------------------------
   Reading it from a component
   ------------------------------------------------------------------------- */

/**
 * Stable no-op subscribe.
 *
 * Module level so the reference never changes between renders —
 * useSyncExternalStore re-subscribes whenever this identity changes, and an
 * inline arrow would do that on every render.
 *
 * There is genuinely nothing to subscribe to: the value is written once by the
 * form before navigation and never changes while the thank-you page is open.
 */
const subscribe = () => () => {};

/** Server render has no sessionStorage, and that is not an error. */
const serverSnapshot = () => null;

/**
 * The address submitted this session, safe to call during render.
 *
 * useSyncExternalStore rather than useState + useEffect, and that is not
 * stylistic. Reading a browser API during render is a React 19 purity
 * violation, and the obvious workaround — read it in an effect and setState —
 * trips `react-hooks/set-state-in-effect`, which is an ERROR in this repo's
 * config. This hook is the sanctioned way to read an external store: it gives
 * a server snapshot for SSR and a client snapshot after hydration, with no
 * impure render and no state write from an effect.
 *
 * Returns a primitive, so React's snapshot comparison is by value and there is
 * no "getSnapshot should be cached" warning.
 */
export function useRecentCapture(): string | null {
  return useSyncExternalStore(subscribe, recentCapture, serverSnapshot);
}
