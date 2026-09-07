"use client";

import Link from "next/link";
import { Speech, Cross } from "@/components/brand/Icons";
import { BrandImage } from "@/components/brand/BrandImage";
import { DECODE, VETBILL } from "@/lib/content/guides";
import { track } from "@/lib/analytics/track";

/**
 * The primary route out of the home page.
 *
 * Deliberately NOT two matching cards. The whole premise is that curiosity and
 * fear feel different, so the halves get different treatments: the Decode side
 * is loose and asks a question, the Vet Bill side is steady and states a fact.
 * They share a grid and nothing else.
 *
 * Each half already wears the wash of the page it leads to (Bubblegum for
 * /decode, Sky for /vetbill), so the click feels continuous rather than like
 * arriving somewhere new.
 *
 * Motion: the halves part slightly on entry, once — via CSS scroll-driven
 * animation, not Motion. These panels are the page's primary conversion route,
 * so they must never be invisible waiting on hydration. `reveal-left` /
 * `reveal-right` rest in the finished state; see globals.css.
 *
 * Still a client component only because the CTAs fire `view_content`.
 */
export function GuideSplit() {
  return (
    <section id="guides" className="scroll-mt-8" aria-labelledby="guides-heading">
      <div className="shell pb-10 pt-20">
        <h2 id="guides-heading" className="reveal-heading t-display-l max-w-[24ch] text-ink">
          Two guides. Both free. Pick the one that sounds like your week.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ---------------- Decode — curiosity, loose ---------------- */}
        <div
          className="reveal-left relative overflow-hidden bg-bubblegum px-[clamp(1.5rem,5vw,4rem)] py-16"
        >
          <Speech aria-hidden className="absolute -right-6 -top-6 h-32 w-32 text-ink/10" />

          <Speech aria-hidden className="mb-6 h-8 w-8 text-ink" />

          {/* Question-led: the hook is a question, set large and ragged */}
          <p className="t-h2 max-w-[20ch] text-ink">{DECODE.hook}</p>
          <p className="t-display-l mt-2 max-w-[16ch] text-ink">{DECODE.subhook}</p>

          <p className="t-body mt-6 max-w-[42ch] text-ink/80">{DECODE.promise}</p>

          {/*
            Stacks on mobile. Side by side at 390px left the pill about 150px
            wide, so the label wrapped to two lines and the button ballooned.
          */}
          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-6">
            <BrandImage
              slot="coverDecode"
              className="w-28 shrink-0 rotate-[-4deg] rounded-lg shadow-[0_6px_0_var(--color-ink)]"
              sizes="112px"
            />
            <Link
              href="/decode"
              className="btn-coral whitespace-nowrap"
              onClick={() =>
                track("view_content", {
                  lead_magnet: "decode",
                  content_name: DECODE.title,
                  from: "home_split",
                })
              }
            >
              Read her signals
            </Link>
          </div>
        </div>

        {/* ---------------- Vet Bill — protective, structured ---------------- */}
        <div
          className="reveal-right relative overflow-hidden bg-sky px-[clamp(1.5rem,5vw,4rem)] py-16"
        >
          <Cross aria-hidden className="absolute -bottom-8 -right-8 h-28 w-28 text-ink/10" />

          <Cross aria-hidden className="mb-6 h-8 w-8 text-ink" />

          {/* Statement-led, and set on a measured grid rather than ragged */}
          <p className="t-display-l max-w-[15ch] text-ink">{VETBILL.hook}</p>
          <p className="t-h3 mt-4 max-w-[26ch] text-ink/85">{VETBILL.subhook}</p>

          <dl className="mt-8 space-y-3 border-l-2 border-ink/25 pl-5">
            <div>
              <dt className="t-h3">Which signs mean go now</dt>
              <dd className="t-small text-ink/75">
                General categories, so you stop guessing at 2am.
              </dd>
            </div>
            <div>
              <dt className="t-h3">What it actually costs</dt>
              <dd className="t-small text-ink/75">
                Plain ranges, before you&apos;re at the counter.
              </dd>
            </div>
          </dl>

          {/*
            Stacks on mobile. Side by side at 390px left the pill about 150px
            wide, so the label wrapped to two lines and the button ballooned.
          */}
          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-6">
            <BrandImage
              slot="coverVetbill"
              className="w-28 shrink-0 rounded-lg shadow-[0_6px_0_var(--color-ink)]"
              sizes="112px"
            />
            <Link
              href="/vetbill"
              className="btn-coral whitespace-nowrap"
              onClick={() =>
                track("view_content", {
                  lead_magnet: "vetbill",
                  content_name: VETBILL.title,
                  from: "home_split",
                })
              }
            >
              Be ready for it
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
