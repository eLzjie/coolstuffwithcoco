import { Paw } from "@/components/brand/Icons";

type Props = {
  /**
   * Two or three concrete facts about the guide.
   *
   * Callers pass these DERIVED from the real data — `CHEAT_SHEET` row counts,
   * `chapters.length`, `COSTS.length` — never typed as literals. It would be
   * quicker to write "18 signals" into a page and it would be wrong the first
   * time anyone edited the guide data. `guides.ts` is explicit that the guide
   * is the source of truth for anything a reader can compare, and a count is
   * the easiest kind of thing to get caught out on.
   */
  facts: readonly string[];
  className?: string;
};

/**
 * A row of small factual pills.
 *
 * Extracted from `MeetCoco` when that component was replaced by the two
 * content bands. This is the only part of it that was genuinely shared — the
 * section shell around it is four classes and is better duplicated than
 * abstracted, but this is a dozen lines plus a rule about where the numbers
 * come from, and that rule is worth having one home for.
 *
 * Server component. No JS.
 */
export function FactChips({ facts, className }: Props) {
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className ?? ""}`}>
      {facts.map((f) => (
        <li
          key={f}
          className="flex items-center gap-2 rounded-full border-2 border-ink bg-butter px-3.5 py-1.5"
        >
          <Paw aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink" />
          <span className="t-small font-semibold text-ink">{f}</span>
        </li>
      ))}
    </ul>
  );
}
