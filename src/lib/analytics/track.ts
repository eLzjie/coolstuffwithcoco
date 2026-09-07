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

export type LeadMagnet = "decode" | "vetbill";

export type EventPayload = {
  lead_magnet?: LeadMagnet;
  content_name?: string;
  value?: number;
  currency?: string;
  /** Shared with the server so Pixel + CAPI dedupe on the same event. */
  event_id?: string;
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

export function newEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

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
  const opts = body.event_id ? { eventID: body.event_id as string } : undefined;

  // Standard vs custom: anything not in Meta's standard list goes through trackCustom.
  const isStandard = !metaName.includes("_");
  window.fbq?.(isStandard ? "track" : "trackCustom", metaName, body, opts);
  window.gtag?.("event", name, body);
}

export function track(name: EventName, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;

  if (!hasConsent("analytics")) {
    queue.push({ name, payload });
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
