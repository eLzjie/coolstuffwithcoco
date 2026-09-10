import Link from "next/link";
import { BrandImage } from "@/components/brand/BrandImage";

type Props = {
  /**
   * Wrap in a link home. Off for the paid landing pages, where nothing may
   * compete with the form.
   *
   * The union is narrow on purpose: this lockup may link HOME or nowhere, and
   * never to an arbitrary route. `/b` is in it because it is the other home
   * arm — a lockup on `/b` linking to `/` would walk the visitor out of the
   * arm they were sent to. Widening this to `string` would let the next
   * caller point the logo anywhere and lose the guarantee.
   */
  href?: "/" | "/b" | false;
  /** Renders light, for the ink footer. */
  onInk?: boolean;
  className?: string;
};

/**
 * Badge + wordmark, used in every page header and the footer.
 *
 * The badge image is DECORATIVE (empty alt) because the wordmark beside it
 * already carries the name. Marking both up as content made a screen reader
 * announce "Cool Stuff with Coco" twice, and an aria-label on the wrapping
 * link that didn't match the visible text tripped axe's
 * label-content-name-mismatch rule.
 *
 * The wordmark is set as one lowercase word to match the Instagram handle and
 * the domain, which is how people actually search for her.
 */
export function BrandLockup({ href = false, onInk = false, className }: Props) {
  const inner = (
    <>
      <BrandImage
        slot="logoBadge"
        decorative
        className="h-11 w-11 shrink-0 sm:h-14 sm:w-14"
        sizes="56px"
      />
      <span
        className={[
          "font-display text-[0.9375rem] font-bold leading-none tracking-[-0.02em] sm:text-lg",
          onInk ? "text-paper" : "text-ink",
        ].join(" ")}
      >
        coolstuffwithcoco
      </span>
    </>
  );

  const shell = `flex items-center gap-2.5 ${className ?? ""}`;

  if (href) {
    return (
      <Link href={href} className={shell}>
        {inner}
      </Link>
    );
  }

  // Paid landing pages: present but not a route out.
  return <div className={shell}>{inner}</div>;
}
