/**
 * Reduces a client-supplied value to a path that cannot escape our origin.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 * `pagePath` arrives in the request body from the browser, and it is used to
 * build the absolute `event_source_url` sent to Meta and to fill the CRM's
 * `landing_page` field. `new URL(x, base)` lets an absolute or
 * protocol-relative value override the base entirely, so an unvalidated value
 * would let an unauthenticated POST book conversions against a domain the
 * pixel owner doesn't control, and write an off-site link into the CRM record
 * that staff then click.
 *
 * ---------------------------------------------------------------------------
 * THE BUG THIS FILE WAS EXTRACTED TO FIX — check the OUTPUT, not the input
 * ---------------------------------------------------------------------------
 * The first version of this lived inline in each route and rejected inputs
 * beginning `//` or `/\`. That is not enough, because the danger is not only
 * what the input looks like — it's what `new URL()` RESOLUTION PRODUCES.
 * Collapsing `..` at the root can manufacture a protocol-relative path out of
 * an input that passed every prefix check:
 *
 *   input                        old result          resolved against origin
 *   "/..//evil.example/phish"    "//evil.example/…"  https://evil.example/phish
 *   "/x/..//evil.example"        "//evil.example"    https://evil.example/
 *   "/./..//evil.example"        "//evil.example"    https://evil.example/
 *   "/a/b/../../..//evil.host"   "//evil.host"       https://evil.host/
 *
 * `..` cannot go above the root, so the leading segment is dropped and the
 * remaining `//host` becomes the whole pathname. Every one of those was
 * accepted by a check that only ever looked at the input string.
 *
 * So the guard now runs on `u.pathname` AFTER resolution. That covers the `..`
 * family and anything else the URL parser can normalise into the same shape,
 * rather than playing whack-a-mole with input spellings.
 *
 * Verified not exploitable, and deliberately not special-cased: control
 * characters (`/\t//host`) are stripped by the WHATWG parser before
 * resolution, backslashes are not path separators in a URL path, and
 * percent-encoded forms (`/..%2f%2fhost`) stay encoded in `pathname` — so they
 * remain a harmless same-origin 404.
 *
 * Both API routes import this. It was duplicated in each of them when the bug
 * was found, which is exactly why it now lives in one place: a path-sanitiser
 * with two copies is a sanitiser that will be fixed once.
 */

/** Shared core: returns a rooted same-origin path, or null if it can't be. */
function reduce(v: string | null): string | null {
  if (!v) return null;

  // Cheap prefix rejection first. Not sufficient on its own — see above.
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) {
    return null;
  }

  let u: URL;
  try {
    u = new URL(v, "https://placeholder.invalid");
  } catch {
    return null;
  }

  /*
    The check that actually matters. A pathname starting `//` is treated as
    protocol-relative the moment it's resolved against a real origin, which
    sends it to another host entirely.
  */
  if (u.pathname.startsWith("//")) return null;

  return u.pathname + u.search;
}

/**
 * Same-origin path, falling back to `"/"`.
 *
 * Used where a value is always needed — building `event_source_url` for Meta,
 * where a missing path still has to resolve to something valid.
 */
export function safePath(v: string | null): string {
  return reduce(v) ?? "/";
}

/**
 * Same-origin path, or `null` when there isn't a usable one.
 *
 * Used where "we don't know" is meaningful and a fabricated `"/"` would be a
 * worse record than an empty field — e.g. the contact form's stored path.
 */
export function safePathOrNull(v: string | null): string | null {
  return reduce(v);
}
