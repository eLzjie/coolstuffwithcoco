/**
 * Google tag identifiers.
 *
 * ---------------------------------------------------------------------------
 * THESE ARE NOT SECRETS
 * ---------------------------------------------------------------------------
 * A GA4 measurement id and a GTM container id are both visible in the page
 * source of every site that uses them — that's how the tags work. They are
 * correctly behind `NEXT_PUBLIC_`, and nothing is leaked by committing them.
 *
 * The production values, recorded here so nobody has to go hunting:
 *
 *   NEXT_PUBLIC_GA4_ID   G-XM24N84PTY
 *   NEXT_PUBLIC_GTM_ID   GTM-TR8ZF32W
 *
 * ---------------------------------------------------------------------------
 * WHY ENV VARS RATHER THAN CONSTANTS
 * ---------------------------------------------------------------------------
 * Not for secrecy — for keeping junk out of the property. There is one GA4
 * property, and every `npm run dev`, every Vercel preview build and every
 * `npm run test:api` run would otherwise report into the same reports the ad
 * spend is judged on. Test traffic in a conversion report is worse than no
 * report, because it looks real.
 *
 * So: set these in Vercel's PRODUCTION environment only, and leave them unset
 * locally and on preview/staging. Unset means the tags don't render at all —
 * see components/analytics/Tags.tsx — and `track()` stays a no-op that still
 * logs under NEXT_PUBLIC_ANALYTICS_DEBUG=1, so the event vocabulary remains
 * verifiable without polluting anything.
 *
 * A measurement id can't be validated beyond its shape, and a typo'd one
 * fails silently — collecting into a property that doesn't exist. The prefix
 * check below at least catches the common paste error of swapping the two.
 */

function readId(name: string, prefix: string): string {
  const raw = process.env[name];
  if (!raw) return "";

  const value = raw.trim();
  if (!value.startsWith(prefix)) {
    /*
      Warn rather than throw. A misconfigured analytics id must never take the
      site down — the pages and the capture forms are the product, and a build
      that fails over a reporting tag is a self-inflicted outage.
    */
    console.warn(
      `[analytics] ${name} is "${value}", which doesn't start with "${prefix}". ` +
        `GA4 ids look like G-XXXXXXXXXX and GTM ids like GTM-XXXXXXX — ` +
        `these two are easy to paste into the wrong variable. Tag not loaded.`,
    );
    return "";
  }

  return value;
}

/** GA4 measurement id, e.g. `G-XM24N84PTY`. Empty when unset. */
export const GA4_ID = readId("NEXT_PUBLIC_GA4_ID", "G-");

/** GTM container id, e.g. `GTM-TR8ZF32W`. Empty when unset. */
export const GTM_ID = readId("NEXT_PUBLIC_GTM_ID", "GTM-");
