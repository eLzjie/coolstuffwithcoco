import type { Metadata } from "next";
import { BookletMockup } from "@/components/brand/BookletMockup";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { CaptureSlot } from "@/components/forms/CaptureSlot";
import { Footer } from "@/components/layout/Footer";
import { ContentsStrip } from "@/components/shared/ContentsStrip";
import { FloatingCta } from "@/components/shared/FloatingCta";
import { ViewContent } from "@/components/shared/ViewContent";
import { CallNowTable } from "@/components/vetbill/CallNowTable";
import { CostChart } from "@/components/vetbill/CostChart";
import { VETBILL, VETBILL_STATS } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: VETBILL.title,
  description: VETBILL.promise,
  /* Noindex, no canonical, absent from sitemap.ts. See /decode/b for why. */
  robots: { index: false, follow: false },
};

/**
 * `/vetbill` — VARIANT B. Split-test arm against `/vetbill`.
 *
 * Same thesis as `/decode/b`, and that file carries the full reasoning:
 * structure changes, copy is held constant, form above the fold, Coco and the
 * product imagery below it, floating CTA in between.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DIFFERENT ABOUT THIS ONE
 * ---------------------------------------------------------------------------
 * `/vetbill` is the longer page — 1,803 words against decode's 1,352 — so
 * there is more to cut. But it is also the page with compliance obligations,
 * and those are not a length problem to be solved:
 *
 *  - `CallNowTable` stays, in full. It carries the veterinary disclaimer,
 *    which is the single thing making this page shippable without a vet's
 *    sign-off (see `docs/LEGAL-REVIEW.md` §4). Every "wait" row still ends by
 *    pointing at a phone call. Do not trim rows to hit a word target.
 *  - `CostChart` carries the "ranges, not quotes" panel and the four source
 *    links. Also not optional — a visitor quoting our numbers at a clinic
 *    counter has been misled by us.
 *
 * What did go: the FAQ (573 words), the chapter blurbs, `Preventable`, and the
 * "who it's for" list. The cost `<dl>` becomes a chart.
 *
 * MEASURED, so the number isn't argued about later:
 *
 *     /vetbill      1,727 words
 *     /vetbill/b      708 words   (59% cut)
 *       triage table + vet disclaimer   303   43%
 *       ranges caveat + 4 sources        90   13%
 *       -------------------------------------------
 *       compliance                      393   56%
 *       everything else                 315
 *
 * So this page misses the ~600-word target and should. Strip the compliance
 * copy out and what's left is 315 words — within a few dozen of `/decode/b`'s
 * 294, which is the like-for-like comparison. Eli's note was about prose, and
 * none of those 393 words is prose.
 *
 * ---------------------------------------------------------------------------
 * TONE, which matters more here than on decode
 * ---------------------------------------------------------------------------
 * The brief's rule: if a headline could appear in an insurance ad, rewrite it.
 * Putting a form above the fold on a page about emergency vet bills risks
 * exactly that, so the hero still leads with `VETBILL.subhook` — "you can be
 * ready for this one" — before it asks for anything. The three numbers stay
 * below the fold rather than above it; leading with "$1,035" would be the
 * insurance ad.
 */
export default function VetBillVariantB() {
  return (
    <>
      <ViewContent magnet="vetbill" name={VETBILL.title} />

      <main id="main">
        {/* ================= ABOVE THE FOLD ================= */}
        <section id="get" className="scroll-mt-4 bg-paper">
          <div className="shell py-4">
            <BrandLockup />
          </div>

          <div className="shell pb-10">
            <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
              <div>
                <div className="flex items-start gap-4">
                  <div>
                    <h1 className="t-hero-compact max-w-[18ch] text-ink">
                      {VETBILL.hook}
                    </h1>
                    <p className="t-hero-echo mt-2 max-w-[18ch] text-ink/80">
                      {VETBILL.subhook}
                    </p>
                  </div>

                  <BookletMockup
                    slot="coverVetbill"
                    lean="right"
                    priority
                    sizes="(max-width: 640px) 30vw, 12rem"
                    className="w-24 shrink-0 sm:w-36 lg:hidden"
                  />
                </div>

                <div className="mt-6 max-w-xl rounded-2xl border-2 border-ink bg-sky p-5 sm:p-6">
                  {/* See /decode/b for why there's no heading on this card. */}
                  <p className="t-small font-semibold text-ink">
                    Free. Arrives by email straight away.
                  </p>
                  <CaptureSlot
                    magnet="vetbill"
                    redirectTo="/vetbill/thank-you"
                    className="mt-4"
                  />
                </div>
              </div>

              <BookletMockup
                slot="coverVetbill"
                lean="right"
                sizes="20rem"
                className="mx-auto hidden w-80 lg:block"
              />
            </div>
          </div>
        </section>

        {/* ================= BELOW THE FOLD ================= */}

        {/*
          The three numbers. Statements about OWNERS, not about dogs — nobody
          believes the emergency will be theirs, so the useful fact is how many
          people were equally sure and then had minutes to decide.
        */}
        <section
          className="border-y-2 border-ink bg-butter py-8"
          aria-label="Emergency preparedness in numbers"
        >
          <div className="shell">
            <dl className="grid gap-6 text-center sm:grid-cols-3 sm:text-left">
              {VETBILL_STATS.map((s) => (
                <div key={s.label}>
                  <dt className="t-display-l leading-none text-ink">
                    {s.figure}
                  </dt>
                  <dd className="t-small mt-2 text-ink/80">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Coco, moved down out of the hero — Chase's instruction. */}
        <section className="bg-paper py-10" aria-label="Coco">
          <div className="shell">
            <div className="mx-auto w-[min(88vw,26rem)]">
              <BrandImage
                slot="cocoHero"
                sizes="(max-width: 1024px) 88vw, 26rem"
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/*
          The triage table. Compliance-load-bearing — see the note at the top
          of this file. Mint rather than sky, since sky is now the capture
          surface above and two sky sections would read as the same section.
        */}
        <CallNowTable wash="bg-mint" />

        {/* The cost chart, replacing the control's 233-word <dl>. */}
        <section className="section-pad bg-paper" aria-labelledby="cost-heading">
          <div className="shell max-w-3xl">
            <h2
              id="cost-heading"
              className="reveal-heading t-display-l max-w-[22ch] text-ink"
            >
              What these nights actually cost
            </h2>
            <p className="t-lead mt-4 text-ink-muted">
              Ranges, so the number at the counter isn&apos;t the first one
              you&apos;ve seen.
            </p>
            <CostChart />
          </div>
        </section>

        {/* Contents instead of chapter blurbs. ~190 fewer words. */}
        <section
          className="section-pad bg-paper-warm"
          aria-labelledby="contents-heading"
        >
          <div className="shell max-w-3xl">
            <h2
              id="contents-heading"
              className="reveal-heading t-display-l text-ink"
            >
              What&apos;s in it
            </h2>
            <ContentsStrip chapters={VETBILL.chapters} className="mt-8" />
          </div>
        </section>

        {/* ---- Repeat form ---- */}
        <section
          id="get-repeat"
          className="section-pad scroll-mt-8 bg-sky"
          aria-labelledby="get-repeat-heading"
        >
          <div className="shell max-w-2xl">
            <h2
              id="get-repeat-heading"
              className="t-display-l max-w-[18ch] text-ink"
            >
              Send me the guide
            </h2>
            <p className="t-lead mt-4 text-ink/80">
              Your name and email. That&apos;s it.
            </p>
            <div className="mt-8 rounded-2xl border-2 border-ink/20 bg-paper p-6 sm:p-8">
              <CaptureSlot magnet="vetbill" redirectTo="/vetbill/thank-you" />
            </div>
          </div>
        </section>
      </main>

      <Footer bare />

      {/*
        Watches both forms and the footer. The footer case matters more on this
        page than anywhere else on the site: the hotline numbers are in it, and
        a visitor here may well be the person dialling.
      */}
      <FloatingCta href="#get-repeat" watch="#get, #get-repeat" />
    </>
  );
}
