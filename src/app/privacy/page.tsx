import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { SUPPORT_EMAIL, SITE_NAME } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Cool Stuff with Coco collects, why, who it's shared with, and how to get it deleted.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2026-09-08";

/**
 * Written against the ACTUAL data flows in this codebase, not a template:
 *
 *   collection      src/components/forms/CaptureForm.tsx
 *   attribution     src/lib/utm.ts            (sessionStorage coco_attribution)
 *   consent gate    src/lib/consent.ts        (localStorage coco_consent_v1)
 *   CRM writes      src/lib/crm/ghl.ts
 *   Meta CAPI       src/lib/meta/capi.ts      (SHA-256 email, IP, UA, fbclid)
 *   GA4 + GTM       src/components/analytics/Tags.tsx
 *   Clarity         installed in the GTM container, not in this repo
 *   consent mode    src/lib/analytics/consentMode.ts
 *   rate limiting   src/lib/rateLimit.ts      (IP in Upstash Redis)
 *
 * If any of those change, this page is wrong until it's updated. That's the
 * cost of a policy that describes reality instead of hedging.
 */
export default function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      intro="What we collect, why we collect it, and how to make us delete it."
      updated={UPDATED}
    >
      <p>
        {SITE_NAME} runs this site and the emails that come from it. This page
        explains what happens to your information in plain terms. If anything
        here isn&apos;t clear, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and ask.
      </p>

      <h2>What we collect</h2>

      <h3>Things you type in</h3>
      <ul>
        <li>
          <strong>Email address.</strong> Required — it&apos;s where the guide
          goes and how the emails reach you.
        </li>
        <li>
          <strong>First name.</strong> Required on the guide forms, so the
          emails can address you like a person.
        </li>
        <li>
          <strong>Last name.</strong> Optional.
        </li>
        <li>
          <strong>Phone number.</strong> Optional, and never required to get a
          guide. If you give us one we may use it to follow up about what you
          asked for. We don&apos;t sell it and we don&apos;t pass it to other
          companies to market to you.
        </li>
        <li>
          <strong>Anything you write in the contact form.</strong> Kept so we
          can reply.
        </li>
      </ul>

      <h3>Things collected automatically</h3>
      <ul>
        <li>
          <strong>Where you came from.</strong> Campaign tags in the link you
          clicked (<code>utm_source</code>, <code>utm_medium</code>,{" "}
          <code>utm_campaign</code>, <code>utm_content</code>,{" "}
          <code>utm_term</code>), a Meta click identifier if there was one, the
          site that linked to you, and which page you landed on. This is how we
          tell which ads are worth running.
        </li>
        <li>
          <strong>Your IP address and browser user-agent.</strong> Used to stop
          the forms being abused, and sent to Meta as part of matching a
          conversion (see below).
        </li>
      </ul>

      <p>
        We do <strong>not</strong> collect your address, date of birth, or
        payment details on this site. If we ever sell something, checkout is
        handled by a payment provider and card details never reach us.
      </p>

      <h2>Why we collect it</h2>
      <ul>
        <li>To send you the guide you asked for.</li>
        <li>
          To send you follow-up emails about dogs, which you agreed to when you
          submitted the form, and can stop at any time.
        </li>
        <li>
          To measure which ads and pages actually work, so we don&apos;t waste
          money on ones that don&apos;t.
        </li>
        <li>To keep the forms from being flooded by bots.</li>
        <li>To reply when you contact us.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We don&apos;t sell your personal information. We use a small number of
        companies to actually run this thing:
      </p>
      <ul>
        <li>
          <strong>GoHighLevel</strong> — our customer records and email
          sending. Your name, email, phone if you gave one, and the campaign
          details above are stored there.
        </li>
        <li>
          <strong>Meta</strong> — when you submit a form and tracking is
          allowed in your browser, we tell Meta a conversion happened. Your
          email is <strong>hashed</strong> before it&apos;s sent (turned into an
          irreversible string) so Meta can match it without receiving the
          address itself. Your IP address, browser user-agent and Meta click id
          are also included.
        </li>
        <li>
          <strong>Google</strong> — Analytics and Tag Manager. This tells
          Google which pages you looked at, roughly where you are (from your
          IP address, which Google truncates), and what device and browser
          you&apos;re using. It&apos;s how we know whether the guides are
          worth writing. We don&apos;t send Google your name, email or phone
          number.
        </li>
        <li>
          <strong>Microsoft</strong> — Clarity, which records how pages get
          used: where you scroll, what you tap, and a replay of your visit so
          we can see where a page is confusing. Text you type into forms is
          masked before it leaves your browser, so your name, email and
          anything you write to us are not in those recordings. See the
          exception under &ldquo;Your choices&rdquo; below: Clarity is the one
          thing our tracking notice does not yet switch off.
        </li>
        <li>
          <strong>Vercel</strong> — hosting. Standard server logs.
        </li>
        <li>
          <strong>Upstash</strong> — a short-lived counter keyed to your IP
          address, used only for rate limiting.
        </li>
      </ul>
      <p>
        We&apos;d also hand information over if the law required it. That&apos;s
        the whole list.
      </p>

      <h2>Cookies and browser storage</h2>
      <p>This site is deliberately light on this. What&apos;s used:</p>
      <ul>
        <li>
          <code>coco_attribution</code> — session storage. Remembers which
          campaign brought you, so it can be recorded if you submit a form.
          Cleared when you close the tab.
        </li>
        <li>
          <code>coco_consent_v1</code> — local storage. Remembers your tracking
          preference so you&apos;re not asked repeatedly.
        </li>
        <li>
          <strong>Meta Pixel cookies</strong> (including <code>_fbp</code>) —
          only set when the Pixel loads.
        </li>
        <li>
          <strong>Microsoft Clarity cookies</strong> (<code>_clck</code> and{" "}
          <code>_clsk</code>) — how Clarity ties the parts of one visit
          together into a single replay. Unlike the two above,{" "}
          <strong>these are not controlled by your tracking preference</strong>
          . Clarity is loaded through our tag manager rather than by this site
          directly, so turning tracking off here does not currently stop it.
          Clearing your browser storage does, and so does your
          browser&apos;s tracking protection.
        </li>
        <li>
          <strong>Google Analytics cookies</strong> (<code>_ga</code> and
          similar) — used to tell one visit apart from the next so a returning
          visitor isn&apos;t counted as a new person. Your{" "}
          <code>coco_consent_v1</code> preference above is passed to Google
          before its tag starts, and if you&apos;ve turned tracking off it
          stops setting these.
        </li>
      </ul>
      <p>
        Clearing your browser storage removes all of these. Nothing on this site
        breaks if you do.
      </p>

      <h2>Email</h2>
      <p>
        Every email we send has an unsubscribe link. Using it stops the emails,
        and we honour it immediately — it isn&apos;t a &ldquo;reduce
        frequency&rdquo; button.
      </p>
      <p>
        There&apos;s no confirmation email to click before you get your guide.
        Submitting the form is the permission.
      </p>

      <h2>Text messages and calls</h2>
      <p>
        We are not currently set up to send text messages, and we don&apos;t run
        an automated dialler. A phone number is optional, and giving one is
        never a condition of receiving a guide. If we start using phone numbers
        differently than described here, we&apos;ll update this page and say so
        in an email first.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your contact record until you unsubscribe or ask us to delete
        it. Rate-limiting counters expire within the hour. Server logs are kept
        for a short period by our host.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          <strong>Stop the emails</strong> — unsubscribe link, any email.
        </li>
        <li>
          <strong>See what we hold</strong> — email us and we&apos;ll tell you.
        </li>
        <li>
          <strong>Fix something wrong</strong> — email us and we&apos;ll correct
          it.
        </li>
        <li>
          <strong>Delete it</strong> — email us and we&apos;ll remove your
          record. We keep a minimal note of the unsubscribe itself so we
          don&apos;t accidentally email you again.
        </li>
        <li>
          <strong>Turn off tracking</strong> — there&apos;s a notice at the
          bottom of the screen on your first visit with an{" "}
          <strong>Accept</strong> and a <strong>Decline</strong> button, both
          one tap. Declining stops the analytics and advertising cookies this
          site sets. If you already chose and want to change it, clear the
          browser storage listed above and the notice comes back.
        </li>
        <li>
          <strong>The one exception, stated plainly</strong> — Declining does
          not currently stop Microsoft Clarity, because it loads through our
          tag manager rather than from this site. We&apos;re fixing that. Until
          then, clearing your browser storage or using your browser&apos;s
          tracking protection is what stops it.
        </li>
      </ul>
      <p>
        Depending on where you live you may have additional rights over your
        personal information. Email us either way — we&apos;ll handle the
        request the same way regardless of where you are.
      </p>

      <h2>Children</h2>
      <p>
        This site is meant for adults looking after dogs. It isn&apos;t directed
        at children, and we don&apos;t knowingly collect information from
        anyone under 13. If you think a child has given us their details, email
        us and we&apos;ll delete them.
      </p>

      <h2>Where your information is handled</h2>
      <p>
        Our providers are based in the United States, so your information is
        processed there.
      </p>

      <h2>Changes to this page</h2>
      <p>
        If we change how any of this works, we&apos;ll update this page and move
        the date at the top. Material changes to how we use your information get
        an email, not just a quiet edit.
      </p>

      <h2>One thing worth repeating</h2>
      <div className="callout">
        <p>
          The guides share general information for dog owners. They are not
          veterinary care and can&apos;t replace your vet. See{" "}
          <Link href="/terms">Terms</Link>.
        </p>
      </div>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> — or use the{" "}
        <Link href="/contact">contact form</Link>. A real person reads it.
      </p>
    </LegalPage>
  );
}
