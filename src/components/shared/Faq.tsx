import type { FaqItem } from "@/lib/content/faq";
import { Ambient } from "@/components/motion/Ambient";

/**
 * Answer-first Q&A section, plus FAQPage JSON-LD.
 *
 * ---------------------------------------------------------------------------
 * THE MARKUP IS THE SIDE DISH
 * ---------------------------------------------------------------------------
 * Google removed FAQ rich results on 7 May 2026, so the JSON-LD below will not
 * produce a rich result for this site. It's emitted anyway because it's nearly
 * free once the content exists in structured form, `FAQPage` is still valid
 * schema, and it gives any non-Google consumer a clean machine-readable copy.
 *
 * Nobody should add to this expecting SERP decoration. The reason this section
 * earns its place is the VISIBLE content: a question as a heading with the
 * answer in the first sentence is what both passage indexing and AI assistants
 * can actually lift and attribute.
 *
 * ---------------------------------------------------------------------------
 * WHY NOT AN ACCORDION
 * ---------------------------------------------------------------------------
 * Collapsing these would look tidier and would be a mistake. An accordion
 * built with JS hides the answers from anything that doesn't run it, and even
 * done properly with `<details>` it buries the one thing this section exists
 * to expose. The answers are short by design — they can all just be on screen.
 *
 * `<details>` is also a worse experience on the phone this site is built for:
 * nine taps to read nine short answers.
 *
 * Server component. No interactivity, so no JS ships for it at all.
 */
export function Faq({
  items,
  heading,
  intro,
  id = "faq",
  className = "bg-paper",
}: {
  items: FaqItem[];
  heading: string;
  intro?: string;
  id?: string;
  className?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        /*
          Answer and detail joined, because the schema's answer should be the
          complete one — a reader arriving from a machine-readable copy gets
          the same thing a reader of the page does.
        */
        text: item.detail ? `${item.answer} ${item.detail}` : item.answer,
      },
    })),
  };

  return (
    <section
      id={id}
      className={`section-pad relative isolate scroll-mt-8 overflow-hidden ${className}`}
      aria-labelledby={`${id}-heading`}
    >
      <Ambient variant="paws" />

      <script
        type="application/ld+json"
        // Authored content only — nothing here comes from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell">
        <div className="max-w-2xl">
          <h2 id={`${id}-heading`} className="reveal-heading t-display-l text-ink">
            {heading}
          </h2>
          {intro && <p className="t-lead mt-5 text-ink/80">{intro}</p>}
        </div>

        {/*
          A definition list is the honest element for this: each question is a
          term and each answer describes it. It also means a screen reader
          announces the pairing rather than a wall of headings.
        */}
        <dl className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-x-10 lg:gap-x-16">
          {items.map((item) => (
            <div key={item.question} className="max-w-prose">
              <dt className="t-h3 text-ink">{item.question}</dt>
              {/*
                The answer sentence carries the weight — full-contrast ink and
                slightly heavier than the detail beneath it, because it is the
                thing a skimming reader should land on.
              */}
              <dd className="t-body mt-2 font-medium text-ink">{item.answer}</dd>
              {item.detail && (
                <dd className="t-small mt-2 text-ink-muted">{item.detail}</dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
