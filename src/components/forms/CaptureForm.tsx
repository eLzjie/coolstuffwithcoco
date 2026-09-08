"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { getAttribution } from "@/lib/utm";
import { consentForSubmit } from "@/lib/consent";
import type { LeadMagnet } from "@/lib/leadMagnet";
import { EMAIL_MAX, EMAIL_RE } from "@/lib/validation";

/**
 * The one capture form, used in three places.
 *
 * Email only. No name, no phone — nothing in this funnel sends SMS, A2P isn't
 * filed, and collecting numbers for an unusable channel is an obligation with
 * no payoff.
 *
 * States: idle | submitting | success | error, plus a separate field error.
 * That produces exactly the five behaviours in the spec; a literal
 * `validating` state would imply async validation that doesn't exist here.
 *
 * Rules that cost real completions if broken:
 *  - The email is NEVER cleared on error. Retyping is how you lose the lead.
 *  - The button is disabled ONLY while submitting. Disabling it when empty or
 *    invalid hides the affordance and stops the error ever being shown.
 *  - Double submit is prevented by state, not a debounce.
 *
 * The type import is from @/lib/leadMagnet, NOT @/lib/crm/ghl. The type would
 * be erased either way, but pointing client code at the CRM adapter is one
 * accidental value import away from pulling GHL_API_KEY handling into the
 * client bundle.
 */

type Props = {
  magnet: LeadMagnet;
  /** Where to go on success. Newsletter stays inline. */
  redirectTo?: string;
  className?: string;
};

type Status = "idle" | "submitting" | "success" | "error";

/** Long enough that the success state registers before the page changes. */
const REDIRECT_DELAY_MS = 700;

/** A hung request must not strand the form. */
const REQUEST_TIMEOUT_MS = 15_000;

const COPY = {
  empty: "Pop your email in and I'll send the guide over.",
  emptyNewsletter: "Pop your email in and I'll add you to the list.",
  malformed: "That doesn't look like an email address — mind checking it?",
  tooLong: "That address is too long — mind checking it?",
  INVALID_EMAIL: "That doesn't look like an email address — mind checking it?",
  BAD_REQUEST: "Something went wrong on our end. Try once more?",
  UPSTREAM_ERROR: "Can't reach us right now. Try again in a moment.",
  RATE_LIMITED: "That's a few too many tries. Give it a minute.",
  network: "Can't reach us right now. Try again in a moment.",
} as const;

export function CaptureForm({ magnet, redirectTo, className }: Props) {
  const router = useRouter();
  const uid = useId();
  const emailId = `${uid}-email`;
  const consentId = `${uid}-consent`;
  const errorId = `${uid}-error`;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * First-interaction time, for the server's timing heuristic.
   *
   * First interaction rather than mount: a form sitting in view while someone
   * reads the page would otherwise bank credit toward the window, and a fast
   * autofill after that would be discarded as a bot — losing a real lead
   * silently. Set lazily in an event handler, so no impure call during render.
   */
  const startedAt = useRef<number | null>(null);
  const startTracked = useRef(false);
  const touched = useRef(false);
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

  const isNewsletter = magnet === "newsletter";
  const submitting = status === "submitting";
  const succeeded = status === "success";

  /** First real interaction. Fires once. */
  function noteStart() {
    if (startedAt.current === null) startedAt.current = Date.now();
    if (startTracked.current) return;
    startTracked.current = true;
    track("form_start", { lead_magnet: magnet, content_name: magnet });
  }

  /** Validate on blur and submit only — never on keystroke. */
  function validate(value: string): string | null {
    const v = value.trim();
    if (!v) return isNewsletter ? COPY.emptyNewsletter : COPY.empty;
    if (v.length > EMAIL_MAX) return COPY.tooLong;
    if (!EMAIL_RE.test(v)) return COPY.malformed;
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || succeeded) return;

    touched.current = true;

    const problem = validate(email);
    if (problem) {
      setFieldError(problem);
      setFormError(null);
      setStatus("error");
      return;
    }

    setFieldError(null);
    setFormError(null);
    setStatus("submitting");

    const consent = consentForSubmit();
    const abort = new AbortController();
    const timeout = window.setTimeout(
      () => abort.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          leadMagnet: magnet,
          consent,
          pagePath: window.location.pathname,
          honeypot: honeypot.current?.value ?? "",
          formTimestamp: startedAt.current,
          attribution: getAttribution(),
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; eventId?: string; code?: keyof typeof COPY }
        | null;

      if (!res.ok || !data?.ok) {
        const code = data?.code;
        setFormError((code && COPY[code]) || COPY.network);
        setStatus("error");
        return;
      }

      /*
        Client half of the deduplicated pair, fired only when the server
        returned an eventId. A discarded submission (honeypot or timing)
        deliberately returns none, so this can't report a conversion with no
        contact and no CAPI counterpart behind it.
      */
      if (consent && data.eventId) {
        track("lead", {
          lead_magnet: magnet,
          content_name: magnet,
          eventId: data.eventId,
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
      // Covers both a network failure and the abort above. The email is
      // preserved either way, so a retry costs no retyping.
      setFormError(COPY.network);
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const message = fieldError ?? formError;

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

      <label htmlFor={emailId} className="t-h3 block">
        Your email
      </label>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id={emailId}
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            noteStart();
            // Clear BOTH optimistically, so a server error doesn't stay
            // rendered — and aria-invalid stuck on — while they fix the field.
            if (fieldError) setFieldError(null);
            if (formError) setFormError(null);
            if (status === "error") setStatus("idle");
          }}
          onFocus={noteStart}
          onBlur={() => {
            // Don't scold an untouched field just for being tabbed through.
            if (!touched.current && !email.trim()) return;
            touched.current = true;
            const problem = validate(email);
            if (problem) setFieldError(problem);
          }}
          readOnly={submitting || succeeded}
          required
          placeholder="you@example.com"
          /* These attributes cost real completions on mobile if skipped. */
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-describedby={message ? `${errorId} ${consentId}` : consentId}
          /* Only a FIELD error means the value is invalid. A rate limit or a
             network failure must not mark a perfectly good address as wrong. */
          aria-invalid={fieldError ? true : undefined}
          className="min-h-11 w-full flex-1 rounded-xl border-2 border-ink/30 bg-paper px-4 py-3 text-ink placeholder:text-ink/45 focus-visible:border-ink"
        />

        <button
          type="submit"
          /* Disabled ONLY while submitting. */
          disabled={submitting}
          className="btn-coral min-h-11 justify-center whitespace-nowrap"
        >
          {submitting
            ? "Sending…"
            : succeeded
              ? "Sent"
              : isNewsletter
                ? "Sign me up"
                : "Send the guide"}
        </button>
      </div>

      {/* Errors announced, not just shown. */}
      <div id={errorId} role="alert" aria-live="assertive">
        {message && (
          <p className="t-small mt-3 font-semibold text-ink">{message}</p>
        )}
      </div>

      {/* Success announced for screen readers even when we redirect. */}
      <div aria-live="polite">
        {succeeded && (
          <p className="t-small mt-3 font-semibold text-ink">
            {isNewsletter
              ? "You're on the list. Coco will be in touch."
              : "Sent — check your inbox. Taking you to your download…"}
          </p>
        )}
      </div>

      {/*
        Compliance copy. Visible before submit, never a tooltip, never
        collapsed. Submit plus this disclosure IS the permission — no
        pre-ticked box, no separate checkbox.

        Do not rewrite for punchiness: it has to keep honestly disclosing that
        ongoing marketing email follows the free guide.
      */}
      <p id={consentId} className="t-small mt-4 max-w-[52ch] text-ink-muted">
        {isNewsletter ? (
          <>
            Coco sends a few useful emails a month — unsubscribe any time. See
            our{" "}
            <a href="/privacy" className="underline underline-offset-2">
              privacy policy
            </a>
            .
          </>
        ) : (
          <>
            Free guide, straight to your inbox. Coco sends a few useful emails
            after — unsubscribe any time. See our{" "}
            <a href="/privacy" className="underline underline-offset-2">
              privacy policy
            </a>
            .
          </>
        )}
      </p>
    </form>
  );
}
