import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/content/guides";
import { AnalyticsBoot } from "@/components/AnalyticsBoot";
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
        <AnalyticsBoot />
        {children}
      </body>
    </html>
  );
}
