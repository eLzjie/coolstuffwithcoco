"use client";

import { useEffect, useRef } from "react";
import { track, type LeadMagnet } from "@/lib/analytics/track";

/**
 * ============================================================================
 *  PLACEHOLDER — not a working form.
 * ============================================================================
 *
 * The form lives in GoHighLevel and gets embedded here for now (Eli's call,
 * 2026-09-07). This component renders a labelled placeholder box where that
 * embed will sit, plus the permission copy that has to appear at the point of
 * capture either way.
 *
 * TO DROP IN THE REAL EMBED:
 *   1. Put the GHL form URL in NEXT_PUBLIC_GHL_FORM_DECODE / _VETBILL / _NEWSLETTER.
 *   2. The <iframe> below starts rendering automatically once the env var is set.
 *   3. Set the iframe's height to the form's real height — a wrong height is the
 *      usual cause of a scrollbar inside the embed on mobile.
 *
 * ---------------------------------------------------------------------------
 *  KNOWN COST OF THE IFRAME — read before launch
 * ---------------------------------------------------------------------------
 * A cross-origin iframe means this page cannot observe submit. Consequences:
 *
 *   1. `lead` cannot fire on real success. It is NOT fired here, because
 *      firing it on render or on click would report conversions that didn't
 *      happen and would train the ad account on a false signal. `form_start`
 *      fires on first interaction with the embed region, which is the most
 *      honest client-side signal available through an iframe.
 *   2. UTMs captured in lib/utm.ts do not reach the contact record. They're
 *      appended to the iframe src below as a best effort, which works only if
 *      the GHL form has matching hidden fields configured.
 *   3. Meta CAPI + Pixel deduplication on a shared event_id is not possible,
 *      since there's no server-side submit here to generate the pair.
 *
 * This is the tracking gap Eli flagged from a previous project. The fix is the
 * custom in-page form: a React form posting to /api/subscribe, which upserts to
 * GHL server-side and fires CAPI with a shared event_id. Neither exists yet —
 * deliberately not built, so there's only one form path in the codebase.
 *
 * TODO(Eli): decide when the in-page form replaces this, and confirm which GHL
 * inbound mechanism to use (v2 contacts endpoint, inbound webhook, or the
 * form's own POST endpoint).
 */

type Props = {
  magnet: LeadMagnet | "newsletter";
  /** Height of the GHL form in px. Reserved up front so CLS stays 0. */
  height?: number;
  className?: string;
};

const ENV_BY_MAGNET: Record<Props["magnet"], string | undefined> = {
  decode: process.env.NEXT_PUBLIC_GHL_FORM_DECODE,
  vetbill: process.env.NEXT_PUBLIC_GHL_FORM_VETBILL,
  newsletter: process.env.NEXT_PUBLIC_GHL_FORM_NEWSLETTER,
};

export function GhlFormEmbed({ magnet, height = 320, className }: Props) {
  const src = ENV_BY_MAGNET[magnet];
  const started = useRef(false);

  // First interaction anywhere in the embed region. Best available proxy for
  // form_start when the form itself is cross-origin and unobservable.
  useEffect(() => {
    if (started.current) return;

    const fire = () => {
      if (started.current) return;
      started.current = true;
      track("form_start", {
        lead_magnet: magnet === "newsletter" ? undefined : magnet,
        content_name: magnet,
        via: "ghl_iframe",
      });
    };

    // Losing focus to an iframe is the one submit-adjacent signal we get.
    const onBlur = () => {
      if (document.activeElement?.tagName === "IFRAME") fire();
    };

    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [magnet]);

  return (
    <div className={className}>
      {src ? (
        <iframe
          src={withAttribution(src)}
          title={
            magnet === "newsletter"
              ? "Sign up for Coco's emails"
              : "Get the free guide"
          }
          style={{ width: "100%", height, border: "0" }}
          loading="lazy"
        />
      ) : (
        <div
          className="ph rounded-2xl"
          style={{ height }}
          role="img"
          aria-label="Placeholder for the GoHighLevel email capture form"
        >
          <span>
            <strong className="block font-semibold">
              Placeholder — GHL form embed
            </strong>
            The GoHighLevel form goes here.
            <span className="mt-1 block opacity-60">
              Set NEXT_PUBLIC_GHL_FORM_
              {magnet.toUpperCase()} to render it. Email field only.
            </span>
          </span>
        </div>
      )}

      {/*
        Permission copy. Required at the point of capture (compliance rule 8),
        so it lives with the form rather than in the footer, and it renders
        whether or not the embed is wired up. Nothing pre-ticked.
      */}
      <p className="t-small mt-4 max-w-[46ch] text-ink-muted">
        {magnet === "newsletter"
          ? "You'll get Coco's emails — dog stuff worth reading, a couple of times a month. Unsubscribe whenever, no hard feelings."
          : "We'll email you the guide, then keep sending you Coco's dog stuff a couple of times a month. Unsubscribe whenever, no hard feelings."}
      </p>
    </div>
  );
}

/**
 * Appends captured attribution to the embed URL.
 *
 * Best effort only — these land on the contact record ONLY if the GHL form has
 * hidden fields with matching names. TODO(Eli): confirm the hidden fields exist
 * in the sub-account, or these params go nowhere silently.
 */
function withAttribution(src: string) {
  if (typeof window === "undefined") return src;
  try {
    const url = new URL(src);
    const stored = window.sessionStorage.getItem("coco.attribution.v1");
    if (stored) {
      const attr = JSON.parse(stored) as Record<string, string>;
      for (const [k, v] of Object.entries(attr)) {
        if (v) url.searchParams.set(k, v);
      }
    }
    return url.toString();
  } catch {
    return src;
  }
}
