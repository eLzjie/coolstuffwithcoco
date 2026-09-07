import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Paw } from "@/components/brand/Icons";
import {
  DISCLAIMER,
  DISCLAIMER_LONG,
  HOTLINES,
  IG_HANDLE,
  IG_URL,
  SITE_NAME,
} from "@/lib/content/guides";

/**
 * Appears on every page, including the paid-traffic landing pages.
 *
 * The disclaimer and hotlines are compliance requirements, not design
 * elements — they render at readable size on ink (16.09:1), never shrunk into
 * illegibility.
 *
 * `bare` drops the navigation columns for /decode and /vetbill, where nothing
 * may compete with the form. Legal links stay: they're required, and they're
 * the one exception to the no-outbound-links rule.
 */
export function Footer({ bare = false }: { bare?: boolean }) {
  return (
    <footer className="bg-ink text-paper">
      <div className="shell py-16">
        {/*
          Emergency numbers first, disclaimer with them. This is the block that
          actually matters at 2am, so it sits at the top of the footer rather
          than under four columns of navigation, and it's set at readable size
          on ink (16.09:1) rather than shrunk into the small print.
        */}
        <div className="rounded-2xl border-2 border-paper/25 p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <Paw aria-hidden className="h-5 w-5 text-coral" />
            <h2 className="t-h3">In an emergency</h2>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {HOTLINES.map((h) => (
              <li key={h.name}>
                <a
                  href={`tel:${h.number.replace(/[^+\d]/g, "")}`}
                  className="t-h3 underline decoration-coral decoration-2 underline-offset-4"
                >
                  {h.number}
                </a>
                <span className="block font-semibold opacity-95">{h.name}</span>
                <span className="t-small block opacity-75">{h.note}</span>
              </li>
            ))}
          </ul>

          <p className="t-small mt-6 border-t border-paper/20 pt-4 opacity-90">
            {DISCLAIMER}
          </p>
        </div>

        <p className="t-body mt-8 max-w-[62ch] opacity-80">{DISCLAIMER_LONG}</p>

        {/* Columns */}
        <div className="mt-12 grid gap-10 border-t border-paper/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLockup onInk className="mb-4" />
            <p className="t-small opacity-75">
              Dog stuff, from Coco and the person who feeds her.
            </p>
          </div>

          {!bare && (
            <nav aria-labelledby="f-guides">
              <h2 id="f-guides" className="t-h3 mb-3">
                Free guides
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/decode" className="hover:underline">
                    Decode Your Dog
                  </Link>
                </li>
                <li>
                  <Link href="/vetbill" className="hover:underline">
                    The $1,000 Vet Bill
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          <nav aria-labelledby="f-legal">
            <h2 id="f-legal" className="t-h3 mb-3">
              The small print
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:underline">
                  Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="t-h3 mb-3">Coco, online</h2>
            <a
              href={IG_URL}
              className="hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {IG_HANDLE}
            </a>
            {/*
              Brand name, IG handle and domain now all agree on "stuff", so the
              naming clash flagged in brief §8 is fully resolved and there's no
              visitor-facing note needed here.
            */}
          </div>
        </div>

        <p className="t-small mt-12 opacity-60">
          © {new Date().getFullYear()} {SITE_NAME}. Coco is a real dog and has
          approved none of this.
        </p>
      </div>
    </footer>
  );
}
