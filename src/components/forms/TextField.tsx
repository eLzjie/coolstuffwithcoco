"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

/**
 * One labelled text input with its error message.
 *
 * Module level, NOT nested inside CaptureForm. A component declared inside
 * another component's render is a new component type on every render, which
 * remounts the subtree and loses focus mid-typing — React's
 * `react-hooks/static-components` rule rejects it, correctly.
 *
 * The error is wired with `aria-describedby` and announced via `role="alert"`,
 * and `aria-invalid` is driven by the field's own error only — a server or
 * network failure must not mark a perfectly good value as invalid.
 */
export function TextField({
  id,
  label,
  optional,
  value,
  error,
  hint,
  onValueChange,
  onFocus,
  onBlur,
  readOnly,
  className,
  ...input
}: {
  id: string;
  label: ReactNode;
  optional?: boolean;
  value: string;
  error?: string;
  hint?: string;
  onValueChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  readOnly: boolean;
  className?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "value" | "onChange" | "onFocus" | "onBlur" | "readOnly" | "className"
>) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="t-h3 block">
        {label}
        {optional && (
          <span className="t-small font-normal text-ink-muted"> (optional)</span>
        )}
      </label>

      <input
        {...input}
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="mt-2 min-h-11 w-full rounded-xl border-2 border-ink/30 bg-paper px-4 py-3 text-ink placeholder:text-ink/45 focus-visible:border-ink"
      />

      {hint && !error && (
        <p id={hintId} className="t-small mt-1.5 text-ink-muted">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="t-small mt-1.5 font-semibold text-ink"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Multi-line sibling of TextField, for the contact form's message.
 *
 * Same wiring rules: real label, `aria-describedby` to the error,
 * `role="alert"` so it's announced, `aria-invalid` from this field only.
 */
export function TextAreaField({
  id,
  label,
  value,
  error,
  hint,
  onValueChange,
  onFocus,
  onBlur,
  readOnly,
  className,
  ...textarea
}: {
  id: string;
  label: ReactNode;
  value: string;
  error?: string;
  hint?: string;
  onValueChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  readOnly: boolean;
  className?: string;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id" | "value" | "onChange" | "onFocus" | "onBlur" | "readOnly" | "className"
>) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="t-h3 block">
        {label}
      </label>

      <textarea
        {...textarea}
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="mt-2 w-full rounded-xl border-2 border-ink/30 bg-paper px-4 py-3 text-ink placeholder:text-ink/45 focus-visible:border-ink"
      />

      {hint && !error && (
        <p id={hintId} className="t-small mt-1.5 text-ink-muted">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="t-small mt-1.5 font-semibold text-ink"
        >
          {error}
        </p>
      )}
    </div>
  );
}
