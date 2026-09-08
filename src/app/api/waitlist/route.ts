import type { NextRequest } from "next/server";
import { joinLibraryWaitlist } from "@/lib/crm/ghl";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { EMAIL_MAX, EMAIL_RE } from "@/lib/validation";

/**
 * Library waitlist joins.
 *
 * ---------------------------------------------------------------------------
 * SEPARATE FROM /api/subscribe, AND IT MATTERS
 * ---------------------------------------------------------------------------
 * This is not a capture and it is not a purchase. It applies one additive tag
 * so the "it's ready" email can be segmented, and nothing else:
 *
 *  - No `lead-magnet-*` tag. That tag IS the guide-delivery trigger now, so
 *    writing one here would send somebody a guide they didn't ask for.
 *  - No `marketing_consent`, no `consent_at`, no consent version. Interest in
 *    a product is not a fresh marketing permission — they already gave that
 *    when they took the guide, and re-recording it would overwrite a real
 *    consent record with a weaker one.
 *  - No `buyer_state`. They have paid nothing.
 *  - No Meta conversion event. A waitlist join is not a purchase, and
 *    reporting one would train the ad account on the wrong signal.
 *
 * ---------------------------------------------------------------------------
 * WHY THE CLIENT SENDS AN EMAIL IT ALREADY GAVE US
 * ---------------------------------------------------------------------------
 * The thank-you page is a static route with no session, so it has no
 * server-side way to know who is looking at it. The address comes from
 * sessionStorage (see lib/recentCapture.ts), which means it is client-supplied
 * and therefore validated here exactly as if it came from a form. Anyone can
 * put anything in their own sessionStorage; the convenience is skipping the
 * typing, not skipping the checks.
 *
 * Worth being clear-eyed: that also means someone could add an arbitrary
 * address to the waitlist. The blast radius is one tag on one contact and an
 * email they can unsubscribe from — the same exposure the newsletter form
 * already has, and it is rate limited on the same basis.
 */

/** Its own bucket, so waitlist taps can't exhaust someone's subscribe allowance. */
const RATE_SCOPE = "waitlist";

type Body = { email?: unknown };

type ErrorCode = "INVALID_EMAIL" | "BAD_REQUEST" | "RATE_LIMITED" | "UPSTREAM_ERROR";

function fail(code: ErrorCode, status: number, retryAfter?: number) {
  return Response.json(
    { ok: false, code },
    {
      status,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    },
  );
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = await checkRateLimit(ip, RATE_SCOPE);
  if (!limit.ok) return fail("RATE_LIMITED", 429, limit.retryAfter);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail("BAD_REQUEST", 400);
  }

  // A literal `null` body parses fine and would throw on the first read.
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("BAD_REQUEST", 400);
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX) {
    return fail("INVALID_EMAIL", 400);
  }

  try {
    await joinLibraryWaitlist(email);
  } catch (err) {
    /*
      Logged, not surfaced. The visitor gets copy they can act on and the
      upstream detail stays server-side.
    */
    console.error("[waitlist] join failed:", err);
    return fail("UPSTREAM_ERROR", 502);
  }

  /*
    `joined` is the discriminator, matching the pattern the other two routes
    use. There is no silent-discard path here — no honeypot, no timing check,
    because this is a one-tap action on a page a bot has no reason to reach and
    the worst case is a tag. So `joined` is always true on a 2xx; it exists so
    the client never has to infer success from an empty body.
  */
  return Response.json({ ok: true, joined: true });
}
