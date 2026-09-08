/**
 * Per-IP rate limiting, backed by Upstash Redis.
 *
 * ---------------------------------------------------------------------------
 * SHARED INSTANCE — every key here is prefixed `coco:`
 * ---------------------------------------------------------------------------
 * This Upstash database is shared with the onthetron project. The prefix is
 * not cosmetic: without it the two projects would collide on generic keys and
 * silently rate-limit each other's users. Never write an unprefixed key.
 *
 * Redis rather than in-memory because serverless instances aren't shared —
 * an in-memory counter only limits one instance and misses anything spread
 * across them, so "5 per minute" wouldn't actually be 5 per minute.
 *
 * Fails OPEN. If Redis is unreachable the request proceeds: losing a lead is
 * worse than serving one that should have been throttled, and the real cost of
 * junk addresses is sending reputation, which the honeypot and timing check
 * also defend.
 */

import { Redis } from "@upstash/redis";

const PREFIX = "coco:rl:";

/** Spec: roughly 5/min and 20/hour per IP. */
const WINDOWS = [
  { name: "m", limit: 5, seconds: 60 },
  { name: "h", limit: 20, seconds: 3600 },
] as const;

let client: Redis | null | undefined;

/** `undefined` = not yet resolved, `null` = not configured. */
function redis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  if (!client) {
    console.warn(
      "[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting is OFF",
    );
  }
  return client;
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the exceeded window resets. Only set when ok is false. */
  retryAfter?: number;
};

/**
 * Counts this request against every window and reports whether any is over.
 *
 * INCR + EXPIRE is a fixed window, not a sliding one: a burst spanning a
 * boundary can briefly exceed the nominal rate. That's an accepted trade for
 * two round-trips instead of a sorted-set implementation — this is abuse
 * dampening, not a security control.
 */
export async function checkRateLimit(
  ip: string,
  /**
   * Which endpoint is being counted.
   *
   * Without this every route shared one bucket per IP, so someone sending a
   * few contact-form enquiries used up their own allowance to actually
   * subscribe — two unrelated actions throttling each other. Defaulted rather
   * than required so an unscoped caller still gets limited, just coarsely.
   */
  scope = "all",
): Promise<RateLimitResult> {
  const r = redis();
  if (!r) return { ok: true };

  try {
    const results = await Promise.all(
      WINDOWS.map(async (w) => {
        const key = `${PREFIX}${scope}:${w.name}:${ip}`;
        const count = await r.incr(key);
        // Only set the TTL on the first hit, so the window doesn't slide
        // forward with every request and trap someone indefinitely.
        if (count === 1) await r.expire(key, w.seconds);
        return { w, count };
      }),
    );

    const over = results.find(({ w, count }) => count > w.limit);
    if (!over) return { ok: true };

    const ttl = await r.ttl(`${PREFIX}${scope}:${over.w.name}:${ip}`);
    return { ok: false, retryAfter: ttl > 0 ? ttl : over.w.seconds };
  } catch (err) {
    console.error("[rateLimit] Redis unreachable, failing open:", err);
    return { ok: true };
  }
}

/**
 * Best-effort client IP.
 *
 * On Vercel `x-forwarded-for` is set by the platform and its FIRST entry is
 * the real client. Trusting the first entry is only safe behind a proxy that
 * rewrites the header — which Vercel does. Do not copy this into an app that
 * accepts direct traffic, where a client can forge the whole header.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
