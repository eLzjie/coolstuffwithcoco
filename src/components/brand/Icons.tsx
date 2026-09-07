/**
 * Brand element icon set: paw, bone, heart, speech bubble, cross, ball.
 *
 * Used as sparse recurring furniture. They inherit `currentColor` so they can
 * sit on any of the pastel washes with ink fill and stay AA-compliant.
 *
 * Decorative by default (aria-hidden). Pass a `title` only when the icon is
 * carrying meaning no adjacent text already carries.
 */

type IconProps = {
  className?: string;
  title?: string;
};

const base = (title?: string) =>
  title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const, focusable: false as const };

export function Paw({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" {...base(title)}>
      <ellipse cx="24" cy="31" rx="11" ry="9" />
      <ellipse cx="11" cy="19" rx="5" ry="6.5" />
      <ellipse cx="19.5" cy="12" rx="5" ry="7" />
      <ellipse cx="28.5" cy="12" rx="5" ry="7" />
      <ellipse cx="37" cy="19" rx="5" ry="6.5" />
    </svg>
  );
}

export function Bone({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" {...base(title)}>
      <rect x="14" y="20" width="20" height="8" rx="2" />
      <circle cx="12" cy="19" r="6" />
      <circle cx="12" cy="29" r="6" />
      <circle cx="36" cy="19" r="6" />
      <circle cx="36" cy="29" r="6" />
    </svg>
  );
}

export function Heart({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" {...base(title)}>
      <path d="M24 41c-1 0-1.9-.4-2.6-1L8.6 27.2A11.4 11.4 0 0 1 24 10.6a11.4 11.4 0 0 1 15.4 16.6L26.6 40c-.7.6-1.6 1-2.6 1Z" />
    </svg>
  );
}

export function Speech({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" {...base(title)}>
      <path d="M24 7c-9.9 0-18 6.3-18 14.1 0 4.5 2.7 8.5 6.9 11.1-.5 2.6-1.8 5-3.6 6.8 3.5-.4 6.8-1.8 9.5-3.9 1.7.3 3.4.5 5.2.5 9.9 0 18-6.3 18-14.5S33.9 7 24 7Z" />
    </svg>
  );
}

/** Veterinary cross — used only on /vetbill, never as a medical claim. */
export function Cross({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor" {...base(title)}>
      <path d="M19 6h10v13h13v10H29v13H19V29H6V19h13V6Z" />
    </svg>
  );
}

export function Ball({ className, title }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} {...base(title)}>
      <circle cx="24" cy="24" r="18" fill="currentColor" />
      <path
        d="M9 14c6 3.5 9 8 9 15 0 2.2-.3 4.2-.9 6M39 14c-6 3.5-9 8-9 15 0 2.2.3 4.2.9 6"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
