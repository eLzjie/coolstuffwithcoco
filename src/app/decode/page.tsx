import type { Metadata } from "next";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Paw } from "@/components/brand/Icons";
import { GuessTheSignal } from "@/components/decode/GuessTheSignal";
import { CaptureSlot } from "@/components/forms/CaptureSlot";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { ViewContent } from "@/components/shared/ViewContent";
import { Faq } from "@/components/shared/Faq";
import { ReadMethod } from "@/components/decode/ReadMethod";
import { DECODE } from "@/lib/content/guides";
import { DECODE_FAQ } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: DECODE.title,
  description: DECODE.promise,
  alternates: { canonical: "/decode" },
  openGraph: {
    title: DECODE.title,
    description: DECODE.promise,
    url: "/decode",
  },
};

/**
 * Paid-traffic landing page. Email capture is the only action.
 *
 * Per the funnel plan: no top nav, no outbound links competing with the form.
 * The logo is not a link. Anchors within the page are fine. The only external
 * links on the page are the legal routes in the footer, which are required.
 */
export default function DecodePage() {
  return (
    <>
      <ViewContent magnet="decode" name={DECODE.title} />

      <main id="main">
        {/* ---- Hero: the locked ad angle, matched word for word ---- */}
        <section className="relative overflow-hidden bg-paper">
          {/* Non-clickable logo — no route out of here */}
          <div className="shell py-6">
            <BrandLockup />
          </div>

          <div className="shell grid items-center gap-6 pb-10 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-16">
            <div>
              <h1 className="t-hero max-w-[20ch] text-ink">{DECODE.hook}</h1>
              <p className="t-hero-echo mt-3 max-w-[20ch] text-ink/80">
                {DECODE.subhook}
              </p>
              <p className="t-lead mt-5 text-ink/75">{DECODE.promise}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#get" className="btn-coral">
                  Get the free guide
                </a>
                <a href="#signals" className="btn-quiet">
                  Try three first
                </a>
              </div>
            </div>

            <div className="mx-auto w-[min(88vw,32rem)]">
              <BrandImage
                slot="cocoHero"
                priority
                sizes="(max-width: 1024px) 88vw, 42vw"
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* ---- Signature moment ---- */}
        <GuessTheSignal />

        {/* ---- What's inside ---- */}
        <section className="section-pad bg-paper" aria-labelledby="inside-heading">
          <div className="shell">
            <h2 id="inside-heading" className="reveal-heading t-display-l max-w-[20ch] text-ink">
              What&apos;s in it
            </h2>
            <p className="t-lead mt-5 text-ink/75">{DECODE.intro}</p>

            <ul className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {DECODE.chapters.map((c) => (
                <Reveal as="li" key={c.title}>
                  <h3 className="t-h3 flex items-start gap-3">
                    <Paw aria-hidden className="mt-1 h-5 w-5 shrink-0 text-coral" />
                    {c.title}
                  </h3>
                  <p className="t-body mt-2 pl-8 text-ink/75">{c.blurb}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- The R.E.A.D. method: a named, quotable framework ---- */}
        <ReadMethod />

        {/*
          ---- Q&A ----
          Sits BEFORE the capture section on purpose. These are the questions
          people arrive already asking, so answering them earns the email
          rather than withholding until the form. The form is right below.
        */}
        <Faq
          items={DECODE_FAQ}
          heading="The questions everyone actually asks"
          intro="Straight answers, taken from the guide. No preamble."
          className="bg-paper-warm"
        />

        {/* ---- Who it's for ---- */}
        <section className="section-pad bg-butter" aria-labelledby="who-heading">
          <div className="shell">
            <h2 id="who-heading" className="reveal-heading t-display-l max-w-[18ch] text-ink">
              This is for you if
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {DECODE.audience.map((a) => (
                <li
                  key={a}
                  className="t-body rounded-xl border-2 border-ink/20 bg-paper/70 px-5 py-4"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Capture ---- */}
        <section id="get" className="section-pad scroll-mt-8 bg-bubblegum" aria-labelledby="get-heading">
          <div className="shell max-w-3xl">
            <h2 id="get-heading" className="t-display-l text-ink">
              Send me the guide
            </h2>
            {/*
              This said "One email address" until the form grew to four fields
              — copy promising less friction than the form actually asks for
              reads as a bait once the reader looks down. Only the name and
              email are required, so that's what it claims now.
            */}
            <p className="t-lead mt-4 text-ink/80">
              Your name and email. It arrives straight away.
            </p>
            <div className="mt-8 rounded-2xl border-2 border-ink/20 bg-paper p-6 sm:p-8">
              <CaptureSlot magnet="decode" redirectTo="/decode/thank-you" />
            </div>
          </div>
        </section>
      </main>

      <Footer bare />
    </>
  );
}
