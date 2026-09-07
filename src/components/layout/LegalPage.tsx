import Link from "next/link";
import { BrandImage } from "@/components/brand/BrandImage";
import { Footer } from "@/components/layout/Footer";

/**
 * Shared shell for the four legal routes.
 *
 * These are SCAFFOLDS. No legal text is drafted here — the brief is explicit
 * that drafting it isn't my job, and a plausible-looking privacy policy is
 * worse than an obvious placeholder because it looks finished.
 *
 * The refund policy in particular must be live before checkout goes live
 * (compliance rule 5). Checkout is in GHL, so this route exists to be linked
 * from there.
 */
export function LegalPage({
  title,
  intent,
  children,
}: {
  title: string;
  /** What this page needs to cover, for whoever writes it. */
  intent: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <main id="main" className="bg-paper">
        <div className="shell py-6">
          {/* No aria-label — see the note in Hero.tsx */}
          <Link href="/">
            <BrandImage slot="logoHorizontal" className="h-9 w-auto" sizes="180px" />
          </Link>
        </div>

        <div className="shell pb-24 pt-8">
          <h1 className="t-display-l max-w-[24ch] text-ink">{title}</h1>

          <div className="mt-10 max-w-[68ch] rounded-2xl border-2 border-dashed border-ink/40 bg-paper-warm p-6 sm:p-8">
            <p className="t-h3">TODO(Eli) — this page needs real copy</p>
            <p className="t-body mt-3 text-ink/80">{intent}</p>
            <p className="t-small mt-4 text-ink-muted">
              Left as a scaffold on purpose. Drafting legal text isn&apos;t
              something I should do, and a plausible-looking version is worse
              than an obvious blank because it reads as finished.
            </p>
          </div>

          {children}
        </div>
      </main>

      <Footer bare />
    </>
  );
}
