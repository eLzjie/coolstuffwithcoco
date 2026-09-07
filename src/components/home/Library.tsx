"use client";

import { Bone } from "@/components/brand/Icons";
import { Ambient } from "@/components/motion/Ambient";

/**
 * The Library — a soft tease of the paid bundle.
 *
 * No pricing and no checkout on the home page, per the funnel plan. The offer
 * belongs on the thank-you page, after the email is in. This section exists
 * only so "there's more, and it's good" is on the record.
 *
 * TODO(Eli): the bundle isn't locked — 6–8 guides at roughly $27–30. Nothing
 * about the count or the price is stated here on purpose. Confirm both, then
 * decide whether this section names them.
 */
export function Library() {
  return (
    <section className="arc-top section-pad relative isolate overflow-hidden bg-mint" aria-labelledby="library-heading">
      <Ambient variant="mixed" />
      <div className="shell">
        <Bone aria-hidden className="mb-6 h-9 w-9 text-ink" />

        <h2 id="library-heading" className="reveal-heading t-display-l max-w-[26ch] text-ink">
          The free ones are the start of it.
        </h2>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="t-body space-y-4 text-ink/80">
            <p>
              There&apos;s a whole shelf of these now — the ones that took
              longer to work out, and the ones I only wrote because enough
              people asked the same question twice.
            </p>
            <p>
              They&apos;re not free, and I&apos;m not going to pitch them to
              you here. Take a free guide first. If it&apos;s useful,
              you&apos;ll hear about the rest from Coco.
            </p>
          </div>

          <aside className="rounded-2xl border-2 border-ink/20 bg-paper/70 p-6">
            <h3 className="t-h3">Coco&apos;s Library</h3>
            <p className="t-small mt-2 text-ink/75">
              Coming to this site properly once the guides are finished.
            </p>
            <p className="t-small mt-4 rounded-lg border-2 border-dashed border-ink/30 p-3 text-ink-muted">
              <strong className="font-semibold">TODO(Eli)</strong> — bundle
              contents, price and order bump aren&apos;t locked. Nothing
              committed here until they are.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
