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
 * Microsoft Clarity (yff7ashiza) is deliberately NOT here — it is installed
 * inside the GTM container, not by this codebase. See the note at the foot of
 * this file.
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

  /*
    Strip surrounding quotes as well as whitespace.

    `.env` files don't need quotes, but people add them out of habit and some
    dashboards keep them as part of the value — so NEXT_PUBLIC_GA4_ID can
    arrive as `"G-XM24N84PTY"` with the quotes included. That fails the prefix
    check below and the tag silently never loads, which is a miserable thing to
    debug because the value LOOKS right everywhere you inspect it.

    Cheap to tolerate, so tolerate it.
  */
  const value = raw.trim().replace(/^['"]|['"]$/g, "").trim();

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

/*
  ---------------------------------------------------------------------------
  DIAGNOSING "the tag isn't on the live site"
  ---------------------------------------------------------------------------
  This happened once and cost real time, so here is the checklist in the order
  that actually resolves it. The symptom is zero occurrences of the id in the
  production HTML while the same commit renders it fine locally.

  Confirm with:
      BASE=https://www.coolstuffwithcoco.com npm run check:tags

  1. IS THE VARIABLE IN THE PRODUCTION ENVIRONMENT, not just .env.local?
     .env.local is gitignored and never reaches Vercel. Production values come
     only from the dashboard, and a variable scoped to Preview does nothing on
     the production domain. Note that a DIFFERENT NEXT_PUBLIC_ var arriving
     correctly proves the plumbing works but proves nothing about this one —
     they are set independently.

  2. DID THE BUILD RUN AFTER THE VARIABLE WAS SAVED?
     `NEXT_PUBLIC_*` is inlined into the bundle at BUILD time, not read at
     runtime. Saving the variable and then doing nothing changes nothing;
     saving it while a build is already running changes nothing either. It
     needs a fresh deploy afterwards, every time the value changes.

  3. IS THE NAME EXACT?
     NEXT_PUBLIC_GA4_ID and NEXT_PUBLIC_GTM_ID. Not GA_ID, not
     NEXT_PUBLIC_GA_ID, not GOOGLE_ANALYTICS_ID. A near-miss is indistinguishable
     from unset.

  4. IS THE VALUE THE RIGHT SHAPE?
     G-XXXXXXXXXX and GTM-XXXXXXX. The two are easy to swap. Quotes and
     whitespace are tolerated (see readId), a pasted <script> snippet is not.
     A rejected value logs a warning in the SERVER logs — Vercel → the
     deployment → Functions — which is worth checking, because a rejected
     value and an absent one look identical in the HTML.
*/

/*
  ---------------------------------------------------------------------------
  MICROSOFT CLARITY IS INSTALLED IN GTM, NOT HERE — AND THAT WAS MEASURED
  ---------------------------------------------------------------------------
  Clarity (project yff7ashiza) was added to the codebase on 2026-09-09 and then
  removed the same day, because a browser check showed it was ALREADY live:

      https://www.clarity.ms/tag/yff7ashiza?ref=gtm

  That `?ref=gtm` is the giveaway — the tag is inside container GTM-TR8ZF32W.
  Two installs on one page means two recorders, doubled sessions and doubled
  data, which is the same failure mode as putting a GA4 tag in GTM while gtag.js
  is loaded directly. So the code install lost, being the redundant one.

  DO NOT re-add it here without first removing the GTM tag. If you ever want it
  in code instead — the argument for it is that a diff can see it, and that it
  could then be gated on our own consent state — remove the container tag in
  the same change.

  ONE THING TO KNOW, and it is not a small one: the GTM copy is NOT gated on
  this site consent state. It loaded on a fresh page view with
  `coco_consent_v1` set to analytics:false. A session recorder running against
  a visitor who declined is the least comfortable version of the
  default-granted posture documented in lib/consent.ts.

  Nothing to fix today, since no banner exists and consent is assumed anyway.
  But when the banner is built, gating Clarity belongs in that job — in GTM,
  via Consent Mode or a trigger condition. It is written into
  docs/LEGAL-REVIEW.md as part of that task.
*/
