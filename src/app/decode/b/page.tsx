import type { Metadata } from "next";
import { BookletMockup } from "@/components/brand/BookletMockup";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { GuessTheSignal } from "@/components/decode/GuessTheSignal";
import { SignalGrid } from "@/components/decode/SignalGrid";
import { CaptureSlot } from "@/components/forms/CaptureSlot";
import { Footer } from "@/components/layout/Footer";
import { ContentsStrip } from "@/components/shared/ContentsStrip";
import { FloatingCta } from "@/components/shared/FloatingCta";
import { ViewContent } from "@/components/shared/ViewContent";
import { DECODE } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: DECODE.title,
  description: DECODE.promise,
  /*
    NOINDEX, and no canonical.

    Four near-identical pages competing for the same queries is the classic way
    to lose all four. A canonical pointing at `/decode` would be the other
    standard answer, but it invites Google to fold the two together and serve
    whichever it prefers — which would quietly break the split test. Excluded
    from `sitemap.ts` for the same reason.

    Paid traffic doesn't need indexing. When a winner is picked, the winner
    becomes `/decode` and this file goes away.
  */
  robots: { index: false, follow: false },
};

/**
 * `/decode` — VARIANT B. Split-test arm against `/decode`.
 *
 * ===========================================================================
 * WHAT IS BEING TESTED
 * ===========================================================================
 * Structure, and only structure.
 *
 * A is the page we built: 1,352 words, FAQ-rich, SEO-optimised, form last at
 * roughly 5,000px down. B is Chase's brief, near-verbatim: "everything should
 * be above the fold, the email submit, everything", "headline, hero, booklet
 * picture, email, CTA button", Coco and product imagery below the fold, and a
 * floating CTA once you're past it.
 *
 * ---------------------------------------------------------------------------
 * THE HEADLINE IS DELIBERATELY IDENTICAL, and this is a change from the plan
 * ---------------------------------------------------------------------------
 * The plan called for a new pain-point headline here. It shouldn't have.
 *
 * `DECODE.hook` is the locked ad angle — the words the media buyer is bidding
 * on. Changing copy AND structure in the same arm produces a result nobody can
 * act on: if B wins, was it the structure Chase asked for, or a headline
 * nobody agreed to? Holding the copy constant makes the answer readable, and
 * it is also the cheaper thing to be wrong about.
 *
 * So every word on this page is either lifted from `guides.ts` or is
 * structural microcopy. The FAQ is the one real content difference — 589 words
 * and our main answer-engine asset — and it is absent here rather than
 * rewritten, because "does the FAQ earn its length on paid traffic" is exactly
 * the question worth asking.
 *
 * ---------------------------------------------------------------------------
 * ABOVE-FOLD BUDGET, 390×844
 * ---------------------------------------------------------------------------
 * Roughly 745px of usable height once browser chrome is gone. Two things buy
 * the room: ONE button instead of the control's pair (which wraps to two rows
 * at 390px and costs ~126px), and dropping the hero's third paragraph.
 *
 * The consent line is inside that budget and stays there. The build spec
 * requires it visible before submit, so if this ever overflows, cut the
 * subhook — never the consent line.
 *
 * ---------------------------------------------------------------------------
 * LESS PINK
 * ---------------------------------------------------------------------------
 * Chase: "it's somewhat feminine, I think we should try to speak to both
 * audiences." `/decode` runs bubblegum on both its hero and its capture
 * section. Here the capture surfaces are butter and the quiz keeps sky, so
 * bubblegum appears nowhere. The wash is hardcoded per section rather than
 * themed — `guides.ts` has an unread `wash` field, and building a theming
 * system for two pages would be more machinery than the test is worth.
 *
 * ---------------------------------------------------------------------------
 * WIRING — all of it constrained by existing behaviour
 * ---------------------------------------------------------------------------
 *  - `magnet="decode"`, NOT a new LeadMagnet value. `lib/leadMagnet.ts` is a
 *    closed union, the API 400s anything outside it, and `tagsFor()` emits the
 *    tag that IS the GHL delivery trigger. A new value would mean a new
 *    workflow before this page could deliver anything.
 *  - `redirectTo="/decode/thank-you"` — the existing page. Forking it would
 *    fork the delivery copy and the waitlist offer along with it.
 *  - Attribution needs nothing: `utm.ts` records `window.location.pathname` at
 *    first touch, so `/decode/b` lands in the contact's `landing_page` field
 *    on its own. (Also why a middleware-rewrite test was rejected — under a
 *    rewrite the pathname stays `/decode` for both arms and attribution
 *    silently collapses into one bucket.)
 *  - `page_path` was added to the `lead` event in `CaptureForm` so GA4 can
 *    tell the arms apart too. Both arms send `magnet="decode"`, so without it
 *    `generate_lead` is unreadable.
 */
export default function DecodeVariantB() {
  return (
    <>
      <ViewContent magnet="decode" name={DECODE.title} />

      <main id="main">
        {/* ================= ABOVE THE FOLD ================= */}
        <section id="get" className="scroll-mt-4 bg-butter">
          {/* py-4, down from the control's py-6. Buys 16px of the budget. */}
          <div className="shell py-4">
            <BrandLockup />
          </div>

          <div className="shell pb-10">
            <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-12">
              <div>
                {/*
                  Headline and booklet side by side even at 390px — a cover
                  beside a title is how a book is listed everywhere, so it
                  needs no explaining and costs no vertical space that the
                  headline wasn't already using.
                */}
                <div className="flex items-start gap-4">
                  <div>
                    <h1 className="t-hero-compact max-w-[18ch] text-ink">
                      {DECODE.hook}
                    </h1>
                    <p className="t-hero-echo-compact mt-2 max-w-[22ch] text-ink/80">
                      {DECODE.subhook}
                    </p>
                  </div>

                  <BookletMockup
                    slot="coverDecode"
                    lean="right"
                    priority
                    sizes="(max-width: 640px) 30vw, 12rem"
                    className="w-24 shrink-0 sm:w-36 lg:hidden"
                  />
                </div>

                {/*
                  The form, above the fold. This is the whole point of the
                  variant. `id="get"` is on the section so the floating CTA
                  and the repeat form both return here.
                */}
                <div className="mt-6 max-w-xl rounded-2xl border-2 border-ink bg-paper p-5 sm:p-6">
                  {/*
                    No heading on this card, deliberately. It read "Send me the
                    guide" — the same five words as the button directly below
                    it — and cost 28px of a 745px budget to say them twice. The
                    field labels name what's being asked for and the button
                    names the action, so the heading was carrying nothing.

                    This line stays because "free" appears nowhere else above
                    the fold, and it is the strongest fact we have.
                  */}
                  <p className="t-small font-semibold text-ink">
                    Free. Arrives by email straight away.
                  </p>
                  <CaptureSlot
                    magnet="decode"
                    redirectTo="/decode/thank-you"
                    className="mt-4"
                  />
                </div>
              </div>

              {/*
                Desktop gets the booklet full size in its own column. Two
                renders rather than one repositioned, because the mobile
                thumbnail and a 20rem cover want different `sizes` hints and
                only one of them is ever in the DOM's critical path.
              */}
              <BookletMockup
                slot="coverDecode"
                lean="right"
                sizes="20rem"
                className="mx-auto hidden w-80 lg:block"
              />
            </div>
          </div>
        </section>

        {/* ================= BELOW THE FOLD ================= */}

        {/*
          Coco, moved down from the hero — Chase's instruction. She's the brand
          and she's why this doesn't read like a content farm, but she is not
          what a visitor needs in the first 745px.
        */}
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
          The quiz. Chase: "definitely onto something with the signal stuff...
          I like the little signal thing." Sky rather than bubblegum.
        */}
        <GuessTheSignal wash="bg-sky" />

        {/* The cheat sheet — the product, shown rather than described. */}
        <section
          className="section-pad bg-paper"
          aria-labelledby="grid-heading"
        >
          <div className="shell">
            <h2
              id="grid-heading"
              className="reveal-heading t-display-l max-w-[20ch] text-ink"
            >
              Eighteen signals, one page
            </h2>
            <p className="t-lead mt-4 text-ink-muted">
              This is the card the guide tells you to stick on the fridge.
            </p>
            <SignalGrid className="mt-8" />
          </div>
        </section>

        {/* Contents instead of chapter blurbs. ~180 fewer words. */}
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
            <ContentsStrip chapters={DECODE.chapters} className="mt-8" />
          </div>
        </section>

        {/* ---- Repeat form ---- */}
        <section
          id="get-repeat"
          className="section-pad scroll-mt-8 bg-butter"
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
              <CaptureSlot magnet="decode" redirectTo="/decode/thank-you" />
            </div>
          </div>
        </section>
      </main>

      <Footer bare />

      {/*
        Watches `#get` — the above-fold form. So the bar appears the moment the
        hero scrolls away and hides again at the footer, where the hotline
        numbers are.
      */}
      <FloatingCta href="#get-repeat" watch="#get, #get-repeat" />
    </>
  );
}
