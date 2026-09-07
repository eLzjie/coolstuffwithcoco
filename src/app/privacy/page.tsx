import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      intent="Needs to cover: what we collect at email capture, that contact records and email delivery are handled in GoHighLevel, the Meta Pixel and Conversions API, campaign parameters stored against the contact, the lawful basis for EU/UK visitors, how someone unsubscribes or asks to be deleted, and who to contact about it."
    />
  );
}
