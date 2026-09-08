import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { SUPPORT_EMAIL, SITE_NAME } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Refunds",
  description:
    "14-day refund policy for Cool Stuff with Coco digital guides — how to ask and what happens.",
  alternates: { canonical: "/refund-policy" },
};

const UPDATED = "2026-09-08";

/** The window, in one place, so the copy and the heading can't drift. */
const REFUND_DAYS = 14;

/**
 * This page must be LIVE before checkout is. It's linked from the checkout in
 * GoHighLevel, and taking money without a reachable refund policy is the thing
 * that causes chargebacks and processor complaints.
 *
 * TODO(Eli): confirm the mechanics match the eventual checkout before you
 * switch payments on:
 *   - the printed fridge pack is a PHYSICAL item, so it behaves differently
 *     from a download and is described separately below;
 *   - if GHL's checkout shows its own refund text, the two must agree.
 * See docs/LEGAL-REVIEW.md.
 */
export default function RefundPolicy() {
  return (
    <LegalPage
      title={`${REFUND_DAYS}-day refunds`}
      intro={`If a paid guide isn't useful to you, ask within ${REFUND_DAYS} days and we'll refund it.`}
      updated={UPDATED}
    >
      <div className="callout">
        <p>
          <strong>
            {REFUND_DAYS} days, no explanation required, no hoops.
          </strong>{" "}
          Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the
          address you bought with and say you&apos;d like a refund. That&apos;s
          the whole process.
        </p>
      </div>

      <h2>The window</h2>
      <p>
        You have <strong>{REFUND_DAYS} days from the date of purchase</strong>.
        We go by the date on your receipt.
      </p>
      <p>
        You don&apos;t have to tell us why. If you do, we&apos;ll read it —
        it&apos;s the most useful feedback we get — but it isn&apos;t a
        condition.
      </p>

      <h2>What&apos;s covered</h2>
      <ul>
        <li>
          <strong>Digital guides and bundles.</strong> Fully refundable within
          the window, including if you&apos;ve already downloaded and read them.
          You keep the files — we&apos;re not going to pretend we can take a PDF
          back, and we&apos;re not going to make you delete it.
        </li>
        <li>
          <strong>The printed fridge pack</strong>, if you added one. Because
          it&apos;s a physical item that costs us to print and post, the refund
          covers what you paid for the pack minus actual postage if it has
          already shipped. If it hasn&apos;t shipped yet, you get all of it
          back. You don&apos;t need to return it.
        </li>
      </ul>

      <h2>How it&apos;s paid back</h2>
      <p>
        Refunds go back to the original payment method. We process them within{" "}
        <strong>3 business days</strong> of your email. How long it then takes to
        appear is up to your bank or card issuer — usually a few days, sometimes
        up to ten.
      </p>
      <p>
        We&apos;ll email you when it&apos;s processed, so you&apos;re not left
        wondering.
      </p>

      <h2>After a refund</h2>
      <p>
        Access to the paid material ends, and you come off the buyer emails.
        Refunding a purchase doesn&apos;t unsubscribe you from the free
        newsletter — use the unsubscribe link if you want that too.
      </p>

      <h2>After the {REFUND_DAYS} days</h2>
      <p>
        The window has to end somewhere, so past {REFUND_DAYS} days we
        don&apos;t refund as a matter of course. But email us anyway if
        something&apos;s wrong — if a file was corrupt, a download link never
        worked, or you were charged twice, we&apos;ll sort it out regardless of
        the date. Those aren&apos;t really refund requests, they&apos;re us
        having made a mistake.
      </p>

      <h2>Duplicate and accidental charges</h2>
      <p>
        Refunded in full, always, whenever you spot them. Just tell us.
      </p>

      <h2>Chargebacks</h2>
      <p>
        Please email us before disputing a charge with your bank. A chargeback
        costs us a fee and takes weeks; an email takes minutes and gets you the
        same money. We have never refused a refund inside the window.
      </p>

      <h2>Free guides</h2>
      <p>
        Nothing to refund — they&apos;re free. If you want to stop the emails
        that come with them, every email has an unsubscribe link.
      </p>

      <h2>Asking</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or use the{" "}
        <Link href="/contact">contact form</Link>. Include the email address you
        bought with so we can find the order.
      </p>
      <p>
        This policy is part of our <Link href="/terms">Terms</Link>.{" "}
        {SITE_NAME} may update it, and the date at the top shows when it last
        changed — the version in force when you bought is the one that applies
        to your purchase.
      </p>
    </LegalPage>
  );
}
