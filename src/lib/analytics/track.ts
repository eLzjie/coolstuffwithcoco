/**
 * The only place that talks to Meta Pixel, GA4 or GTM.
 *
 * Never call `fbq`, `gtag` or `dataLayer.push` from a component. Import
 * `track` instead — that way the consent gate, the debug flag and the event
 * vocabulary all stay in one file.
 *
 * Set NEXT_PUBLIC_ANALYTICS_DEBUG=1 to log every event with its full payload
 * to the console. Verifies firing without opening Events Manager or GA4
 * Realtime.
 *
 * ---------------------------------------------------------------------------
 * ONE CALL, THREE DESTINATIONS
 * ---------------------------------------------------------------------------
 * Each tracked event fans out to:
 *
 *   1. Meta Pixel   — via `fbq`, using META_EVENT names.
 *   2. GA4          — via `gtag`, using GA4_EVENT names and a CURATED param
 *                     set (see ga4Params below for why not the whole body).
 *   3. GTM          — via a `coco_*` dataLayer push, so container triggers
 *                     have something stable to fire on.
 *
 * The GTM push is separate from the gtag call on purpose. `gtag` writes its
 * own shape into dataLayer, which GTM custom-event triggers can't match; the
 * `coco_` prefix gives GTM a name that is unmistakably ours and can't collide
 * with anything Google writes.
 *
 * ---------------------------------------------------------------------------
 * DO NOT ADD A GA4 TAG TO THE GTM CONTAINER
 * ---------------------------------------------------------------------------
 * GA4 is loaded DIRECTLY here (gtag.js, see components/analytics/Tags.tsx).
 * If the GTM container also holds a GA4 Configuration tag for the same
 * measurement id, or a GA4 Event tag triggered on the `coco_*` events above,
 * every hit is counted TWICE — page views, conversions, the lot — and the
 * numbers the ad account optimises on are inflated with no visible error.
 *
 * A new container holds no such tag, so the default state is correct. Use GTM
 * for OTHER vendors. If GA4 ever needs to move into GTM, delete the gtag
 * loader in the same change — never run both.
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

/**
 * Maps our vocabulary onto GA4's names.
 *
 * GA4's RECOMMENDED events are used wherever one exists, because they're what
 * its built-in reports, funnel exploration and audience builder understand. A
 * custom name works but lands in "unassigned" and has to be wired up by hand.
 *
 * `Record<EventName, string>` is deliberate — a new EventName fails the build
 * here until it's mapped, rather than silently sending nothing to GA4. That's
 * the same guarantee META_EVENT gives.
 *
 * Not one-to-one with META_EVENT, and shouldn't be: `offer_view` is a
 * ViewContent to Meta but a `view_promotion` to GA4, which is the more
 * accurate of the two.
 */
const GA4_EVENT: Record<EventName, string> = {
  page_view: "page_view",
  view_content: "view_item",
  form_start: "form_start",
  /*
    `generate_lead` is GA4's recommended name and THE conversion to mark as a
    key event in the GA4 UI. Don't rename it without changing that too.
  */
  lead: "generate_lead",
  offer_view: "view_promotion",
  initiate_checkout: "begin_checkout",
  purchase_bundle: "purchase",
  purchase_single: "purchase",
  purchase_bump: "purchase",
  /* No GA4 standard for declining an offer. Custom, and that's correct. */
  decline_offer: "decline_offer",
};

/** GA4 events that must carry monetary detail to report correctly. */
const GA4_MONETARY: ReadonlySet<string> = new Set(["purchase", "begin_checkout"]);

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
    /** Shared by gtag.js and GTM. Both append to the same array. */
    dataLayer?: unknown[];
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

  /*
    GA4 gets the mapped name and a trimmed payload. This used to send the raw
    `name` and the entire `body`, which was wrong twice over: the name bypassed
    GA4's recommended vocabulary, and the body carried every UTM field as a
    custom parameter.
  */
  window.gtag?.("event", GA4_EVENT[name], ga4Params(name, payload));

  /*
    GTM. Prefixed so a container trigger can match on exactly our events, and
    kept as a plain object so any vendor tag can read it. GTM does nothing at
    all with this until a trigger is configured, so an empty container is
    inert — see the warning at the top of this file about GA4 specifically.
  */
  window.dataLayer?.push({ event: `coco_${name}`, ...ga4Params(name, payload) });
}

/**
 * The subset of an event's payload that GA4 should actually receive.
 *
 * GA4 is NOT a log sink. Every parameter has to be registered as a custom
 * dimension in its UI before it appears in a single report, there's a cap per
 * event, and the per-property custom-dimension limit is a hard 50. Forwarding
 * the whole body — which `getAttribution()` fills with ten campaign fields —
 * spends that budget on data GA4 already derives from the URL itself, and
 * everything unregistered is silently dropped.
 *
 * So: the fields that describe WHAT happened, plus the monetary ones. Campaign
 * attribution is deliberately omitted — GA4 parses utm_* natively and its own
 * traffic-source dimensions are better than anything mirrored in by hand.
 * Meta still gets the full body; its custom-conversion rules can use it.
 */
function ga4Params(name: EventName, payload: EventPayload) {
  const ga4Name = GA4_EVENT[name];

  const out: Record<string, unknown> = {};
  if (payload.lead_magnet) out.lead_magnet = payload.lead_magnet;
  if (payload.content_name) out.item_name = payload.content_name;
  if (typeof payload.page_path === "string") out.page_path = payload.page_path;

  if (GA4_MONETARY.has(ga4Name)) {
    /*
      GA4 shows a purchase with no value as a conversion worth nothing, which
      is indistinguishable from a free lead in every revenue report. Currency
      is required alongside it or the value is ignored outright.
    */
    out.value = typeof payload.value === "number" ? payload.value : 0;
    out.currency = payload.currency ?? "USD";
  }

  /*
    GA4 dedupes purchases on transaction_id. Reusing the eventId that already
    dedupes the Meta Pixel against CAPI keeps one id across all three systems,
    so a double-fired purchase collapses everywhere rather than only at Meta.
  */
  if (ga4Name === "purchase" && payload.eventId) {
    out.transaction_id = String(payload.eventId);
  }

  return out;
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
