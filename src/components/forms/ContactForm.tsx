"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { CONSENT_CONTACT } from "@/lib/content/consent";
import {
  EMAIL_MAX,
  EMAIL_RE,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
} from "@/lib/validation";
import { TextAreaField, TextField } from "@/components/forms/TextField";

/**
 * Contact form. Deliberately NOT a lead capture.
 *
 * It posts to /api/contact, not /api/subscribe: someone asking a question
 * hasn't opted into marketing, and routing them through the capture endpoint
 * would tag them as a lead and enrol them in a nurture sequence they never
 * agreed to. Different intent, different endpoint, different consent copy.
 *
 * Success is always inline — there's nothing to redirect to.
 */

type Status = "idle" | "submitting" | "success" | "error";
type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

const REQUEST_TIMEOUT_MS = 15_000;

const SERVER_COPY = {
  INVALID_EMAIL: "That doesn't look like an email address — mind checking it?",
  INVALID_MESSAGE: `Your message needs to be between ${MESSAGE_MIN} and ${MESSAGE_MAX.toLocaleString()} characters.`,
  BAD_REQUEST: "Something went wrong on our end. Try once more?",
  UPSTREAM_ERROR: "Can't reach us right now. Try again in a moment.",
  RATE_LIMITED: "That's a few too many tries. Give it a minute.",
  network: "Can't reach us right now. Try again in a moment.",
  /* Server returned ok but no `received` — see the submit handler. */
  discarded: "That didn't send — could you tap it once more?",
} as const;

const FIELDS: Field[] = ["name", "email", "message"];

/** Pure, module level — never invoked during render. */
function validateField(field: Field, raw: string): string | null {
  const v = raw.trim();

  if (field === "name") {
    if (!v) return "What should we call you?";
    if (v.length > NAME_MAX) return "That's longer than we can store, sorry.";
    return null;
  }

  if (field === "email") {
    if (!v) return "We need an email address to reply to.";
    if (v.length > EMAIL_MAX) return "That address is too long — mind checking it?";
    if (!EMAIL_RE.test(v)) return SERVER_COPY.INVALID_EMAIL;
    return null;
  }

  if (!v) return "Tell us what's up and we'll come back to you.";
  if (v.length < MESSAGE_MIN) return "A little more detail would help.";
  if (v.length > MESSAGE_MAX) {
    return `That's over ${MESSAGE_MAX.toLocaleString()} characters — could you trim it?`;
  }
  return null;
}

export function ContactForm({ className }: { className?: string }) {
  const uid = useId();

  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const startedAt = useRef<number | null>(null);
  const touched = useRef<Partial<Record<Field, boolean>>>({});
  const honeypot = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Don't leave a request in flight against an unmounted component.
  useEffect(() => () => abortRef.current?.abort(), []);

  const submitting = status === "submitting";
  const succeeded = status === "success";
  const locked = submitting || succeeded;

  /** `now` comes from the handler — never read from a global here. */
  function noteStart(now: number) {
    if (startedAt.current === null) startedAt.current = now;
  }

  function changeField(field: Field, value: string, now: number) {
    setValues((prev) => ({ ...prev, [field]: value }));
    noteStart(now);
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (formError) setFormError(null);
    if (status === "error") setStatus("idle");
  }

  function blurField(field: Field) {
    if (!touched.current[field] && !values[field].trim()) return;
    touched.current[field] = true;
    const problem = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: problem ?? undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;

    const next: Errors = {};
    for (const field of FIELDS) {
      touched.current[field] = true;
      const problem = validateField(field, values[field]);
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

    const abort = new AbortController();
    abortRef.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          message: values.message.trim(),
          consentVersion: CONSENT_CONTACT.version,
          pagePath: window.location.pathname,
          honeypot: honeypot.current?.value ?? "",
          formTimestamp: startedAt.current,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; received?: boolean; code?: keyof typeof SERVER_COPY }
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
        A 200 without `received` means the server silently discarded this —
        honeypot or the min-dwell timing check. Showing "message sent" for a
        message that was thrown away is the worst outcome here: the visitor
        waits for a reply that is never coming. Autofill can trip the timing
        check legitimately, and a retry goes through.
      */
      if (!data.received) {
        setFormError(SERVER_COPY.discarded);
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setFormError(SERVER_COPY.network);
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      abortRef.current = null;
    }
  }

  const formErrorId = `${uid}-form-error`;

  if (succeeded) {
    return (
      <div
        className={className}
        // Announced rather than silently swapped in.
        role="status"
        aria-live="polite"
      >
        <p className="t-h3">Got it — thanks.</p>
        <p className="t-body mt-2 text-ink/80">
          We read everything that comes in and usually reply within a couple of
          working days. If it&apos;s urgent and about your dog, please ring your
          vet rather than waiting on us.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      {/* Off-screen, not display:none — see CaptureForm for why. */}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${uid}-name`}
          name="name"
          type="text"
          label="Your name"
          value={values.name}
          error={errors.name}
          required
          placeholder="Sam"
          autoComplete="name"
          autoCapitalize="words"
          maxLength={NAME_MAX}
          enterKeyHint="next"
          readOnly={locked}
          onValueChange={(v) => changeField("name", v, Date.now())}
          onFocus={() => noteStart(Date.now())}
          onBlur={() => blurField("name")}
        />

        <TextField
          id={`${uid}-email`}
          name="email"
          type="email"
          label="Your email"
          value={values.email}
          error={errors.email}
          required
          placeholder="you@example.com"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          readOnly={locked}
          onValueChange={(v) => changeField("email", v, Date.now())}
          onFocus={() => noteStart(Date.now())}
          onBlur={() => blurField("email")}
        />
      </div>

      <TextAreaField
        id={`${uid}-message`}
        name="message"
        label="What's up?"
        value={values.message}
        error={errors.message}
        required
        rows={6}
        maxLength={MESSAGE_MAX}
        placeholder="Ask us anything — about a guide, a refund, or the weird thing your dog did this morning."
        readOnly={locked}
        className="mt-4"
        onValueChange={(v) => changeField("message", v, Date.now())}
        onFocus={() => noteStart(Date.now())}
        onBlur={() => blurField("message")}
      />

      <button
        type="submit"
        disabled={submitting}
        aria-describedby={formError ? formErrorId : undefined}
        className="btn-coral mt-5 min-h-11 w-full justify-center sm:w-auto"
      >
        {submitting ? "Sending…" : "Send it"}
      </button>

      <div id={formErrorId} role="alert" aria-live="assertive">
        {formError && (
          <p className="t-small mt-3 font-semibold text-ink">{formError}</p>
        )}
      </div>

      <p className="t-small mt-4 max-w-[58ch] text-ink-muted">
        {CONSENT_CONTACT.text}{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy
        </Link>
      </p>
    </form>
  );
}
