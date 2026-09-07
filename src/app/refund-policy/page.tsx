import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Refunds" };

export default function RefundPolicy() {
  return (
    <LegalPage
      title="Refunds"
      intent="Needs to cover: the refund window and how to ask for one, how it works for digital downloads, and how it works for the printed fridge pack, which is a physical item and behaves differently."
    >
      <p className="t-small mt-6 max-w-[68ch] rounded-lg border-2 border-ink/25 bg-butter p-4 text-ink">
        <strong className="font-semibold">Blocking for launch</strong> —
        compliance rule 5: this policy has to be live before checkout is. Checkout
        sits in GoHighLevel, so this route exists to be linked from there. Do not
        take money until it says something real.
      </p>
    </LegalPage>
  );
}
