/**
 * The only place that talks to Meta Pixel or GA.
 *
 * Never call `fbq` or `gtag` from a component. Import `track` instead — that
 * way the consent gate, the debug flag and the event vocabulary all stay in
 * one file.
 *
 * Set NEXT_PUBLIC_ANALYTICS_DEBUG=1 to log every event with its full payload
 * to the console. Verifies firing without opening Events Manager.
 */

import { hasConsent, onConsentChange } from "@/lib/consent";
import type { LeadMagnet } from "@/lib/leadMagnet";
import { getAttribution } from "@/lib/utm";

export type EventName =
  | "page_view"
  | "view_content"
  | "form_start"
  | "lead"
  | "offer_view"
  | "initiate_checkout"
  | "purchase_bundle"
  | "purchase_single"
  | "purchase_bump"
  | "decline_offer";

/** Maps our vocabulary onto Meta's standard events. */
const META_EVENT: Record<EventName, string> = {
  page_view: "PageView",
  view_content: "ViewContent",
  form_start: "InitiateCheckout_FormStart",
  lead: "Lead",
  offer_view: "ViewContent",
  initiate_checkout: "InitiateCheckout",
  purchase_bundle: "Purchase",
  purchase_single: "Purchase",
  purchase_bump: "Purchase",
  decline_offer: "CustomizeProduct",
};


/** Events Meta has no standard name for — sent via trackCustom. */
const CUSTOM_EVENTS: ReadonlySet<EventName> = new Set(["form_start"]);

export type EventPayload = {
  lead_magnet?: LeadMagnet;
  content_name?: string;
  value?: number;
  currency?: string;
  /**
   * Shared with the server so the Pixel and CAPI dedupe to one conversion.
   * Generated per submit by the route handler and returned to the client.
   */
  eventId?: string;
  [key: string]: unknown;
};

const DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Events fired before consent land here, then flush once consent is granted. */
let queue: Array<{ name: EventName; payload: EventPayload }> = [];
let flushBound = false;

function emit(name: EventName, payload: EventPayload) {
  const body = { ...getAttribution(), ...payload };

  if (DEBUG) {
    console.log(
      `%c[coco:track]%c ${name}`,
      "background:#F4837E;color:#211C1A;padding:2px 6px;border-radius:3px;font-weight:700",
      "font-weight:700",
      body,
    );
  }

  if (typeof window === "undefined") return;

  const metaName = META_EVENT[name];

  /*
    eventID is what Meta deduplicates the Pixel against the server-side CAPI
    call. Both halves must carry the SAME id or one conversion is counted
    twice — which trains the ad account on inflated numbers.
  */
  const opts = payload.eventId
    ? { eventID: String(payload.eventId) }
    : undefined;

  // Explicit, not inferred from punctuation: the old test keyed off an
  // underscore in the mapped name, which was right only because the one
  // custom event happened to contain one.
  const isStandard = !CUSTOM_EVENTS.has(name);
  window.fbq?.(isStandard ? "track" : "trackCustom", metaName, body, opts);
  window.gtag?.("event", name, body);
}

/**
 * Conversion events are DROPPED when consent is absent, never queued.
 *
 * Replaying one later would send Meta a `lead` carrying an `eventId` whose
 * server-side CAPI counterpart fired at submit time — likely outside Meta's
 * deduplication window by then, so the same conversion gets counted twice and
 * the ad account optimises on inflated numbers.
 *
 * Deferring a page_view costs nothing. Deferring a conversion corrupts data.
 */
const NEVER_QUEUE: ReadonlySet<EventName> = new Set([
  "lead",
  "purchase_bundle",
  "purchase_single",
  "purchase_bump",
]);

/** Bound the queue so a consent-denied session can't grow it forever. */
const QUEUE_MAX = 50;

export function track(name: EventName, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;

  if (!hasConsent("analytics")) {
    if (NEVER_QUEUE.has(name)) {
      if (DEBUG) {
        console.log(`[coco:track] dropped (no consent, not queueable): ${name}`);
      }
      return;
    }

    if (queue.length < QUEUE_MAX) queue.push({ name, payload });
    if (DEBUG) {
      console.log(`[coco:track] queued (no consent yet): ${name}`);
    }
    if (!flushBound) {
      flushBound = true;
      onConsentChange(() => {
        if (!hasConsent("analytics")) return;
        const pending = queue;
        queue = [];
        pending.forEach((e) => emit(e.name, e.payload));
      });
    }
    return;
  }

  emit(name, payload);
}

export type { LeadMagnet };
