"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { hasDecided, onConsentChange, setConsent } from "@/lib/consent";

/**
 * The cookie notice. The last item on the pre-launch checklist, and the
 * largest compliance gap on the site until now.
 *
 * ---------------------------------------------------------------------------
 * WHAT WAS ACTUALLY MISSING
 * ---------------------------------------------------------------------------
 * Not the plumbing. `lib/consent.ts` already had the gate, `setConsent`
 * already wrote localStorage AND pushed all four Google Consent Mode signals,
 * and `track()` already checked it. Every piece worked and `setConsent` had
 * zero callers — so no visitor was ever asked, and the mitigation for that
 * ("don't send EU/UK traffic") lived only in a code comment.
 *
 * This is the missing UI, and nothing else. It calls one function.
 *
 * ---------------------------------------------------------------------------
 * IT IS AN OPT-OUT NOTICE, NOT A GDPR CONSENT DIALOG
 * ---------------------------------------------------------------------------
 * The default is granted (see LAUNCH POSTURE in `lib/consent.ts`), so a
 * visitor who never clicks is measured. That is the standard US posture and it
 * is what the copy below describes. It is NOT valid GDPR consent, which needs
 * the default denied before any tag fires.
 *
 * Making it GDPR-valid needs the region signal from `x-vercel-ip-country`, so
 * that the default flips to denied for EEA/UK only and the US arm costs
 * nothing. Until that ships, the targeting constraint stands.
 *
 * ---------------------------------------------------------------------------
 * NO DARK PATTERNS, AND THAT IS A DESIGN CONSTRAINT NOT A PREFERENCE
 * ---------------------------------------------------------------------------
 * The FTC's dark-patterns work names the exact thing a consent banner is
 * usually guilty of: a bright, filled Accept next to a grey text link that
 * says something like "manage preferences", three clicks deep.
 *
 * So both buttons here are the same component, the same size and the same
 * weight. Accept is NOT `btn-coral` — coral is this site's "click this"
 * colour, and using it would put a thumb on the scale. Declining is one tap,
 * from this bar, with no intermediate screen.
 *
 * ---------------------------------------------------------------------------
 * WHAT DECLINING DOES NOT DO, and why the copy is careful
 * ---------------------------------------------------------------------------
 * Microsoft Clarity records session replays and is installed inside the GTM
 * container, not by this codebase, so this gate cannot reach it. Declining
 * here does not stop it. That has to be fixed in GTM.
 *
 * Which is why the copy says "measure which pages work" and "show these guides
 * on social" — both true and both actually controlled by this button — and
 * says nothing about recording. A banner that claimed to stop something it
 * does not stop would be worse than no banner at all.
 *
 * ---------------------------------------------------------------------------
 * WHY useSyncExternalStore
 * ---------------------------------------------------------------------------
 * `react-hooks/set-state-in-effect` is an error in this repo, so the usual
 * "read localStorage in an effect, then setState" is not available — and it
 * would be the wrong shape anyway. `onConsentChange` is a real subscribe
 * function that `setConsent` already fires, so this is a genuine external
 * store: subscribe to it, read `hasDecided` as the snapshot, and clicking
 * either button re-renders this away with no state of its own.
 *
 * The snapshot is a boolean, so React compares by value and there is no
 * "getSnapshot should be cached" warning.
 */
export function ConsentBanner() {
  const decided = useSyncExternalStore(
    onConsentChange,
    hasDecided,
    /* Server snapshot: decided, so nothing renders into the HTML. */
    () => true,
  );

  if (decided) return null;

  return (
    <div
      /*
        A region, not a dialog. The site stays fully usable behind it — no
        focus trap, no scroll lock, nothing to escape from. Calling it a dialog
        would promise a modal that isn't here.

        z-50 puts it over FloatingCta's z-40. They can only collide on a first
        visit where someone scrolls past the hero before deciding, and in that
        window the notice being on top is the right precedence. Not worth
        coupling the two components over.
      */
      role="region"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-butter"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-small max-w-[62ch] text-ink">
          We use cookies to measure which pages work, and to show these guides
          to people on social. Say no and the site behaves exactly the same.{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            What we collect
          </Link>
          .
        </p>

        {/*
          Equal weight, equal size, side by side. `min-h-11` is 44px on both,
          the minimum comfortable tap target — a decline button that is harder
          to hit than accept is the same dark pattern in a different disguise.
        */}
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setConsent({ analytics: true, marketing: true })}
            className="btn-quiet min-h-11 flex-1 justify-center sm:flex-none"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => setConsent({ analytics: false, marketing: false })}
            className="btn-quiet min-h-11 flex-1 justify-center sm:flex-none"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
