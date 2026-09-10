import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { GuideSplit } from "@/components/home/GuideSplit";
import { AboutCoco } from "@/components/home/AboutCoco";
import { Statement } from "@/components/home/Statement";
import { SeenCoco } from "@/components/home/SeenCoco";
import { Library } from "@/components/home/Library";
import { Community } from "@/components/home/Community";
import { InboxPreview } from "@/components/home/InboxPreview";
import { StickyNav } from "@/components/home/StickyNav";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: `${SITE_NAME} — read your dog better`,
  description:
    "Coco's free guides for dog owners: read her body language, and know what a real emergency costs before you're standing at the counter.",
  /*
    NOINDEX, and no canonical — the same call as `/decode/b` and for the same
    reason. Two near-identical home pages competing for the same brand queries
    is how you lose both, and a canonical pointing at `/` invites Google to
    fold them together and serve whichever it prefers, which would quietly
    break the split. Excluded from `sitemap.ts` too.

    The consequence worth stating: THIS CAN NEVER BE THE SHARED LINK. Chase's
    "sharing for this link should be better" is about `/`, which is the page
    that ranks and the one that gets pasted into a message. The share card
    work belongs there; this page is a paid-traffic destination only.
  */
  robots: { index: false, follow: false },
};

/**
 * `/` — VARIANT B. Split-test arm against the home page.
 *
 * ===========================================================================
 * WHY THIS EXISTS, AND IT IS NOT REALLY A HOME-PAGE TEST
 * ===========================================================================
 * Eli, 2026-09-10: "we're not getting any traffic with the 2nd pages."
 *
 * That was the whole problem. `/decode/b` and `/vetbill/b` had been live for
 * days with almost nothing arriving, because every route into a guide goes
 * through the home page and every button there points at the A arm. The B
 * pages could not win a test they were never entered in.
 *
 * So this page's job is plumbing: an entry point whose guide buttons go to
 * `/decode/b` and `/vetbill/b`. It is a feeder, not the experiment. The
 * readable comparison stays the one at guide level, where A and B differ only
 * in structure.
 *
 * Be honest about what that means for reading the numbers: this arm changes
 * the hero copy AND the guide destinations AND the order of the two halves.
 * If `/b` outperforms `/`, it will not say which of the three did it. That is
 * an acceptable trade here because nothing is being decided at the home-page
 * level — the decision is which guide page converts better, and that one is
 * still clean.
 *
 * ---------------------------------------------------------------------------
 * WHAT DIFFERS FROM `/`
 * ---------------------------------------------------------------------------
 *  1. HERO COPY. `arm="b"` swaps in Coco's introduction as the headline
 *     instead of the insight ("Your dog is telling you something"). The 3D
 *     scene, the motion and the LCP handling are byte-identical — see
 *     `HERO_COPY` in Hero.tsx for why that matters.
 *  2. GUIDE DESTINATIONS. `/decode/b`, `/vetbill/b`.
 *  3. ORDER. Vet Bill first. Chase asked for it, and on cold paid traffic the
 *     bill is probably the stronger hook — but note it inverts the emotional
 *     order GuideSplit's own docblock argues for, so it is a real change and
 *     not a neutral one.
 *
 * Everything from `AboutCoco` down is identical to `/`, deliberately. Holding
 * the rest constant is what keeps the diff small enough to reason about.
 *
 * ---------------------------------------------------------------------------
 * THE NAV IS THE ABOVE-FOLD CTA, AND THERE IS NO FloatingCta
 * ---------------------------------------------------------------------------
 * `/decode/b` uses `FloatingCta` because it has exactly one ask. A home page
 * has two guides, so a single floating button would have to silently pick one
 * — and "which one" is the decision this page exists to help with.
 *
 * `StickyNav` already solves it and needs no changes: the Hero renders the bar
 * at `#topbar`, the sticky copy takes over when that scrolls away, and its
 * button goes to `#guides` where both halves sit side by side. That is the
 * route that is reachable without scrolling; the guide CTAs themselves are
 * below the fold on both arms, because the hero is `min-h-[78svh]`.
 *
 * ---------------------------------------------------------------------------
 * NO Organization JSON-LD
 * ---------------------------------------------------------------------------
 * `/` carries it. Emitting the same Organization block from a second,
 * noindexed URL adds nothing a crawler can use and gives it two candidate
 * home pages for one entity.
 *
 * Server component apart from the pieces that were already client components.
 */
export default function HomeVariantB() {
  return (
    <>
      <StickyNav />

      <main id="main">
        <Hero arm="b" />
        <GuideSplit arm="b" />
        <AboutCoco />
        <Statement />
        <SeenCoco />
        <Library />
        <Community />
        <InboxPreview />
      </main>

      <Footer />
    </>
  );
}
