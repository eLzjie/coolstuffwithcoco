import type { Metadata } from "next";
import { BrandImage } from "@/components/brand/BrandImage";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Cross, Heart } from "@/components/brand/Icons";
import { CallNowTable } from "@/components/vetbill/CallNowTable";
import { CaptureSlot } from "@/components/forms/CaptureSlot";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { ViewContent } from "@/components/shared/ViewContent";
import { BRAND } from "@/lib/brand/manifest";
import { COSTS, VETBILL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: VETBILL.title,
  description: VETBILL.promise,
  alternates: { canonical: "/vetbill" },
  openGraph: {
    title: VETBILL.title,
    description: VETBILL.promise,
    url: "/vetbill",
    images: BRAND.ogVetbill.ready ? [`/brand/${BRAND.ogVetbill.file}`] : undefined,
  },
};

/**
 * Paid-traffic landing page. Protective, never predatory.
 *
 * Tone rule from the brief: if a headline could appear in an insurance ad,
 * rewrite it. So the hero leads with reassurance ("you can be ready for this
 * one") rather than the bill. Coco is what keeps this from reading as a scare
 * funnel, so she's present in the copy throughout — not just the photo.
 *
 * No nav, no outbound links except the required legal routes in the footer.
 */
export default function VetBillPage() {
  return (
    <>
      <ViewContent magnet="vetbill" name={VETBILL.title} />

      <main id="main">
        {/* ---- Hero: reassuring, not scary ---- */}
        <section className="relative overflow-hidden bg-paper">
          <div className="shell py-6">
            <BrandLockup />
          </div>

          <div className="shell grid items-center gap-6 pb-10 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pb-16">
            <div>
              <h1 className="t-hero max-w-[20ch] text-ink">{VETBILL.hook}</h1>
              <p className="t-hero-echo mt-3 max-w-[20ch] text-ink/80">
                {VETBILL.subhook}
              </p>
              <p className="t-lead mt-5 text-ink/75">{VETBILL.promise}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#get" className="btn-coral">
                  Get the free guide
                </a>
                <a href="#table" className="btn-quiet">
                  See the table
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
        <CallNowTable />

        {/* ---- Cost transparency: the value here IS the transparency ---- */}
        <section className="section-pad bg-paper" aria-labelledby="cost-heading">
          <div className="shell">
            <h2 id="cost-heading" className="reveal-heading t-display-l max-w-[22ch] text-ink">
              What these nights actually cost
            </h2>
            <p className="t-lead mt-5 text-ink/75">
              Rough ranges, so the number at the counter isn&apos;t the first
              one you&apos;ve seen.
            </p>

            <dl className="mt-10 max-w-3xl divide-y-2 divide-ink/10 border-y-2 border-ink/20">
              {COSTS.map((c) => (
                <div
                  key={c.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5"
                >
                  <dt className="t-h3 max-w-[38ch]">{c.label}</dt>
                  <dd className="t-h3 text-ink/75">{c.range}</dd>
                </div>
              ))}
            </dl>

            <p className="t-small mt-6 max-w-[60ch] rounded-lg border-2 border-dashed border-ink/40 p-4 text-ink/80">
              <strong className="font-semibold">TODO(Eli): verify source</strong>{" "}
              — every figure above is a placeholder, deliberately left as a TODO
              rather than filled with a plausible-looking number. Costs vary
              enormously by country, city and clinic, and an invented range here
              would be worse than a blank. The vet-cost survey figures you
              mentioned are better sourced but still need your sign-off.
            </p>
          </div>
        </section>

        {/* ---- What's inside ---- */}
        <section className="section-pad bg-sky" aria-labelledby="inside-heading">
          <div className="shell">
            <h2 id="inside-heading" className="reveal-heading t-display-l max-w-[20ch] text-ink">
              What&apos;s in it
            </h2>
            <p className="t-lead mt-5 text-ink/80">{VETBILL.intro}</p>

            <ul className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {VETBILL.chapters.map((c) => (
                <Reveal as="li" key={c.title}>
                  <h3 className="t-h3 flex items-start gap-3">
                    <Cross aria-hidden className="mt-1 h-5 w-5 shrink-0 text-coral" />
                    {c.title}
                  </h3>
                  <p className="t-body mt-2 pl-8 text-ink/75">{c.blurb}</p>
                </Reveal>
              ))}
            </ul>

            {/*
              Compliance rule 4 — pet insurance is regulated and we're not
              licensed to advise on it. The "paying for it" chapter is described
              as informational only, and that constraint is restated here so
              nobody edits it into a recommendation later.
            */}
            <p className="t-small mt-10 max-w-[62ch] rounded-lg border-2 border-ink/25 bg-paper/70 p-4 text-ink/80">
              On the money chapter: it describes what options exist and nothing
              more. We&apos;re not licensed to advise on pet insurance and we
              don&apos;t recommend products. Read it as information, then talk to
              someone qualified.
            </p>
          </div>
        </section>

        {/* ---- Who it's for ---- */}
        <section className="section-pad bg-paper" aria-labelledby="who-heading">
          <div className="shell">
            <Heart aria-hidden className="mb-6 h-8 w-8 text-coral" />
            <h2 id="who-heading" className="reveal-heading t-display-l max-w-[18ch] text-ink">
              This is for you if
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {VETBILL.audience.map((a) => (
                <li
                  key={a}
                  className="t-body rounded-xl border-2 border-ink/20 bg-mint/60 px-5 py-4"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Capture ---- */}
        <section id="get" className="section-pad scroll-mt-8 bg-sky" aria-labelledby="get-heading">
          <div className="shell max-w-3xl">
            <h2 id="get-heading" className="t-display-l text-ink">
              Send me the guide
            </h2>
            <p className="t-lead mt-4 text-ink/80">
              One email address. Then go and fill in the contacts page while
              nothing is wrong.
            </p>
            <div className="mt-8 rounded-2xl border-2 border-ink/20 bg-paper p-6 sm:p-8">
              <CaptureSlot magnet="vetbill" redirectTo="/vetbill/thank-you" />
            </div>
          </div>
        </section>
      </main>

      <Footer bare />
    </>
  );
}
