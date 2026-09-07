import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Terms" };

export default function Terms() {
  return (
    <LegalPage
      title="Terms"
      intent="Needs to cover: what the guides are and are not, that nothing on the site or in the guides is veterinary advice, limits of liability, the licence someone gets when they download a guide, and the terms attached to anything paid."
    />
  );
}
