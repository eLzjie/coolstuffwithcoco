import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/guides";

/**
 * ---------------------------------------------------------------------------
 * AI CRAWLERS ARE ALLOWED, AND THAT IS A DECISION — DON'T UNDO IT BY TIDYING
 * ---------------------------------------------------------------------------
 * The wildcard rule below already permits GPTBot, ClaudeBot, PerplexityBot,
 * Google-Extended and the rest. They are named explicitly anyway, because
 * "allow everything" and "we decided to allow the AI crawlers" look identical
 * in a config file, and the second one is what this is.
 *
 * Being crawlable is the PRECONDITION for being cited in an AI answer. Someone
 * asking an assistant "how much does an emergency vet visit cost" is exactly
 * this site's visitor, and a blocked crawler cannot name us as the source no
 * matter how good the page is. Blocking them protects content that is already
 * being given away free as a lead magnet — it forfeits the distribution and
 * defends nothing.
 *
 * The counter-argument worth acknowledging: an assistant that answers the
 * question outright removes the click. That trade is accepted here, because
 * this funnel's product is the GUIDE, not the page — an answer that mentions
 * Cool Stuff with Coco and its free guides does the top-of-funnel work the ads
 * are otherwise paid to do.
 *
 * If that ever needs revisiting, revisit it deliberately. Do not let it change
 * as a side effect of someone simplifying this file.
 *
 * llms.txt was considered and skipped — see the note in lib/content/faq.ts.
 * Measured usage is negligible and Google has said it won't support it, so the
 * crawlers read the HTML, which is what the Q&A sections are for.
 */

/**
 * Crawlers named so the intent is on the record.
 *
 * Not exhaustive, and doesn't need to be — the wildcard covers anything new.
 * These are the ones whose absence would be read as an oversight.
 */
const AI_CRAWLERS = [
  "GPTBot", // OpenAI, training + ChatGPT browsing
  "OAI-SearchBot", // OpenAI, search surface
  "ChatGPT-User", // OpenAI, user-initiated fetch
  "ClaudeBot", // Anthropic
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended", // Gemini grounding; separate from Googlebot
  "Applebot-Extended",
  "CCBot", // Common Crawl, feeds many models
];

/**
 * Post-capture only, and they carry the offer.
 *
 * Both also set `robots: { index: false }` in their own metadata, which is the
 * control that actually prevents indexing — a `Disallow` only prevents
 * crawling, and a disallowed URL can still be indexed from inbound links with
 * no content at all. Belt and braces, in that order of importance.
 */
const POST_CAPTURE = ["/decode/thank-you", "/vetbill/thank-you"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: POST_CAPTURE,
      },
      /*
        Same permissions as the wildcard, stated for the record. If one of
        these ever needs restricting, this is where to do it — and the reason
        belongs in a comment next to it.
      */
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: POST_CAPTURE,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
