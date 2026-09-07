import { Cross } from "@/components/brand/Icons";
import { TRIAGE } from "@/lib/content/guides";
import { Ambient } from "@/components/motion/Ambient";

/**
 * /vetbill signature moment — an honest slice of the call-now table.
 *
 * ===========================================================================
 *  COMPLIANCE — do not weaken any of this without Eli's sign-off
 * ===========================================================================
 *  - The "general guidance, not veterinary care" framing renders INSIDE this
 *    component's own frame, above the rows. Not delegated to the footer.
 *  - Every row ends by pointing at a phone call, including the "can wait" ones.
 *    Nothing here tells anyone not to ring their vet.
 *  - Framed as CATEGORIES, never as a diagnosis, and never individualised.
 *  - The second tier is labelled "Ring your vet today", not "wait" — a reader
 *    skimming the column headers must not come away with permission to delay.
 *
 *  TODO(Eli): this table needs review and sign-off by a vet before launch.
 *  Do not publish it on my say-so.
 *
 *  Deliberately a server component — no interactivity, so no JS ships for it.
 *  Scannability is the value here, and a reader shouldn't have to tap anything
 *  to see whether their dog's symptom is on the urgent list.
 * ===========================================================================
 */
export function CallNowTable() {
  const now = TRIAGE.filter((r) => r.tier === "now");
  const soon = TRIAGE.filter((r) => r.tier === "call");

  return (
    <section
      id="table"
      className="section-pad relative isolate overflow-hidden scroll-mt-8 bg-sky"
      aria-labelledby="table-heading"
    >
      <Ambient variant="care" />
      <div className="shell">
        <Cross aria-hidden className="mb-6 h-9 w-9 text-ink" />
        <h2 id="table-heading" className="t-display-l max-w-[24ch] text-ink">
          Go now, or ring in the morning?
        </h2>
        <p className="t-lead mt-5 text-ink/80">
          Six of them, out of the full table in the guide.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border-2 border-ink bg-paper">
          {/* The framing sits at the top of the component, before any row */}
          <p className="t-small border-b-2 border-ink bg-butter px-5 py-4 text-ink sm:px-7">
            <strong className="font-semibold">
              These are general categories, not a diagnosis.
            </strong>{" "}
            Every dog is different and this can&apos;t see yours. It&apos;s here
            to stop you guessing, not to replace the person who went to
            veterinary school. If you&apos;re worried at all, ring your vet —
            that&apos;s always the right call.
          </p>

          {/* Tier 1 */}
          <div className="border-b-2 border-ink/15">
            <h3 className="t-h3 flex items-center gap-3 bg-coral px-5 py-4 text-ink sm:px-7">
              <span
                aria-hidden
                className="inline-block h-3 w-3 shrink-0 rounded-full bg-ink"
              />
              Don&apos;t wait — go, or ring the out-of-hours clinic now
            </h3>
            <ul className="divide-y-2 divide-ink/10">
              {now.map((r) => (
                <li key={r.sign} className="px-5 py-5 sm:px-7">
                  <p className="t-h3">{r.sign}</p>
                  <p className="t-small mt-1 text-ink/75">{r.note}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Tier 2 — labelled as a call, never as a wait */}
          <div>
            <h3 className="t-h3 flex items-center gap-3 bg-mint px-5 py-4 text-ink sm:px-7">
              <span
                aria-hidden
                className="inline-block h-3 w-3 shrink-0 rounded-full border-2 border-ink"
              />
              Ring your vet today — likely not a 2am drive
            </h3>
            <ul className="divide-y-2 divide-ink/10">
              {soon.map((r) => (
                <li key={r.sign} className="px-5 py-5 sm:px-7">
                  <p className="t-h3">{r.sign}</p>
                  <p className="t-small mt-1 text-ink/75">{r.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="t-small border-t-2 border-ink bg-paper-warm px-5 py-4 text-ink/80 sm:px-7">
            If something feels wrong and it isn&apos;t on this list, that
            doesn&apos;t mean it&apos;s fine. You know your dog. Ring.
          </p>
        </div>

        <p className="t-small mt-4 rounded-lg border-2 border-dashed border-ink/40 bg-paper/60 p-4 text-ink/80">
          <strong className="font-semibold">TODO(Eli): verify</strong> — this
          table needs review and sign-off by a vet before it goes live. The
          categories are drawn from the brief&apos;s description of the guide,
          not from a clinical source.
        </p>
      </div>
    </section>
  );
}
