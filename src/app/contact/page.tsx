import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { ContactForm } from "@/components/forms/ContactForm";
import { Footer } from "@/components/layout/Footer";
import { Paw } from "@/components/brand/Icons";
import { HOTLINES, IG_HANDLE, IG_URL, SUPPORT_EMAIL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Cool Stuff with Coco — questions about a guide, a refund, or your data.",
  alternates: { canonical: "/contact" },
};

/**
 * Not a LegalPage: this one has a form and a different shape, and it isn't a
 * policy. It shares the header/footer chrome and nothing else.
 *
 * The emergency numbers are repeated here on purpose. Someone with a sick dog
 * who lands on "Contact" is looking for the fastest way to reach a human, and
 * the honest answer is "not us" — so the numbers sit above the form rather
 * than only in the footer.
 */
export default function Contact() {
  return (
    <>
      <main id="main" className="bg-paper">
        <div className="shell py-6">
          <BrandLockup href="/" />
        </div>

        <div className="shell pb-24 pt-6">
          <h1 className="t-display-l max-w-[20ch] text-ink">Get in touch</h1>
          <p className="t-lead mt-5 text-ink/80">
            A real person reads everything that comes in. Usually a reply within
            a couple of working days.
          </p>

          {/* If the dog is unwell, we are the wrong destination. Say so first. */}
          <div className="mt-8 max-w-[62ch] rounded-2xl border-2 border-ink bg-butter p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Paw aria-hidden className="h-5 w-5 shrink-0 text-coral" />
              <h2 className="t-h3">If something&apos;s wrong with your dog</h2>
            </div>
            <p className="t-body mt-2 text-ink/85">
              Please don&apos;t wait on an email from us. Ring your own vet or
              your nearest out-of-hours clinic. We can&apos;t give veterinary
              advice, and we can&apos;t reply fast enough to be useful in an
              emergency.
            </p>
            {HOTLINES.length > 0 && (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {HOTLINES.map((h) => (
                  <li key={h.name}>
                    {/*
                      inline-flex + min-h-11 (44px) rather than the bare 28px
                      the type size gives. These are emergency numbers being
                      tapped one-handed by someone frightened, which is the
                      worst case for a small target — 24px would technically
                      pass WCAG AA and still be the wrong call here.
                    */}
                    <a
                      href={`tel:${h.number.replace(/[^+\d]/g, "")}`}
                      className="t-h3 inline-flex min-h-11 items-center underline decoration-2 underline-offset-4"
                    >
                      {h.number}
                    </a>
                    <span className="block font-semibold">{h.name}</span>
                    <span className="t-small block text-ink-muted">{h.note}</span>
                    {/*
                      The charge, stated before they dial. Not muted like the
                      note above it — someone scanning this in a panic has to
                      be able to see it, and burying a fee in grey text is how
                      you technically disclose something nobody reads.
                    */}
                    <span className="t-small block font-semibold text-ink">
                      {h.fee}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <section aria-labelledby="form-heading">
              <h2 id="form-heading" className="t-h2">
                Send us a message
              </h2>
              <ContactForm className="mt-6" />
            </section>

            <aside className="lg:pt-2">
              <h2 className="t-h3">Or just email</h2>
              <p className="t-body mt-2 text-ink/80">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-semibold underline decoration-2 underline-offset-4"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>

              <h2 className="t-h3 mt-8">Common things</h2>
              <ul className="t-body mt-2 space-y-2 text-ink/80">
                <li>
                  <strong>Want a refund?</strong> Email us from the address you
                  bought with. Details on the{" "}
                  <Link
                    href="/refund-policy"
                    className="underline underline-offset-2"
                  >
                    refund page
                  </Link>
                  .
                </li>
                <li>
                  <strong>Guide never arrived?</strong> Check the promotions
                  tab first — Coco ends up there a lot. Then tell us and
                  we&apos;ll resend it.
                </li>
                <li>
                  <strong>Want your data deleted?</strong> Say so and we&apos;ll
                  do it. See{" "}
                  <Link href="/privacy" className="underline underline-offset-2">
                    Privacy
                  </Link>
                  .
                </li>
                <li>
                  <strong>Just want the emails to stop?</strong> The
                  unsubscribe link in any email is faster than waiting on us.
                </li>
              </ul>

              <h2 className="t-h3 mt-8">Coco, online</h2>
              <p className="t-body mt-2 text-ink/80">
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {IG_HANDLE}
                </a>
              </p>
            </aside>
          </div>
        </div>
      </main>

      <Footer bare />
    </>
  );
}
