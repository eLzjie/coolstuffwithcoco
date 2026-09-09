import { PREVENTABLE } from "@/lib/content/guides";
import { Ambient } from "@/components/motion/Ambient";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The Preventable Five — Section 3 of the Vet Bill guide.
 *
 * ---------------------------------------------------------------------------
 * THIS IS THE SECTION THAT MAKES THE PAGE NOT-PREDATORY
 * ---------------------------------------------------------------------------
 * The rest of the page is necessarily about what things cost, which means it's
 * a page of large frightening numbers. That's defensible only if it also tells
 * someone what to actually do — otherwise it's fear with a form attached, and
 * the guide's own framing ("not here to frighten you into buying anything")
 * would be a claim the landing page contradicts.
 *
 * So this section is load-bearing for tone, not just for SEO. Don't remove it
 * to shorten the page, and don't move it below the capture form.
 *
 * Each item gives a real statistic and a concrete action, because "be careful"
 * helps nobody. Four of the five cost very little to prevent and a great deal
 * to treat, which is the entire argument.
 *
 * Statistics are the guide's own, with its attributions. Don't add figures
 * here that aren't in the guide.
 *
 * Server component — no interactivity.
 */
/**
 * Optional section wash.
 *
 * The split-test variants need a different background on some of these
 * sections — Chase's note was "it's somewhat feminine, we should try to speak
 * to both audiences", and bubblegum on every capture surface is most of why.
 *
 * ONLY the wash. Not the id, not the heading, not the copy. Those are the
 * things a variant is supposed to be testing, so a variant that wants a
 * different heading should say so in its own page file where the difference is
 * visible — not reach in through a prop and make two pages look like one
 * component with a flag. Add more props when a variant actually needs them.
 *
 * The default reproduces the class list byte-for-byte, so `/decode` and
 * `/vetbill` render exactly what they rendered before this prop existed. That
 * was verified rather than assumed, and it is worth re-verifying if the class
 * list is ever reordered:
 *
 *     curl -s localhost:3000/decode > before.html   # then make the change
 *     curl -s localhost:3000/decode | diff before.html -
 */
type Props = { wash?: string };

export function Preventable({ wash = "bg-paper-warm" }: Props = {}) {
  return (
    <section
      id="preventable"
      className={`section-pad relative isolate scroll-mt-8 overflow-hidden ${wash}`}
      aria-labelledby="preventable-heading"
    >
      <Ambient variant="care" />

      <div className="shell">
        <div className="max-w-2xl">
          <h2
            id="preventable-heading"
            className="reveal-heading t-display-l text-ink"
          >
            Five that are largely preventable
          </h2>
          <p className="t-lead mt-5 text-ink/80">
            The point of knowing the numbers isn&apos;t to worry about them.
            Four of these five cost very little to head off and a great deal to
            treat, and that gap is the best return available to a dog owner.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 lg:grid-cols-2">
          {PREVENTABLE.map((item, i) => (
            <Reveal as="li" key={item.title}>
              <div className="h-full rounded-2xl border-2 border-ink bg-paper p-6">
                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="t-h2 leading-none text-coral"
                  >
                    {i + 1}
                  </span>
                  <h3 className="t-h3 text-ink">{item.title}</h3>
                </div>

                {/*
                  The statistic is the hook and sits on butter so it reads as a
                  pulled-out fact rather than body copy. It's the guide's
                  figure, not ours.
                */}
                <p className="t-small mt-4 inline-block rounded-md bg-butter px-3 py-1.5 font-semibold text-ink">
                  {item.stat}
                </p>

                <p className="t-body mt-3 text-ink/80">{item.action}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
