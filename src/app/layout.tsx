import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Inter } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/content/guides";
import { AnalyticsBoot } from "@/components/AnalyticsBoot";
import {
  GoogleTags,
  GoogleTagsNoScript,
} from "@/components/analytics/Tags";
import { CONSENT_DEFAULT_SNIPPET } from "@/lib/analytics/consentMode";
import { GA4_ID, GTM_ID } from "@/lib/analytics/ids";
import "./globals.css";

/**
 * Self-hosted at build time by next/font — no render-blocking request to
 * Google, no third-party connection on the critical path.
 *
 * Poppins is preloaded because it sets the hero headline (the LCP text).
 * Inter is not preloaded — body copy can afford to swap.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — read your dog better`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Coco's guides for dog owners. Free, plain-spoken, and written for the stuff that actually comes up.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#FDF9F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        {/*
          Consent Mode v2 defaults, and they live HERE rather than alongside
          the loaders for two reasons.

          Next requires `beforeInteractive` to be placed in the root layout
          itself, not in a component the layout renders. And the only thing
          that makes this script worth having is that it runs BEFORE the tags
          initialise — Google reads consent state at that moment, and a
          default set afterwards silently applies to nothing already sent. So
          it sits where the ordering is visible.

          Skipped entirely when no tag will load, so we don't define a global
          `gtag` that queues events nothing will ever consume.
        */}
        {(GA4_ID || GTM_ID) && (
          <Script
            id="google-consent-default"
            strategy="beforeInteractive"
            // Built from our own constants — no user input reaches it.
            dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SNIPPET }}
          />
        )}

        {/* GTM's install check looks for this immediately inside <body>. */}
        <GoogleTagsNoScript />
        <GoogleTags />
        <AnalyticsBoot />
        {children}
      </body>
    </html>
  );
}
