import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/guides";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Thank-you pages carry the offer and only make sense post-capture.
        disallow: ["/decode/thank-you", "/vetbill/thank-you"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
