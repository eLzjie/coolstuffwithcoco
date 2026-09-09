"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { getAttribution } from "@/lib/utm";
import { consentForSubmit } from "@/lib/consent";
import type { LeadMagnet } from "@/lib/leadMagnet";
import { CONSENT_GUIDE, CONSENT_NEWSLETTER } from "@/lib/content/consent";
import { EMAIL_MAX, EMAIL_RE, NAME_MAX } from "@/lib/validation";
import { TextField } from "@/components/forms/TextField";
import { FormSuccess } from "@/components/forms/FormSuccess";
import { rememberCapture } from "@/lib/recentCapture";

/**
 * The one capture form, used in three places.
 *
 * ---------------------------------------------------------------------------
 * FIELDS DIFFER BY MAGNET, ON PURPOSE
 * ---------------------------------------------------------------------------
 * The two guides collect first name (required) and email. The newsletter
 * collects email only — it's a subscribe, not a delivery, and there's nothing
 * to personalise yet.
 *
 * ---------------------------------------------------------------------------
 * LAST NAME AND PHONE WERE REMOVED (2026-09-09)
 * ---------------------------------------------------------------------------
 * Client feedback, twice: "we're asking too much, let's just do name and
 * email". Four fields on a free guide is a lot to ask of someone who arrived
 * thirty seconds ago from an ad.
 *
 * This was cheap because nothing downstream depended on either field. The
 * route treats all three of firstName/lastName/phone as optional and
 * null-tolerant, the CRM adapter spreads lastName conditionally, and delivery
 * fires off the `lead-magnet-*` tag rather than off any contact detail. So no
 * server or CRM change was needed at all.
 *
 * What DID have to change was the consent disclosure: two of its four
 * sentences described the phone field, so leaving it would have been a
 * dangling reference to something the form no longer collects. Rewritten and
 * CONSENT_VERSION bumped — see lib/content/consent.ts.
 *
 * The phone plumbing that remains untouched: the server still accepts and
 * validates a phone if one is posted, and `phone_number` still exists as a GHL
 * custom field. So re-adding the field later is a client-only change. Note the
 * TCPA reasoning in consent.ts before you do — collecting a number brings
 * obligations that a free-guide form doesn't otherwise carry.
 *
 * ---------------------------------------------------------------------------
 * Rules that cost real completions if broken
 * ---------------------------------------------------------------------------
 *  - Values are NEVER cleared on error. Retyping is how you lose the lead.
 *  - The button is disabled ONLY while submitting. Disabling it on an
 *    incomplete form hides the affordance and stops the error ever showing.
 *  - Double submit is prevented by state, not a debounce.
 *  - Validation runs on blur and submit, never on keystroke.
 *
 * ---------------------------------------------------------------------------
 * React 19 rules this file has to respect
 * ---------------------------------------------------------------------------
 *  - `validateField` is module level and pure. A helper INVOKED during render
 *    that reads a ref is a purity violation, so nothing like that exists here.
 *  - `Date.now()` is only ever called inside an event handler, never in a
 *    function the analyser can't prove is event-only.
 *  - `TextField` is its own module, not a component declared in this render.
 */

type Props = {
  magnet: LeadMagnet;
  /** Where to go on success. Newsletter stays inline. */
  redirectTo?: string;
  className?: string;
};

type Status = "idle" | "submitting" | "success" | "error";
type Field = "firstName" | "email";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

/** Long enough that the success state registers before the page changes. */
/*
  Long enough to register the success state, short enough not to feel like a
  stall. This was 700ms, which was right when success was one line of text
  appended under the form — as a full panel with artwork it flashed and then
  yanked the page away, which reads as a glitch.

  Deliberately NOT longer. The thank-you page carries the actual download, and
  the whole delivery strategy rests on getting the visitor there — the sending
  domain is days old, so the page is the guide's real delivery mechanism. Every
  extra millisecond here is delay on the thing they came for.
*/
const REDIRECT_DELAY_MS = 1200;

/** A hung request must not strand the form. */
const REQUEST_TIMEOUT_MS = 15_000;

const SERVER_COPY = {
  INVALID_EMAIL: "That doesn't look like an email address — mind checking it?",
  BAD_REQUEST: "Something went wrong on our end. Try once more?",
  UPSTREAM_ERROR: "Can't reach us right now. Try again in a moment.",
  RATE_LIMITED: "That's a few too many tries. Give it a minute.",
  network: "Can't reach us right now. Try again in a moment.",
  /* Shown when the server returns ok but no eventId — see the submit handler. */
  discarded: "That didn't go through — could you tap it once more?",
} as const;

const GUIDE_FIELDS: Field[] = ["firstName", "email"];
const NEWSLETTER_FIELDS: Field[] = ["email"];

/** Pure. Returns a message, or null when the value is acceptable. */
function validateField(
  field: Field,
  raw: string,
  isNewsletter: boolean,
): string | null {
  const v = raw.trim();

  if (field === "email") {
    if (!v) {
      return isNewsletter
        ? "Pop your email in and I'll add you to the list."
        : "Pop your email in and I'll send the guide over.";
    }
    if (v.length > EMAIL_MAX) return "That address is too long — mind checking it?";
    if (!EMAIL_RE.test(v)) return SERVER_COPY.INVALID_EMAIL;
    return null;
  }

  // firstName — the only other field, and required.
  if (!v) return "Just a first name is fine.";
  if (v.length > NAME_MAX) return "That's longer than we can store, sorry.";
  return null;
}

export function CaptureForm({ magnet, redirectTo, className }: Props) {
  const router = useRouter();
  const uid = useId();

  const isNewsletter = magnet === "newsletter";
  const consent = isNewsletter ? CONSENT_NEWSLETTER : CONSENT_GUIDE;
  const fields = isNewsletter ? NEWSLETTER_FIELDS : GUIDE_FIELDS;

  const [values, setValues] = useState<Values>({
    firstName: "",
    email: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * First-interaction time for the server's timing heuristic. First
   * interaction rather than mount, so a form sitting in view while someone
   * reads the page doesn't bank credit toward the window.
   */
  const startedAt = useRef<number | null>(null);
  const startTracked = useRef(false);
  const touched = useRef<Partial<Record<Field, boolean>>>({});
  const honeypot = useRef<HTMLInputElement>(null);
  const redirectTimer = useRef<number | null>(null);

  // A component unmounted mid-redirect must not navigate afterwards.
  useEffect(
    () => () => {
      if (redirectTimer.current !== null) {
        window.clearTimeout(redirectTimer.current);
      }
    },
    [],
  );

  const submitting = status === "submitting";
  const succeeded = status === "success";

  /** `now` is passed in by the handler — never read from a global here. */
  function noteStart(now: number) {
    if (startedAt.current === null) startedAt.current = now;
    if (startTracked.current) return;
    startTracked.current = true;
    track("form_start", { lead_magnet: magnet, content_name: magnet });
  }

  function changeField(field: Field, value: string, now: number) {
    setValues((prev) => ({ ...prev, [field]: value }));
    noteStart(now);
    // Clear optimistically so a message doesn't nag while they fix it, and so
    // a server error doesn't linger with aria-invalid stuck on.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (formError) setFormError(null);
    if (status === "error") setStatus("idle");
  }

  function blurField(field: Field) {
    // Don't scold an untouched optional field just for being tabbed past.
    if (!touched.current[field] && !values[field].trim()) return;
    touched.current[field] = true;
    const problem = validateField(field, values[field], isNewsletter);
    setErrors((prev) => ({ ...prev, [field]: problem ?? undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || succeeded) return;

    const next: Errors = {};
    for (const field of fields) {
      touched.current[field] = true;
      const problem = validateField(field, values[field], isNewsletter);
      if (problem) next[field] = problem;
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      setFormError(null);
      setStatus("error");
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");

    const consented = consentForSubmit();
    /*
      Bound once. The request body and the sessionStorage stash must be the
      same string — if they normalise differently, the waitlist would tag an
      address that isn't the contact we just created.
    */
    const submittedEmail = values.email.trim().toLowerCase();
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          email: submittedEmail,
          // Omitted entirely for the newsletter rather than sent empty, so a
          // blank can't overwrite a name captured on an earlier submission.
          ...(isNewsletter ? {} : { firstName: values.firstName.trim() }),
          leadMagnet: magnet,
          consent: consented,
          consentVersion: consent.version,
          pagePath: window.location.pathname,
          honeypot: honeypot.current?.value ?? "",
          formTimestamp: startedAt.current,
          attribution: getAttribution(),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; eventId?: string; code?: keyof typeof SERVER_COPY }
        | null;

      if (!res.ok || !data?.ok) {
        const code = data?.code;
        if (code === "INVALID_EMAIL") {
          setErrors({ email: SERVER_COPY.INVALID_EMAIL });
        } else {
          setFormError((code && SERVER_COPY[code]) || SERVER_COPY.network);
        }
        setStatus("error");
        return;
      }

      /*
        A 200 with NO eventId means the server silently discarded this — the
        honeypot or the min-dwell timing check. It is the only path that omits
        one; a real capture always carries it.

        Treating that as success was actively harmful: it announced "check your
        inbox" and then redirected to the download page for a submission that
        created no contact and sent no guide. A bot doesn't care, but the
        timing check catches real people — browser autofill populates every
        field in one gesture, so first-interaction-to-submit under the
        threshold is easy to hit by accident.

        A retry does go through (the dwell clock keeps running from the first
        interaction), so "try once more" is honest and actionable rather than
        a dead end. It does concede slightly more to a honeypot bot than the
        old silent 200; misleading a real person is the worse failure.
      */
      /*
        Remember the address for the thank-you page's waitlist, so the very
        next screen doesn't ask for something we were given four seconds ago.
        sessionStorage, never the URL — see lib/recentCapture.ts.

        Placed AFTER the discard check below would be wrong: we only want to
        remember an address that actually landed. Placed here, it runs only on
        a genuine success.
      */
      if (data.eventId) rememberCapture(submittedEmail);

      if (!data.eventId) {
        setFormError(SERVER_COPY.discarded);
        setStatus("error");
        return;
      }

      if (consented) {
        track("lead", {
          lead_magnet: magnet,
          content_name: magnet,
          eventId: data.eventId,
          /*
            Which page the form was on. Needed because the split-test variants
            share a magnet: `/decode` and `/decode/b` both submit
            `magnet="decode"`, deliberately — a new LeadMagnet value would mean
            a new GHL delivery tag, and delivery is triggered off that tag.

            So the pathname is the only thing separating the two arms in GA4.
            Without it every `generate_lead` is attributed to "decode" and the
            test can't be read. `ga4Params` forwards `page_path` already.

            Attribution on the CRM side is separate and already handled: utm.ts
            records `landingPage` at first touch, which is what lands in the
            contact's `landing_page` field.
          */
          page_path: window.location.pathname,
        });
      }

      setStatus("success");

      if (redirectTo) {
        redirectTimer.current = window.setTimeout(
          () => router.push(redirectTo),
          REDIRECT_DELAY_MS,
        );
      }
    } catch {
      // Covers a network failure and the abort above. Values are preserved
      // either way, so a retry costs no retyping.
      setFormError(SERVER_COPY.network);
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const formErrorId = `${uid}-form-error`;
  const locked = submitting || succeeded;

  /*
    The form is REPLACED on success, not annotated.

    Newsletter submits never navigate, so this panel is the only feedback the
    visitor ever gets. Guide submits do navigate, so theirs is compact — see
    the note on REDIRECT_DELAY_MS.

    Returning before the <form> also means the visitor's details stop sitting
    on screen in editable fields after they have been accepted, which is what
    made the old version read as "validated" rather than "done".
  */
  if (succeeded) {
    return isNewsletter ? (
      <FormSuccess className={className} heading="You're on the list.">
        A couple of emails a month, starting with the next one. Every single
        one has an unsubscribe link — no hard feelings if you use it.
      </FormSuccess>
    ) : (
      <FormSuccess compact className={className} heading="Sent — check your inbox.">
        Taking you to your download now.
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      {/*
        Off-screen, NOT display:none — some bots skip hidden inputs but fill
        ones that are merely positioned away. Never tell a bot it failed.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor={`${uid}-hp`}>Leave this empty</label>
        <input
          ref={honeypot}
          id={`${uid}-hp`}
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {!isNewsletter && (
        <>
          {/*
            One field, full width. It was a two-column grid holding first and
            last name, with phone below — see the note at the top of this file
            for why those went.
          */}
          <TextField
            id={`${uid}-firstName`}
            name="firstName"
            type="text"
            label="What should I call you?"
            value={values.firstName}
            error={errors.firstName}
            required
            placeholder="Sam"
            autoComplete="given-name"
            autoCapitalize="words"
            maxLength={NAME_MAX}
            enterKeyHint="next"
            readOnly={locked}
            onValueChange={(v) => changeField("firstName", v, Date.now())}
            onFocus={() => noteStart(Date.now())}
            onBlur={() => blurField("firstName")}
          />
        </>
      )}

      <TextField
        id={`${uid}-email`}
        name="email"
        type="email"
        label={isNewsletter ? "Your email" : "Where should the guide go?"}
        value={values.email}
        error={errors.email}
        required
        placeholder="you@example.com"
        /* These attributes cost real completions on mobile if skipped. */
        inputMode="email"
        autoComplete="email"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        readOnly={locked}
        className={isNewsletter ? undefined : "mt-4"}
        onValueChange={(v) => changeField("email", v, Date.now())}
        onFocus={() => noteStart(Date.now())}
        onBlur={() => blurField("email")}
      />

      <button
        type="submit"
        /* Disabled ONLY while submitting. */
        disabled={submitting}
        aria-describedby={formError ? formErrorId : undefined}
        className="btn-coral mt-5 min-h-11 w-full justify-center sm:w-auto"
      >
        {/*
          No "Sent" state — the button cannot be seen in that state any more,
          because a successful submit replaces the entire form.
        */}
        {submitting ? "Sending…" : isNewsletter ? "Sign me up" : "Send me the guide"}
      </button>

      {/* Form-level failures (server, network, throttle) announced. */}
      <div id={formErrorId} role="alert" aria-live="assertive">
        {formError && (
          <p className="t-small mt-3 font-semibold text-ink">{formError}</p>
        )}
      </div>

      {/*
        The old inline success line lived here. It is gone because the whole
        form is now replaced on success (see the early return above), and
        FormSuccess carries its own status role so the outcome is still
        announced to screen readers.
      */}

      {/*
        Compliance copy. Visible before submit, never a tooltip, never
        collapsed. Submit plus this disclosure IS the permission — no
        pre-ticked box, no separate checkbox.

        The wording lives in lib/content/consent.ts with a version string that
        is stored against the contact, so a given contact can be traced back to
        the exact disclosure they saw. Change it there, not here.
      */}
      <p className="t-small mt-4 max-w-[58ch] text-ink-muted">
        {consent.text}{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>
      </p>
    </form>
  );
}
