import type { NextRequest } from "next/server";
import { upsertContact, type ContactFields } from "@/lib/crm/ghl";
import { isLeadMagnet, type LeadMagnet } from "@/lib/leadMagnet";
import { sendLeadEvent } from "@/lib/meta/capi";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { deriveTrafficSource } from "@/lib/trafficSource";
import {
  ATTR_MAX,
  EMAIL_MAX,
  EMAIL_RE,
  NAME_MAX,
  PHONE_MAX,
  isValidPhone,
  normalisePhone,
} from "@/lib/validation";
import { safePath } from "@/lib/safePath";

/**
 * Email capture. The only write path into the CRM.
 *
 * Ordering is deliberate and load-bearing:
 *   rate limit -> validate -> spam -> upsert -> CAPI -> respond
 *
 * The upsert MUST succeed — that is the lead AND, now, the delivery trigger.
 * Everything after it is best-effort: a lost analytics event is recoverable,
 * a lost lead is not.
 *
 * ---------------------------------------------------------------------------
 * DELIVERY IS TRIGGERED BY A TAG, NOT BY A WEBHOOK (changed 2026-09-09)
 * ---------------------------------------------------------------------------
 * This route used to fire a GHL Inbound Webhook after the upsert, because an
 * API upsert does not fire GHL's "form submitted" trigger and "Contact
 * Created" would not fire for a returning subscriber collecting a second
 * guide.
 *
 * That worked, and then it didn't: an Inbound Webhook trigger does not attach
 * a contact to the workflow run, so every contact-scoped action in the
 * delivery workflow reported "Action skipped" and no guide was ever sent —
 * with no error anywhere, because technically nothing failed.
 *
 * The delivery workflows now trigger on GHL's native "Contact Tag" instead,
 * watching for `lead-magnet-<concept>`. `upsertContact` applies that tag
 * through the API, so this route needs no delivery call at all. Better in
 * three ways:
 *
 *   - A native tag trigger always carries contact context, so the
 *     skipped-action failure cannot recur. There is no mapping to
 *     misconfigure.
 *   - It dedupes for free. GHL fires "Tag Added" only when the tag is NEW, so
 *     a repeat submission of the same magnet cannot re-send. That is why the
 *     `delivered-*` tag and the shouldDeliver branch are gone from this file:
 *     idempotency moved from our code into a property of the trigger.
 *   - A returning subscriber taking a DIFFERENT guide gets a genuinely new
 *     tag, so that delivery still fires — the exact case the webhook existed
 *     to solve.
 *
 * Consequence worth knowing: if someone removes a `lead-magnet-*` tag in the
 * GHL UI and the contact resubmits, the guide sends again. That is correct
 * behaviour, not a bug.
 */

/** Under this and it's almost certainly automated. Measured from first touch. */
const MIN_FILL_MS = 1200;

type Body = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  leadMagnet?: unknown;
  consent?: unknown;
  consentVersion?: unknown;
  pagePath?: unknown;
  honeypot?: unknown;
  formTimestamp?: unknown;
  attribution?: {
    utmSource?: unknown;
    utmMedium?: unknown;
    utmCampaign?: unknown;
    utmContent?: unknown;
    utmTerm?: unknown;
    fbclid?: unknown;
    referrer?: unknown;
    landingPage?: unknown;
  };
};

/**
 * `BAD_REQUEST` is a malformed payload — the client's own bug, so its copy is
 * apologetic. `INVALID_EMAIL` means the address itself is wrong, so its copy
 * can honestly ask the visitor to check it. Overloading one code for both made
 * a too-long address render "something went wrong on our end", which is a
 * dead end the visitor can't act on.
 */
type ErrorCode =
  | "INVALID_EMAIL"
  | "INVALID_PHONE"
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR";

function fail(code: ErrorCode, status: number, retryAfter?: number) {
  return Response.json(
    { ok: false, code },
    {
      status,
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    },
  );
}

/**
 * A bot is told it succeeded — never confirm the trap.
 *
 * Deliberately returns NO eventId. The client only fires the Pixel `lead`
 * when it gets one, so a discarded submission can't produce a conversion
 * event with no contact and no CAPI counterpart behind it.
 */
function silentSuccess() {
  return Response.json({ ok: true });
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

/*
  Attribution strings, capped.

  These come off the URL and the referrer, never from a person typing, so
  nothing legitimate approaches ATTR_MAX. Uncapped they were the only unbounded
  path into the CRM — one unauthenticated POST could push a megabyte into a
  custom field and forward the same payload to the delivery webhook.

  Truncated rather than rejected on purpose: attribution is best-effort
  telemetry, and refusing the submission would discard a real lead to protect a
  UTM value.
*/
const attr = (v: unknown): string | null => str(v)?.slice(0, ATTR_MAX) ?? null;

/*
  safePath lives in lib/safePath.ts. It used to be inline here AND in
  api/contact/route.ts, and the duplicate is how a bypass survived: the inline
  version only inspected the input string, so `/..//evil.example` resolved to
  the protocol-relative `//evil.example` and escaped the origin. The shared
  version checks the RESOLVED pathname. See that file for the full case table.
*/

export async function POST(req: NextRequest) {
  // ---- 1. Rate limit. First, so abuse costs as little as possible. ----
  const ip = clientIp(req);
  const limit = await checkRateLimit(ip, "subscribe");
  if (!limit.ok) return fail("RATE_LIMITED", 429, limit.retryAfter);

  // ---- 2. Parse and validate ----
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail("BAD_REQUEST", 400);
  }

  /*
    A literal `null` body PARSES successfully, so it slips past the catch above
    and then throws on the first property read — a framework 500 instead of an
    honest 400. Same for a bare string or array, which the `as Body` cast
    happily pretends are objects.
  */
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("BAD_REQUEST", 400);
  }

  const email = str(body.email)?.toLowerCase() ?? "";
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX) {
    return fail("INVALID_EMAIL", 400);
  }

  if (!isLeadMagnet(body.leadMagnet)) return fail("BAD_REQUEST", 400);
  const magnet: LeadMagnet = body.leadMagnet;

  // ---- 3. Spam. Both discard silently — a bot learns nothing. ----
  if (str(body.honeypot)) {
    console.warn(`[subscribe] honeypot tripped, discarded (ip=${ip})`);
    return silentSuccess();
  }

  // Client-supplied and therefore forgeable — a heuristic, not a control.
  // Measured from first interaction rather than mount, so a form sitting in
  // view while someone reads the page doesn't bank credit toward the window.
  const started = typeof body.formTimestamp === "number" ? body.formTimestamp : 0;
  if (started > 0 && Date.now() - started < MIN_FILL_MS) {
    console.warn(`[subscribe] submitted too fast, discarded (ip=${ip})`);
    return silentSuccess();
  }

  /*
    Name and phone. Optional everywhere and absent entirely on the newsletter.

    A blank must never be sent on to GHL as an empty string: the upsert would
    overwrite a name captured on an earlier submission with nothing. `str()`
    already collapses "" to null, and the adapter drops nulls.
  */
  const firstName = str(body.firstName)?.slice(0, NAME_MAX) ?? null;
  const lastName = str(body.lastName)?.slice(0, NAME_MAX) ?? null;

  const rawPhone = str(body.phone);
  if (rawPhone && (rawPhone.length > PHONE_MAX || !isValidPhone(rawPhone))) {
    return fail("INVALID_PHONE", 400);
  }
  const phone = rawPhone ? normalisePhone(rawPhone) : null;

  // ---- 4. Assemble ----
  const a = body.attribution ?? {};
  const utmSource = attr(a.utmSource);
  const utmMedium = attr(a.utmMedium);
  const utmCampaign = attr(a.utmCampaign);
  const consent = body.consent === true;
  const pagePath = safePath(attr(body.pagePath));

  const contact: ContactFields = {
    email,
    firstName,
    lastName,
    phone,
    /*
      Which disclosure they agreed to. Recorded so a contact can be traced
      back to the exact wording on screen at submit — that's the "retain
      records" half of consent, and a bare boolean can't satisfy it.
    */
    consentVersion: str(body.consentVersion)?.slice(0, 60) ?? null,
    leadMagnet: magnet,
    trafficSource: deriveTrafficSource({
      utmSource,
      utmMedium,
      fbclid: attr(a.fbclid),
      referrer: attr(a.referrer),
      selfHost: req.nextUrl.hostname,
    }),
    campaign: utmCampaign,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent: attr(a.utmContent),
    utmTerm: attr(a.utmTerm),
    /*
      The fallback has to be chosen BEFORE sanitising, not after.

      This read `safePath(...) || pagePath`, which is dead: safePath never
      returns a falsy value — every rejection returns "/". So the fallback
      could never fire, and a submission with no attribution.landingPage
      recorded "/" as the acquiring page instead of the page they were on.
    */
    landingPage: attr(a.landingPage) ? safePath(attr(a.landingPage)) : pagePath,
    consent,
  };

  const eventId = crypto.randomUUID();

  // ---- 5. Upsert. This is the lead AND the delivery trigger. ----
  try {
    /*
      No delivery call follows this any more. Applying the
      `lead-magnet-<concept>` tag IS the delivery trigger — see the note at
      the top of this file. So this single call has to succeed, and a failure
      here is a lost lead rather than a lost analytics event.
    */
    await upsertContact(contact);
  } catch (err) {
    console.error("[subscribe] contact upsert failed:", err);
    return fail("UPSTREAM_ERROR", 502);
  }

  // ---- 6. CAPI. Gated on the same consent the Pixel is gated on. ----
  if (consent) {
    await sendLeadEvent({
      eventId,
      email,
      // The page the conversion happened on, not this endpoint. Sending the
      // API route degrades match quality and can trip Meta's domain checks.
      eventSourceUrl: new URL(pagePath, req.nextUrl.origin).href,
      clientIp: ip,
      userAgent: req.headers.get("user-agent") ?? "",
      fbclid: str(a.fbclid),
      fbp: req.cookies.get("_fbp")?.value ?? null,
    });
  } else if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1") {
    console.log("[subscribe] CAPI skipped — no consent");
  }

  return Response.json({ ok: true, eventId });
}
