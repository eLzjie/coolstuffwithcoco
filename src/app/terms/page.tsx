import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { SUPPORT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms for using Cool Stuff with Coco, including the limits of what the guides are.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "2026-09-08";

/**
 * TODO(Eli): two blanks a lawyer has to fill, deliberately left out rather
 * than invented:
 *
 *   1. The legal entity. "Cool Stuff with Coco" is the operating name; if
 *      there's an LLC or registered company behind it, that name belongs here
 *      and in the Privacy page.
 *   2. Governing law and venue. This needs your state — guessing one is worse
 *      than omitting the clause, so it's omitted.
 *
 * See docs/LEGAL-REVIEW.md.
 */
export default function Terms() {
  return (
    <LegalPage
      title="Terms"
      intro="The short version: the guides are information, not veterinary advice, and they're yours to use but not to resell."
      updated={UPDATED}
    >
      <p>
        These terms cover the {SITE_NAME} website at{" "}
        <a href={SITE_URL}>{SITE_URL}</a>, the free guides, the emails, and
        anything we sell. Using the site means you accept them.
      </p>

      <h2>The most important part</h2>
      <div className="callout">
        <p>
          <strong>
            Everything we publish is general information for dog owners. It is
            not veterinary advice, it is not a diagnosis, and it cannot replace
            your vet.
          </strong>
        </p>
        <p>
          Nothing here creates a veterinarian-client-patient relationship. We
          have not examined your dog and cannot. Our content is written for the
          general case, and your dog is a specific animal with a specific
          history.
        </p>
        <p>
          If your dog is unwell, or you are unsure, contact your vet or your
          nearest emergency clinic. Do not delay contacting them because of
          something you read here.
        </p>
      </div>

      <p>
        This applies with particular force to anything describing symptoms.
        Where we group signs into categories like &ldquo;go now&rdquo; and
        &ldquo;ring your vet today&rdquo;, those are <strong>categories to
        help you stop guessing</strong> — not triage you can rely on. A sign
        we&apos;ve put in the less urgent group can still be urgent in your
        dog. When in doubt, call. That&apos;s always the right answer and it
        never costs you anything to ask.
      </p>

      <h2>Money and insurance</h2>
      <p>
        Where we mention what things cost, those are ranges gathered from
        published sources to give you a sense of scale. They are not quotes.
        Real prices vary a lot by state, city and clinic.
      </p>
      <p>
        We are not licensed to advise on pet insurance and we don&apos;t. Where
        we describe options for paying for care, that is information about what
        exists — not a recommendation, not a comparison, and not advice. Talk to
        someone qualified before buying a financial product.
      </p>

      <h2>What you can do with the guides</h2>
      <p>
        The free guides are yours to keep, read, print and stick on your fridge.
        Share them with the people who look after your dog.
      </p>
      <p>Please don&apos;t:</p>
      <ul>
        <li>Sell them, or bundle them into something you sell.</li>
        <li>
          Republish them — in whole or in large part — as your own content, on a
          website, in a course, or in a membership.
        </li>
        <li>Strip our name off them and pass them around as unattributed.</li>
        <li>
          Feed them into a service that resells the content as its own output.
        </li>
      </ul>
      <p>
        Quoting a bit with credit and a link back is fine and welcome. That&apos;s
        not what this clause is about.
      </p>

      <h2>Paid products</h2>
      <p>
        Anything we sell is a digital product delivered by download or by a
        link. You get a personal, non-transferable licence to use it — the same
        restrictions above apply.
      </p>
      <p>
        Refunds are covered separately on the{" "}
        <Link href="/refund-policy">refund policy</Link> page.
      </p>
      <p>
        Prices can change. The price shown at the moment you buy is the price
        that applies.
      </p>

      <h2>Your account and your email</h2>
      <p>
        There&apos;s no account to create. Give us an accurate email address, or
        the guide has nowhere to go. If you sign someone else up without their
        say-so, we&apos;ll remove them.
      </p>

      <h2>The site itself</h2>
      <p>
        We try to keep everything up and correct, but we don&apos;t promise the
        site is always available or entirely free of mistakes. We may change,
        add or remove content and features. If we find an error in a guide,
        we&apos;ll fix it — and if it matters, we&apos;ll tell the people who
        downloaded it.
      </p>

      <h2>Links to other places</h2>
      <p>
        Where we link out — to a poison helpline, a clinic finder, a
        manufacturer — we don&apos;t control those sites and aren&apos;t
        responsible for them. Emergency phone numbers we publish are ones we
        believe to be correct, but please confirm them yourself and keep your
        own vet&apos;s number to hand.
      </p>

      <h2>Limits on our liability</h2>
      <p>
        To the fullest extent the law allows, {SITE_NAME} is not liable for
        indirect, incidental or consequential losses arising from using this
        site or our content. Where liability can&apos;t be excluded, it is
        limited to what you paid us — which for a free guide is nothing.
      </p>
      <p>
        Nothing in these terms limits liability for anything that can&apos;t
        lawfully be limited.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date at the top shows when they last
        changed. Continuing to use the site after a change means you accept the
        updated version.
      </p>

      <h2>Questions</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>, or the{" "}
        <Link href="/contact">contact form</Link>.
      </p>
    </LegalPage>
  );
}
