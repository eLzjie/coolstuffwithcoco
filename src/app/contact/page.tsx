import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <LegalPage
      title="Get in touch"
      intent="Needs: the support email address, a realistic reply time, and where to send anything about privacy or a refund. No phone number unless someone is going to answer it."
    />
  );
}
