import { CHEAT_SHEET, CALMING_SIGNALS } from "@/lib/content/guides";

type Props = {
  className?: string;
};

/**
 * The guide's fridge card, on the page.
 *
 * ---------------------------------------------------------------------------
 * WHY SHOW THE PRODUCT INSTEAD OF DESCRIBING IT
 * ---------------------------------------------------------------------------
 * Chase, on the signal quiz: "definitely onto something with the signal
 * stuff... I like the little signal thing." The quiz is three signals and it
 * is the best-performing idea on the page. This is the same idea at scale, and
 * it costs no new writing — it's page 12 of the guide, the one page the guide
 * itself tells you to print and stick on the fridge.
 *
 * That makes it the strongest possible argument for the email: not "here's
 * what the guide covers", but "here is the guide, have a look". Eighteen
 * signal/meaning pairs in the space the old prose used for two paragraphs.
 *
 * ---------------------------------------------------------------------------
 * IT IS A TABLE, SO IT IS A TABLE
 * ---------------------------------------------------------------------------
 * Signal on the left, meaning on the right, three times over. Definition lists
 * rather than `<table>` because each group is a set of term/definition pairs
 * with no cross-column relationship — there are no rows to compare across, and
 * a `<table>` would promise one.
 *
 * Wording is the guide's, verbatim, including the clipped register ("Grass =
 * instinct"). See the note above `CHEAT_SHEET` for why paraphrasing for the
 * web would be a mistake.
 *
 * Server component. No JS.
 */
export function SignalGrid({ className }: Props) {
  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHEAT_SHEET.map((group) => (
          <section
            key={group.title}
            className="rounded-2xl border-2 border-ink bg-paper p-5"
            style={{ boxShadow: "0 3px 0 var(--color-ink)" }}
          >
            <h3 className="t-h3 text-ink">{group.title}</h3>

            <dl className="mt-3">
              {group.rows.map((r) => (
                <div
                  key={r.signal}
                  className="flex items-baseline gap-2 border-t border-ink/12 py-2 first:border-t-0 first:pt-1"
                >
                  <dt className="t-small font-semibold text-ink">{r.signal}</dt>
                  {/*
                    The "=" is decoration standing in for a relationship the
                    markup already states, so it's hidden rather than read out
                    eighteen times.
                  */}
                  <span aria-hidden className="t-small text-ink/35">
                    =
                  </span>
                  <dd className="t-small text-ink-muted">{r.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {/*
        The calming signals, as a run rather than a fourth card. The guide
        prints them as one line with no meanings attached, and inventing
        meanings to make them fill a card would be adding content the guide
        doesn't have.
      */}
      <p className="t-small mt-4 text-ink-muted">
        <span className="font-semibold text-ink">Calming signals:</span>{" "}
        {CALMING_SIGNALS.join(" · ")} — the quiet ones, and the easiest to miss.
      </p>
    </div>
  );
}
