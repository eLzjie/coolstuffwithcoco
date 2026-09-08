import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { GuideSplit } from "@/components/home/GuideSplit";
import { AboutCoco } from "@/components/home/AboutCoco";
import { Statement } from "@/components/home/Statement";
import { SeenCoco } from "@/components/home/SeenCoco";
import { Library } from "@/components/home/Library";
import { Community } from "@/components/home/Community";
import { InboxPreview } from "@/components/home/InboxPreview";
import { Footer } from "@/components/layout/Footer";
import { IG_URL, SITE_NAME, SITE_URL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: `${SITE_NAME} — read your dog better`,
  description:
    "Coco's free guides for dog owners: read her body language, and know what a real emergency costs before you're standing at the counter.",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — read your dog better`,
    description:
      "Coco's free guides for dog owners. Plain-spoken, and written for the stuff that actually comes up.",
    url: "/",
  },
};

/** JSON-LD Organization. Only verifiable facts — no invented stats or claims. */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Free, plain-spoken guides for dog owners, fronted by Coco the French Bulldog.",
  sameAs: [IG_URL],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static object we author — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <main id="main">
        <Hero />
        <GuideSplit />
        <AboutCoco />
        <Statement />
        <SeenCoco />
        <Library />
        <Community />
        <InboxPreview />
      </main>

      <Footer />
    </>
  );
}
