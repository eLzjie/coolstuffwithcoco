import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/guides";

/**
 * ---------------------------------------------------------------------------
 * `lastModified` IS A REAL DATE, NOT `new Date()`
 * ---------------------------------------------------------------------------
 * This file previously stamped `new Date()` on every URL, which meant every
 * page claimed to have changed at the exact moment of each deploy. Ship a CSS
 * tweak and the sitemap announces that the privacy policy, the refund terms
 * and both guide pages were all rewritten.
 *
 * That's actively harmful rather than merely useless: crawlers weight `lastmod`
 * by whether it has historically been truthful, and a site that marks
 * everything fresh on every build teaches them to ignore the field. Then the
 * one time a page genuinely does change, the signal is already spent.
 *
 * So each entry carries a hand-maintained date. Updating it is a deliberate
 * act, which is the entire point.
 *
 * WHEN YOU CHANGE A PAGE'S CONTENT, UPDATE ITS DATE HERE. Not for a typo or a
 * styling change — for a change a reader would notice.
 *
 * `changeFrequency` is kept because it costs nothing, but note Google has said
 * for years that it ignores it. Don't spend any thought on tuning it.
 */

/**
 * Content dates, newest edit per route.
 *
 * `/decode` and `/vetbill` moved on 2026-09-08: both gained a Q&A section, and
 * the vet-bill cost table was corrected to match the delivered guide.
 */
const UPDATED = {
  home: "2026-09-08",
  decode: "2026-09-08",
  vetbill: "2026-09-08",
  contact: "2026-09-08",
  privacy: "2026-09-08",
  terms: "2026-09-08",
  refund: "2026-09-08",
} as const;

/**
 * Thank-you pages are deliberately absent — they're noindex, and they only
 * make sense after a capture.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: UPDATED.home,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/decode`,
      lastModified: UPDATED.decode,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/vetbill`,
      lastModified: UPDATED.vetbill,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: UPDATED.contact,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: UPDATED.privacy,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: UPDATED.terms,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/refund-policy`,
      lastModified: UPDATED.refund,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
