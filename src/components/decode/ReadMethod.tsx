import { Ambient } from "@/components/motion/Ambient";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The R.E.A.D. method — Section 3 of the Decode guide.
 *
 * ---------------------------------------------------------------------------
 * WHY A NAMED FRAMEWORK IS WORTH ITS OWN SECTION
 * ---------------------------------------------------------------------------
 * This is the highest-leverage thing on the page for AI search, and the reason
 * is boring: a named, four-step, self-contained method is *quotable*. An
 * assistant answering "how do I tell if my dog is stressed" can lift "the
 * R.E.A.D. method" as a unit and attribute it, in a way it can't lift three
 * paragraphs of good advice. Named things get cited; loose prose gets
 * paraphrased without a source.
 *
 * It also happens to be the single most useful page of the guide, which is why
 * giving it away doesn't cannibalise the download — someone who finds this
 * useful wants the rest.
 *
 * The letters are rendered as real text, not an image, for the same reason.
 *
 * ---------------------------------------------------------------------------
 * DON'T RESTATE THIS AS ADVICE
 * ---------------------------------------------------------------------------
 * Step D deliberately ends at "comfortable, or do they need space?" — a
 * question the reader answers about their own dog. It must not turn into an
 * instruction about what to then do, which would drift from body-language
 * observation into behavioural advice this brand isn't qualified to give.
 *
 * Server component — no interactivity.
 */

/** Verbatim from the guide, and the wording is deliberate. */
const STEPS: Array<{ letter: string; title: string; body: string }> = [
  {
    letter: "R",
    title: "Relax yourself first",
    body: "Dogs read your stress before you read theirs. If you come in tense, you're now part of what they're reacting to.",
  },
  {
    letter: "E",
    title: "Eyes, ears, mouth",
    body: "Scan the face as a whole and take the overall expression. One signal on its own tells you almost nothing.",
  },
  {
    letter: "A",
    title: "Assess the body",
    body: "Tail height and stiffness, posture, and where their weight is sitting. The tail gets the attention but posture tells the real story.",
  },
  {
    letter: "D",
    title: "Decide",
    body: "Comfortable, or do they need space? That's the whole question, and you're the one standing there.",
  },
];

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

export function ReadMethod({ wash = "bg-mint" }: Props = {}) {
  return (
    <section
      id="read-method"
      className={`section-pad relative isolate scroll-mt-8 overflow-hidden ${wash}`}
      aria-labelledby="read-method-heading"
    >
      <Ambient variant="paws" />

      <div className="shell">
        <div className="max-w-2xl">
          <h2
            id="read-method-heading"
            className="reveal-heading t-display-l text-ink"
          >
            The R.E.A.D. method
          </h2>
          <p className="t-lead mt-5 text-ink/80">
            Four steps for reading any dog, anywhere. It&apos;s the most useful
            page in the guide, so here it is in full.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <Reveal as="li" key={step.letter}>
              <div className="h-full rounded-2xl border-2 border-ink bg-paper p-6">
                {/*
                  aria-hidden on the letter: it's a visual mnemonic, and a
                  screen reader announcing "R" before "Relax yourself first"
                  is noise. The heading text already carries the meaning.
                */}
                <span
                  aria-hidden
                  className="t-display-l block leading-none text-coral"
                >
                  {step.letter}
                </span>
                <h3 className="t-h3 mt-3 text-ink">{step.title}</h3>
                <p className="t-small mt-2 text-ink-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <p className="t-small mt-8 max-w-prose text-ink-muted">
          General guidance for reading body language — not veterinary or
          behavioural advice. A sudden change in how your dog behaves is worth a
          call to your vet.
        </p>
      </div>
    </section>
  );
}
