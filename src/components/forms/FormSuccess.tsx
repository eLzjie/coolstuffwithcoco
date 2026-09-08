import Image from "next/image";

/**
 * The success state that REPLACES a form, rather than appending a line to it.
 *
 * ---------------------------------------------------------------------------
 * WHY THE WHOLE FORM GOES AWAY
 * ---------------------------------------------------------------------------
 * All three forms used to stay on screen after a successful submit and add one
 * small line underneath — "You're on the list. Coco will be in touch." The
 * result read as a validation message rather than an outcome: the fields were
 * still sitting there full of the visitor's details, the button said "Sent"
 * but still looked like a button, and the single line of text was the least
 * prominent thing in the panel.
 *
 * The moment someone submits is the one moment they are guaranteed to be
 * paying attention, and on the newsletter and contact forms it is the ONLY
 * feedback they get — neither redirects anywhere. So the form is replaced
 * outright: Coco, a clear statement of what just happened, and what happens
 * next.
 *
 * ---------------------------------------------------------------------------
 * THE HEADLINE DELIBERATELY DOESN'T CELEBRATE
 * ---------------------------------------------------------------------------
 * The artwork already carries the celebratory word. A heading that also says
 * "Yay!" or "Woohoo!" next to it reads as shouting twice, and — more
 * practically — it couples this copy to whatever the image says. So the image
 * does the feeling and the heading does the information.
 *
 * That split is what makes the image a pure file swap. See SUCCESS_IMAGE.
 *
 * ---------------------------------------------------------------------------
 * ACCESSIBILITY
 * ---------------------------------------------------------------------------
 * `role="status"` + `aria-live="polite"` so the change is announced rather
 * than silently swapping the form out from under a screen-reader user. It is
 * on the wrapper, not the heading, so the whole outcome is read.
 *
 * The image is `alt=""` on purpose. Its text is pixels — no screen reader can
 * read "Yay!" out of it — and the heading beside it already states the
 * outcome, so describing the picture would just add noise. It is decoration
 * carrying tone, not information.
 *
 * `.rise` is the entrance. It already lives inside
 * `@media (prefers-reduced-motion: no-preference)` in globals.css, so it
 * self-disables and needs no guard here.
 */

/**
 * ONE constant, so replacing the artwork is a one-line change.
 *
 * NOTE ON THE CURRENT FILE: the lettering in `success-coco-png.png` reads
 * "Yoay!", not "Yay!". That is a typo in the artwork, not in this code. It is
 * wired up as supplied so nothing is blocked, but it should be regenerated —
 * a misspelt word as the centrepiece of a success state undercuts a brand
 * whose whole position is being trustworthy.
 *
 * Because the heading never repeats the word (see above), fixing it is purely
 * dropping a new file in and updating this path. No copy changes.
 */
const SUCCESS_IMAGE = "/success-coco-png.png";

/**
 * Rendered size in CSS pixels.
 *
 * The source is a 1024x1024 PNG. Explicit width/height are passed to
 * next/image so the box is reserved before the file arrives — this mounts on a
 * state change rather than on load, so without reserved space the panel would
 * jump as it decodes.
 */
const IMAGE_PX = 232;

export function FormSuccess({
  heading,
  children,
  className,
  /**
   * Guide submits navigate to the thank-you page moments later, so their
   * success state is a transition rather than a destination — compact, and
   * without the full-size badge that would only flash.
   */
  compact = false,
}: {
  heading: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const size = compact ? 148 : IMAGE_PX;

  return (
    <div
      className={`rise text-center ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <Image
        src={SUCCESS_IMAGE}
        alt=""
        width={size}
        height={size}
        /*
          Not `priority`. This never exists at first paint — it mounts only
          after a successful submit — so preloading it would pull a 1024px PNG
          onto the critical path of a page where the LCP element is text.
        */
        sizes={`${size}px`}
        className="mx-auto h-auto w-full"
        style={{ maxWidth: size }}
      />

      <p className={`${compact ? "t-h3" : "t-h2"} mt-4 text-ink`}>{heading}</p>

      {children && (
        <div className="t-body mx-auto mt-3 max-w-[42ch] text-ink/80">
          {children}
        </div>
      )}
    </div>
  );
}
