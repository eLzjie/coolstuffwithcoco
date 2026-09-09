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
 *  NO VET SIGN-OFF — confirmed 2026-09-08 as not obtainable before launch.
 *  Eli chose to ship behind a hardened disclaimer instead.
 *
 *  That changes what this component owes the reader, so the butter panel now
 *  states plainly, BEFORE any symptom is read, that this has not been reviewed
 *  by a veterinarian, that it is not a diagnosis, and that an unsure reader
 *  should ring their vet.
 *
 *  A disclaimer reduces exposure. It does not remove it, and the build spec
 *  recommendation still stands: promote /decode first and let /vetbill follow
 *  once someone qualified has read these categories.
 *
 *  TODO(Eli): get this read by a vet when one is available, then delete the
 *  "hasn't been reviewed by a veterinarian" sentence from the panel.
 *
 *  Deliberately a server component — no interactivity, so no JS ships for it.
 *  Scannability is the value here, and a reader shouldn't have to tap anything
 *  to see whether their dog's symptom is on the urgent list.
 * ===========================================================================
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

export function CallNowTable({ wash = "bg-sky" }: Props = {}) {
  const now = TRIAGE.filter((r) => r.tier === "now");
  const soon = TRIAGE.filter((r) => r.tier === "call");

  return (
    <section
      id="table"
      className={`section-pad relative isolate overflow-hidden scroll-mt-8 ${wash}`}
      aria-labelledby="table-heading"
    >
      <Ambient variant="care" />
      <div className="shell">
        <Cross aria-hidden className="mb-6 h-9 w-9 text-ink" />
        <h2 id="table-heading" className="reveal-heading t-display-l max-w-[24ch] text-ink">
          Go now, or ring in the morning?
        </h2>
        {/*
          Counted, not written. This said "Six of them" while the table held
          eight — the row list grew when it was aligned to the guide and the
          sentence didn't. A hardcoded count next to a mapped array is a
          promise that breaks silently every time someone edits the data.
        */}
        <p className="t-lead mt-5 text-ink/80">
          {TRIAGE.length} of them, out of the full table in the guide.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border-2 border-ink bg-paper">
          {/*
            The framing sits at the top of the component, before any row, and
            it is deliberately the loudest thing in the table.

            This has NOT been reviewed by a vet (see the block comment above),
            so the disclaimer is doing more work than it would otherwise: it
            names what this is, names what it isn't, and tells the reader what
            to do when unsure — before they read a single symptom.
          */}
          <div className="border-b-2 border-ink bg-butter px-5 py-5 text-ink sm:px-7">
            <p className="t-h3">
              General guidance only — not veterinary advice.
            </p>
            <p className="t-small mt-2">
              This is <strong className="font-semibold">not a diagnosis</strong>{" "}
              and not a substitute for examining your dog. It hasn&apos;t been
              reviewed by a veterinarian, and it can&apos;t see your animal, its
              history or its breed. Treat it as a way to stop guessing — not as
              triage you can rely on.
            </p>
            <p className="t-small mt-2">
              A sign in the lower group can still be an emergency in your dog.{" "}
              <strong className="font-semibold">
                If you are unsure at all, ring your vet or your nearest
                out-of-hours clinic.
              </strong>{" "}
              That is always the right answer, and asking never costs you
              anything.
            </p>
          </div>

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
                  <p className="t-small mt-1 text-ink-muted">{r.note}</p>
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
                  <p className="t-small mt-1 text-ink-muted">{r.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="t-small border-t-2 border-ink bg-paper-warm px-5 py-4 text-ink/80 sm:px-7">
            If something feels wrong and it isn&apos;t on this list, that
            doesn&apos;t mean it&apos;s fine. You know your dog. Ring.
          </p>
        </div>

        {/*
          The build-status TODO that used to render here has moved into the
          block comment at the top of this file.

          It was showing "TODO(Eli): verify — needs sign-off by a vet" to
          actual visitors, which reads as an unfinished site and, worse,
          undercuts the disclaimer directly above it. The reviewer-facing note
          belongs in the repo; the visitor-facing statement of limits belongs
          in the butter panel, where it now says all of the same things in
          language written for them.
        */}
      </div>
    </section>
  );
}
