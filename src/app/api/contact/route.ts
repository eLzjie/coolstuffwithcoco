import type { NextRequest } from "next/server";
import { submitContactMessage } from "@/lib/crm/ghl";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import {
  EMAIL_MAX,
  EMAIL_RE,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
} from "@/lib/validation";
import { safePathOrNull } from "@/lib/safePath";

/**
 * Contact form enquiries.
 *
 * Separate from /api/subscribe on purpose. Someone asking a question hasn't
 * opted into marketing, so this path sets no marketing_consent, adds no lead
 * tags and fires no delivery webhook — see submitContactMessage in
 * lib/crm/ghl.ts.
 *
 * It DOES record which contact-form disclosure was on screen. An earlier
 * version of this comment claimed "no consent record", which was wrong and
 * worth correcting rather than quietly leaving: the distinction that matters
 * is that nothing here grants marketing permission.
 *
 * No Meta event either. A support enquiry isn't a conversion, and reporting it
 * as one would inflate the numbers the ad account optimises on.
 */

/** Under this and it's almost certainly automated. Measured from first touch. */
const MIN_FILL_MS = 1200;

type Body = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  consentVersion?: unknown;
  pagePath?: unknown;
  honeypot?: unknown;
  formTimestamp?: unknown;
};

type ErrorCode =
  | "INVALID_EMAIL"
  | "INVALID_MESSAGE"
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
 * A discarded submission is told it succeeded — never confirm the trap.
 *
 * Deliberately omits `received`, which is what lets the client tell this
 * apart from a real submission without the response saying so outright.
 */
function silentSuccess() {
  return Response.json({ ok: true });
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

/* Path sanitising is shared with the capture route — see lib/safePath.ts. */

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = await checkRateLimit(ip, "contact");
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

  const email = str(body.email)?.toLowerCase() ?? "";
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX) {
    return fail("INVALID_EMAIL", 400);
  }

  const name = str(body.name)?.slice(0, NAME_MAX);
  if (!name) return fail("BAD_REQUEST", 400);

  /*
    Its own code, not BAD_REQUEST. A 3,000-character paste is the visitor's
    message being too long — telling them "something went wrong on our end"
    blames us for something only they can fix, and leaves them no next step.
  */
  const message = str(body.message);
  if (!message || message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return fail("INVALID_MESSAGE", 400);
  }

  /*
    Spam. Silent discard, exactly as on the capture route: a bot is told it
    succeeded so it learns nothing about the trap.
  */
  if (str(body.honeypot)) {
    console.warn(`[contact] honeypot tripped, discarded (ip=${ip})`);
    return silentSuccess();
  }

  const started = typeof body.formTimestamp === "number" ? body.formTimestamp : 0;
  if (started > 0 && Date.now() - started < MIN_FILL_MS) {
    console.warn(`[contact] submitted too fast, discarded (ip=${ip})`);
    return silentSuccess();
  }

  try {
    await submitContactMessage({
      name,
      email,
      message,
      consentVersion: str(body.consentVersion)?.slice(0, 60) ?? null,
      pagePath: safePathOrNull(str(body.pagePath)),
    });
  } catch (err) {
    // Logged, not surfaced: the visitor gets copy they can act on, and the
    // upstream detail stays server-side.
    console.error("[contact] submit failed:", err);
    return fail("UPSTREAM_ERROR", 502);
  }

  /*
    `received` is the discriminator. The capture route gets this for free from
    its eventId; this route has no such field, and without one the client
    cannot tell a real submission from a silent discard — so it showed a
    success message for enquiries that were thrown away.
  */
  return Response.json({ ok: true, received: true });
}
