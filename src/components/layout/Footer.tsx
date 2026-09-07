import Link from "next/link";
import { BrandImage } from "@/components/brand/BrandImage";
import { Paw } from "@/components/brand/Icons";
import {
  DISCLAIMER,
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
        {/* Disclaimer first — it's the most important thing down here */}
        <div className="max-w-[62ch]">
          <div className="mb-4 flex items-center gap-3">
            <Paw className="h-5 w-5 text-coral" />
            <span className="t-h3">Before you go</span>
          </div>
          <p className="t-body opacity-90">{DISCLAIMER}</p>
        </div>

        {/* Hotlines — deliberately unpopulated */}
        <div className="mt-10 border-t border-paper/20 pt-8">
          <h2 className="t-h3 mb-3">In an emergency</h2>
          {HOTLINES.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {HOTLINES.map((h) => (
                <li key={h.name}>
                  <a
                    href={`tel:${h.number.replace(/[^+\d]/g, "")}`}
                    className="font-semibold underline decoration-coral decoration-2 underline-offset-4"
                  >
                    {h.name}: {h.number}
                  </a>
                  <span className="t-small block opacity-75">{h.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-small max-w-[52ch] rounded-lg border-2 border-dashed border-paper/40 p-4 opacity-90">
              <strong className="font-semibold">
                TODO(Eli): verified hotline 1 / 2
              </strong>
              <br />
              Left blank on purpose. An emergency number produced from memory is
              a liability, not a placeholder — add the two verified numbers to{" "}
              <code className="text-coral">HOTLINES</code> in{" "}
              <code className="text-coral">lib/content/guides.ts</code> and they
              render here as tel: links.
            </p>
          )}
        </div>

        {/* Columns */}
        <div className="mt-12 grid gap-10 border-t border-paper/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandImage
              slot="logoMono"
              className="mb-4 h-12 w-auto"
              sizes="200px"
            />
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
              Brand name and IG handle now agree (both "stuff") after Eli's
              correction on 2026-09-07, which reverses brief §8. The DOMAIN is
              now the odd one out — see SITE_URL in lib/content/guides.ts.
              No visitor-facing note here any more, because there's nothing
              confusing left on the page itself.
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
