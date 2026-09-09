import { Bone } from "@/components/brand/Icons";
import { Ambient } from "@/components/motion/Ambient";
import { LIBRARY_V1 } from "@/lib/content/library";

/**
 * The Library — a soft tease of the paid bundle.
 *
 * No pricing and no checkout on the home page, per the funnel plan. The offer
 * belongs on the thank-you page, after the email is in. This section exists
 * only so "there's more, and it's good" is on the record.
 *
 * ---------------------------------------------------------------------------
 * A "TODO(Eli)" USED TO RENDER HERE, TO VISITORS, ON THE LIVE SITE
 * ---------------------------------------------------------------------------
 * The literal string "TODO(Eli)" was bolded inside a dashed placeholder box in
 * this section, unconditionally, on the home page. Every visitor saw it.
 *
 * It's now a real quick peek: the two titles that actually ship first, named
 * from LIBRARY_V1 so there's one source of truth, and an honest line about
 * where the waitlist is. The build note it replaced:
 *
 *   TODO(Eli): the bundle isn't locked — 6–8 guides at roughly $27–30.
 *
 * That number is stale anyway. The lineup changed after the Sept 2026 product
 * research (docs/Coco_Library_Product_Research.pdf) concluded the original six
 * care titles missed the biggest demand signal, which is behaviour. Price is
 * now set; see PRICE_MODE in lib/content/library.ts.
 *
 * NO FORM HERE, DELIBERATELY. The waitlist needs an email, and the home page
 * already carries four competing actions (two guide CTAs, the Instagram link,
 * and the newsletter form in InboxPreview). A fifth capture path on the page
 * whose job is routing to the two lead magnets would compete with the thing
 * that actually makes money. The waitlist lives on the thank-you page, after
 * someone has taken a guide — which is also what the funnel plan says.
 *
 * CallNowTable's block comment records the last time a visitor-facing TODO had
 * to be pulled out of a live page. Same remedy: the reviewer-facing note lives
 * in the repo, the visitor gets a finished sentence.
 *
 * Server component — no interactivity, so no JS ships for it. It was marked
 * "use client" for no reason.
 */
export function Library() {
  return (
    <section
      className="arc-top section-pad relative isolate overflow-hidden bg-mint"
      aria-labelledby="library-heading"
    >
      <Ambient variant="mixed" />
      <div className="shell">
        <Bone aria-hidden className="mb-6 h-9 w-9 text-ink" />

        <h2
          id="library-heading"
          className="reveal-heading t-display-l max-w-[26ch] text-ink"
        >
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
              Coming to this site properly once the guides are finished. The
              first two:
            </p>

            {/*
              Titles only, no blurbs. A peek is a list of names — adding the
              descriptions would turn this into the pitch the paragraph beside
              it just promised not to make.
            */}
            <ul className="t-small mt-4 space-y-2 text-ink">
              {LIBRARY_V1.map((item) => (
                <li key={item.title} className="flex items-start gap-2">
                  <Bone
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-coral"
                  />
                  <span className="font-semibold">{item.title}</span>
                </li>
              ))}
            </ul>

            <p className="t-small mt-4 text-ink-muted">
              Grab a free guide and I&apos;ll offer you the waitlist on the way
              out — nothing to pay, and I&apos;ll email you the day they land.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
