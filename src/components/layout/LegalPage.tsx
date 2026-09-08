import { BrandLockup } from "@/components/brand/BrandLockup";
import { Footer } from "@/components/layout/Footer";

/**
 * Shared shell for the legal routes.
 *
 * ---------------------------------------------------------------------------
 * NEEDS A LAWYER BEFORE YOU TAKE MONEY
 * ---------------------------------------------------------------------------
 * The policies these pages render are written to be accurate about what the
 * site actually does — the data flows in them were read off the real code, not
 * guessed from a template. That makes them honest, not vetted. See
 * docs/LEGAL-REVIEW.md for the specific open items (business entity, governing
 * law, and whether the refund terms match the eventual checkout).
 *
 * The review flag lives in the repo rather than on the page on purpose: a
 * visitor-facing "not reviewed by a lawyer" banner on a privacy policy
 * undermines the document without helping anyone.
 */
export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  /** One line under the h1, in plain language. */
  intro?: string;
  /** ISO date, rendered as the "last updated" line. */
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main id="main" className="bg-paper">
        <div className="shell py-6">
          <BrandLockup href="/" />
        </div>

        <div className="shell pb-24 pt-6">
          <h1 className="t-display-l max-w-[22ch] text-ink">{title}</h1>

          {intro && <p className="t-lead mt-5 text-ink/80">{intro}</p>}

          <p className="t-small mt-4 text-ink-muted">
            Last updated{" "}
            <time dateTime={updated}>
              {new Date(`${updated}T00:00:00Z`).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </p>

          <div className="prose-legal mt-10 text-ink/85">{children}</div>
        </div>
      </main>

      <Footer bare />
    </>
  );
}
