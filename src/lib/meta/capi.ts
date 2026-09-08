/**
 * Meta Conversions API — server-side half of the `lead` event.
 *
 * The client fires the Pixel with the SAME `eventId`, and Meta deduplicates on
 * it. Both halves are required: the Pixel gets blocked often enough that CAPI
 * alone would under-report, and CAPI alone loses browser-side signals.
 *
 * PII: the email is SHA-256 hashed before it leaves this process, which is
 * what Meta requires. The raw address is never sent, never logged.
 */

import { createHash } from "node:crypto";

const GRAPH_VERSION = "v21.0";

export type LeadEvent = {
  eventId: string;
  email: string;
  eventSourceUrl: string;
  clientIp: string;
  userAgent: string;
  fbclid?: string | null;
  /** `_fbp` cookie, if the browser had one. Improves match quality. */
  fbp?: string | null;
  /** Unix seconds. Defaults to now. */
  eventTime?: number;
};

/** Meta expects normalised-then-hashed: trimmed, lowercased, SHA-256 hex. */
function hashEmail(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

/**
 * Meta's click-id cookie format: `fb.1.<creation-ms>.<fbclid>`.
 *
 * Built here when the browser didn't set `_fbc` itself — which happens
 * whenever the Pixel is blocked or hasn't loaded, i.e. exactly the cases CAPI
 * exists to cover.
 */
function buildFbc(fbclid: string, atMs: number): string {
  return `fb.1.${atMs}.${fbclid}`;
}

/**
 * Sends `Lead`. Returns whether Meta accepted it.
 *
 * NEVER throws and never blocks the caller's success path: a lost analytics
 * event is recoverable, a lost lead is not. Failures are logged and swallowed.
 */
export async function sendLeadEvent(e: LeadEvent): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !token) {
    if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1") {
      console.log(
        "[capi] skipped — NEXT_PUBLIC_META_PIXEL_ID / META_CAPI_ACCESS_TOKEN not set",
      );
    }
    return false;
  }

  const nowMs = Date.now();
  const eventTime = e.eventTime ?? Math.floor(nowMs / 1000);

  const userData: Record<string, unknown> = {
    em: [hashEmail(e.email)],
    client_ip_address: e.clientIp,
    client_user_agent: e.userAgent,
  };
  if (e.fbp) userData.fbp = e.fbp;
  if (e.fbclid) userData.fbc = buildFbc(e.fbclid, nowMs);

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: eventTime,
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.eventSourceUrl,
        user_data: userData,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      // Body can echo the request; truncate and never include the token.
      console.error(
        `[capi] Lead rejected ${res.status}:`,
        (await res.text().catch(() => "")).slice(0, 300),
      );
      return false;
    }

    if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1") {
      console.log(`[capi] Lead accepted, eventId=${e.eventId}`);
    }
    return true;
  } catch (err) {
    console.error("[capi] Lead failed:", err);
    return false;
  }
}
