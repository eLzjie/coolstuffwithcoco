"use client";

import Image from "next/image";
import { Parallax } from "@/components/motion/Parallax";
import community from "@/lib/content/community.json";
import { Ambient } from "@/components/motion/Ambient";

/**
 * PROPOSED ADDITION (§4.1) — "Where you've seen Coco".
 *
 * Rationale: the brief says Coco's repetition across emails, ads and videos IS
 * the trust mechanism. A site can't assert that credibly — it has to show it.
 * Someone arriving from Instagram sees the same face they've been served for a
 * year, which is the cheapest trust available. It also gets stronger every time
 * the media buyer ships new creative, which no other section does.
 *
 * Stills drift on parallax at alternating depths, on mobile as well as desktop
 * — mobile is the primary view here, so the motion has to be present there.
 */
export function SeenCoco() {
  const stills = community.adStills;

  return (
    <section className="section-pad relative isolate overflow-hidden bg-butter" aria-labelledby="seen-heading">
      <Ambient variant="balls" />
      <div className="shell">
        <h2 id="seen-heading" className="reveal-heading t-display-l max-w-[22ch] text-ink">
          You&apos;ve probably met her already.
        </h2>
        <p className="t-lead mt-5 text-ink/75">
          Same dog in the ads, the videos and the emails. That&apos;s on purpose
          — you should know who&apos;s talking to you.
        </p>

        <ul className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stills.map((s, i) => (
            <li key={s.file}>
              {/* Alternating drift depth reads as a loose scatter, not a row */}
              <Parallax speed={i % 2 === 0 ? 0.07 : -0.05}>
                <figure
                  className="overflow-hidden rounded-2xl border-2 border-ink/15"
                  style={{ rotate: `${i % 2 === 0 ? -1.6 : 1.4}deg` }}
                >
                  {/* 4:5 box, reserved up front so CLS stays 0 either way */}
                  <div className="relative aspect-4/5">
                    {s.ready ? (
                      <Image
                        src={`/brand/community/${s.file}`}
                        alt={s.alt}
                        width={s.w}
                        height={s.h}
                        sizes="(max-width: 1024px) 45vw, 22vw"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="ph absolute inset-0"
                        role="img"
                        aria-label={`Placeholder: ${s.alt}`}
                      >
                        <span>
                          <strong className="block font-semibold">Placeholder</strong>
                          {s.alt}
                          <span className="mt-1 block opacity-60">
                            /brand/community/{s.file}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </figure>
              </Parallax>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
