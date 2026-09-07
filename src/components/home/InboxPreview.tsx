"use client";

import { BrandImage } from "@/components/brand/BrandImage";
import { GhlFormEmbed } from "@/components/shared/GhlFormEmbed";

/**
 * PROPOSED ADDITION (§4.1) — "What lands in your inbox".
 *
 * Rationale: the entire business model is email, and the unspoken objection at
 * the capture point is always "what are you going to send me?". Compliance rule
 * 8 requires an honest statement of what someone is signing up for — this makes
 * that concrete instead of legal. It sits immediately above the low-friction
 * capture, which is exactly where the objection fires.
 *
 * The preview is a real example of the format, not a screenshot of a real
 * campaign. TODO(Eli): replace the sample email body with an actual send once
 * the nurture sequence is written.
 */
export function InboxPreview() {
  return (
    <section className="section-pad bg-paper" aria-labelledby="inbox-heading">
      <div className="shell grid items-start gap-14 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <h2 id="inbox-heading" className="reveal-heading t-display-l max-w-[22ch] text-ink">
            Here&apos;s what actually turns up.
          </h2>
          <p className="t-lead mt-5 text-ink/75">
            No guessing. This is the format, a couple of times a month, from
            Coco.
          </p>

          {/* Sample email — styled as a mail client, clearly a sample */}
          <div className="mt-8 overflow-hidden rounded-2xl border-2 border-ink/20 bg-paper-warm">
            <div className="flex items-center gap-3 border-b-2 border-ink/15 px-5 py-4">
              <BrandImage slot="cocoAvatar" className="h-10 w-10 rounded-full" sizes="40px" />
              <div className="min-w-0">
                <p className="t-h3 truncate">Coco</p>
                <p className="t-small truncate text-ink-muted">
                  The one where she wouldn&apos;t go through the door
                </p>
              </div>
            </div>
            <div className="space-y-3 px-5 py-5 text-ink/80">
              <p>
                For about a week Coco refused to walk through the kitchen
                doorway. Not scared of the kitchen. Not scared of me. Just —
                not going through that gap.
              </p>
              <p>
                Turned out the bin had moved six inches and it now touched her
                whiskers on the way past. That was it. That was the whole
                mystery.
              </p>
              <p className="text-ink-muted">
                Three things this reminded me about how dogs map a room →
              </p>
            </div>
          </div>
          <p className="t-small mt-3 text-ink-muted">
            A sample, so you know the format. TODO(Eli): swap in a real send.
          </p>
        </div>

        {/* Low-friction capture for people who don't want a guide yet */}
        <div className="rounded-2xl border-2 border-ink/20 bg-mint p-6 sm:p-8">
          <h3 className="t-h2 max-w-[18ch]">Just the emails, then.</h3>
          <p className="t-body mt-3 text-ink/80">
            Not ready for a guide? Get the emails and decide later.
          </p>
          <div className="mt-6">
            <GhlFormEmbed magnet="newsletter" height={260} />
          </div>
        </div>
      </div>
    </section>
  );
}
