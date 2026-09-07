"use client";

import Image from "next/image";
import { Parallax } from "@/components/motion/Parallax";
import { Heart } from "@/components/brand/Icons";
import { Ambient } from "@/components/motion/Ambient";
import { IG_HANDLE, IG_URL } from "@/lib/content/guides";
import community from "@/lib/content/community.json";

/**
 * Social proof — the Instagram grid.
 *
 * Reads from lib/content/community.json rather than the Graph API, because IG
 * feed embedding needs a token and a business account and that isn't wired yet.
 * The component's data shape already matches what the API returns, so
 * upgrading it later is a loader swap, not a redesign.
 *
 * TODO(Eli): confirm the IG business account + Graph API token, then replace
 * the JSON import with the API call.
 *
 * No follower count or engagement figure is shown — the brief says the account
 * has real organic reach, but I don't have a verified number and won't invent
 * one. TODO(Eli): verify source if you want a stat here.
 */
export function Community() {
  const posts = community.posts;

  return (
    <section className="arc-top section-pad relative isolate overflow-hidden bg-butter" aria-labelledby="community-heading">
      <Ambient variant="care" />
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Heart aria-hidden className="mb-5 h-8 w-8 text-coral" />
            <h2 id="community-heading" className="reveal-heading t-display-l max-w-[20ch] text-ink">
              She has been at this a while.
            </h2>
          </div>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-quiet"
          >
            {IG_HANDLE}
          </a>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {posts.map((p, i) => (
            <li key={p.file}>
              <Parallax speed={i % 3 === 1 ? 0.09 : -0.04}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-2xl border-2 border-ink/15"
                >
                  {/*
                    Square tile with object-cover. The source photos are all
                    different shapes, so cropping to a common square is what
                    makes the grid read as a grid — and the fixed aspect-ratio
                    box reserves the space, so CLS stays 0.
                  */}
                  <div className="relative aspect-square">
                    {p.ready ? (
                      <Image
                        src={`/brand/community/${p.file}`}
                        alt={p.alt}
                        width={p.w}
                        height={p.h}
                        sizes="(max-width: 640px) 45vw, 30vw"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="ph absolute inset-0"
                        role="img"
                        aria-label={`Placeholder: ${p.alt}`}
                      >
                        <span>
                          <strong className="block font-semibold">Placeholder</strong>
                          {p.alt}
                        </span>
                      </div>
                    )}
                  </div>
                </a>
              </Parallax>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
