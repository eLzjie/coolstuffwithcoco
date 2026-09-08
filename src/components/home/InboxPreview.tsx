import { CaptureSlot } from "@/components/forms/CaptureSlot";
import { Ambient } from "@/components/motion/Ambient";
import { Speech } from "@/components/brand/Icons";

/**
 * Newsletter capture, low friction.
 *
 * ---------------------------------------------------------------------------
 * The mock email preview that used to live here is gone
 * ---------------------------------------------------------------------------
 * It rendered a fake inbox card with an invented subject line and body, and it
 * was the weakest thing on the page for two reasons:
 *
 *  1. It was made up. A sample email nobody has actually sent is a promise
 *     about content that doesn't exist yet, and it carried a visible
 *     "TODO: swap in a real send" to prove it.
 *  2. It competed with the form. The section's only job is to capture an
 *     email, and a large decorative card above the field pushed the field
 *     itself below the fold on a phone.
 *
 * What replaced it is a short honest description of what turns up and how
 * often, and then the form. If real sends are worth showing later, screenshots
 * of actual emails would earn their place — an invented one never did.
 *
 * Email only here, deliberately: this is a subscribe, not a delivery, so
 * there's no guide to personalise and no reason to ask for a name.
 *
 * Server component — the only interactive part is CaptureSlot.
 */
export function InboxPreview() {
  return (
    <section
      id="newsletter"
      className="section-pad relative isolate scroll-mt-8 overflow-hidden bg-paper"
      aria-labelledby="newsletter-heading"
    >
      <Ambient variant="paws" />

      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <Speech aria-hidden className="mx-auto mb-6 h-9 w-9 text-ink" />

          <h2
            id="newsletter-heading"
            className="reveal-heading t-display-l text-ink"
          >
            Get Coco&apos;s emails
          </h2>

          <p className="t-lead mx-auto mt-5 text-ink/80">
            A couple of times a month. One dog thing we worked out, explained
            properly — the stuff that turned out to be simple once someone
            translated it.
          </p>

          <ul className="t-body mt-6 inline-flex flex-col gap-1 text-left text-ink/80">
            <li>Two or three a month, never daily.</li>
            <li>No pitching in the first one.</li>
            <li>Unsubscribe link in every single email.</li>
          </ul>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border-2 border-ink/20 bg-mint p-6 sm:p-8">
          <CaptureSlot magnet="newsletter" />
        </div>
      </div>
    </section>
  );
}
