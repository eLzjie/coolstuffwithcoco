/**
 * Google Consent Mode v2.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT IS, AND WHY IT'S WIRED NOW RATHER THAN LATER
 * ---------------------------------------------------------------------------
 * Consent Mode is how Google's tags are told what they're allowed to do. Set
 * a signal to "denied" and the tag still loads but stops writing cookies and
 * sends only cookieless pings; set it to "granted" and it behaves normally.
 * v2 added `ad_user_data` and `ad_personalization`, which are the two Google
 * requires for advertising features in the EEA and UK.
 *
 * The site's posture today is default-granted with US-only targeting (see
 * lib/consent.ts), so every signal below starts granted and this file changes
 * nothing about what's collected. It is here anyway for one reason: the
 * default must be set BEFORE the tag initialises, and retrofitting that later
 * means touching script ordering in the layout under time pressure, on the
 * day a banner or an EU campaign becomes urgent. Wiring it while it's inert
 * costs a few hundred bytes and makes that day a one-line change.
 *
 * ---------------------------------------------------------------------------
 * THE ORDERING IS THE WHOLE POINT
 * ---------------------------------------------------------------------------
 * Google reads consent state when the tag initialises. A default set after
 * that applies to nothing already sent, and there is no error — the hits just
 * go out under the wrong assumption. So CONSENT_DEFAULT_SNIPPET renders with
 * `beforeInteractive` while the loaders render `afterInteractive`.
 *
 * `wait_for_update` gives an async consent source (a CMP, or our own
 * localStorage read) a window to answer before the tag commits to the
 * default. Without it a genuinely-denied visitor can leak one granted hit.
 */

/**
 * The localStorage key the consent gate writes.
 *
 * Defined HERE rather than in lib/consent.ts, which owns it conceptually, for
 * a module-boundary reason: consent.ts is `"use client"`, and this file is
 * imported by a SERVER component (components/analytics/Tags.tsx) to inline the
 * snippet below. Importing a value out of a client module into a server one is
 * fragile in ways that fail at build time or, worse, silently. This direction —
 * server-safe module, imported downhill by the client gate — always works.
 *
 * consent.ts imports it from here, so there is still exactly one definition.
 * Two copies of a storage key is a bug that presents as "consent silently
 * resets", which nobody would trace back to a string literal.
 */
export const CONSENT_STORAGE_KEY = "coco_consent_v1";

/**
 * Milliseconds the tag waits for a consent update before using the default.
 *
 * 500 is Google's own suggested value. It is a ceiling, not a delay: an
 * update that arrives sooner releases the tag immediately, and our update is
 * a synchronous localStorage read, so in practice nothing waits.
 */
const WAIT_FOR_UPDATE_MS = 500;

/**
 * Inline JS establishing `gtag` and the default consent state.
 *
 * Defines the `gtag` shim itself rather than assuming gtag.js has landed —
 * this runs first by design, so the function has to exist for the calls below
 * and for anything `track()` fires before the loader finishes. gtag.js reads
 * the same `dataLayer` array on arrival and replays what's queued, which is
 * why pushing to it early is safe.
 *
 * Reads OUR stored consent so a visitor who previously denied is not sent one
 * granted hit on every subsequent visit. Wrapped in try/catch because
 * localStorage throws outright in some privacy modes, and an exception here
 * would run before hydration and take the whole page down.
 *
 * Kept as a string, not a file, because it must be inlined into the document
 * — a separate request would defeat the ordering this exists to guarantee.
 */
export const CONSENT_DEFAULT_SNIPPET = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
(function(){
  var analytics = 'granted', marketing = 'granted';
  try {
    var raw = window.localStorage.getItem('${CONSENT_STORAGE_KEY}');
    if (raw) {
      var saved = JSON.parse(raw);
      if (saved && saved.analytics === false) analytics = 'denied';
      if (saved && saved.marketing === false) marketing = 'denied';
    }
  } catch (e) { /* blocked storage — keep the defaults */ }
  gtag('consent', 'default', {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    wait_for_update: ${WAIT_FOR_UPDATE_MS}
  });
})();
`.trim();

/**
 * Pushes a consent update after the visitor changes their mind.
 *
 * Called from the consent gate's change listener, so a banner added later
 * needs no analytics work: flipping the stored state propagates to Google
 * through here automatically.
 *
 * Deliberately does NOT re-fire anything. `track()` already owns replay, and
 * it drops conversion events rather than queueing them — replaying a `lead`
 * whose server-side CAPI counterpart fired earlier would land outside Meta's
 * dedupe window and count the same conversion twice.
 */
export function updateGoogleConsent(state: {
  analytics: boolean;
  marketing: boolean;
}) {
  if (typeof window === "undefined") return;

  window.gtag?.("consent", "update", {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
  });
}
