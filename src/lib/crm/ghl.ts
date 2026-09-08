/**
 * GoHighLevel adapter — the only file that knows how GHL is reached.
 *
 * Swapping the inbound mechanism (v2 contacts endpoint / inbound webhook /
 * the form's own POST) should mean editing this file and nothing else.
 *
 * ---------------------------------------------------------------------------
 * VERIFIED against the live sub-account on 2026-09-08
 * ---------------------------------------------------------------------------
 *  - The credential is a `pit-` Private Integration Token, so API v2 with a
 *    Bearer header and `Version: 2021-07-28` is correct.
 *  - Scopes present: contacts read + write, custom fields read.
 *    `locations.readonly` is NOT granted — don't add calls that need it.
 *  - Custom fields are addressed by **id**, resolved at runtime from the
 *    customFields endpoint, NOT by string key. GHL accepts either, but the
 *    key's exact form (`utm_source` vs `contact.utm_source`) is ambiguous and
 *    a wrong key is accepted and silently dropped. Ids can't be wrong.
 *
 *  - Every field this file writes now EXISTS in the sub-account, created via
 *    the API on 2026-09-08. `npm run check:ghl` verifies that and exits
 *    non-zero if any goes missing, so it can gate a deploy.
 *
 *    The id-resolution below stays regardless: a field can be renamed or
 *    deleted in the GHL UI at any time, and this way that shows up as a named
 *    warning instead of a column that quietly stops filling.
 */

import { TRAFFIC_SOURCE, type TrafficSource } from "@/lib/trafficSource";
import type { LeadMagnet } from "@/lib/leadMagnet";

const API = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

/** Fixed for this funnel. The Homeowners tree must never merge with it. */
const PARENT_AUDIENCE = "Pets > Dogs";

export type { LeadMagnet };

export type ContactFields = {
  email: string;
  /**
   * Native GHL contact fields — NOT custom fields, so they need no entry in
   * the customFields list and no id resolution.
   *
   * All optional: the newsletter form collects email only, and last name and
   * phone are optional on the guide forms. A null is dropped rather than sent
   * as "", because an empty string would overwrite a value captured earlier.
   */
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  /** Which consent disclosure was on screen at submit. */
  consentVersion?: string | null;
  leadMagnet: LeadMagnet;
  trafficSource: TrafficSource;
  campaign: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPage: string | null;
  /**
   * Whether the visitor's browser had consent granted at submit time.
   *
   * Recorded on the contact rather than in a separate database: GHL already
   * has a `marketing_consent` field, and the permission record belongs on the
   * same record the marketing is sent from — that's where anyone auditing the
   * basis for a send would look. A second store holding a copy just raises the
   * question of which one is authoritative.
   *
   * Note this is the record, not the gate. The gate (should the Pixel fire on
   * this browser?) is per-browser, has to be readable before any tag loads,
   * and exists for visitors who never submit — so it stays client-side. See
   * lib/consent.ts.
   */
  consent: boolean;
};

/**
 * Custom-field values, keyed by the GHL field key WITHOUT the `contact.`
 * prefix. Only keys that resolve to a real field are sent.
 *
 * Deliberately absent: `interest` and `buyer_state`. Both are set by click
 * behaviour and workflows respectively, never at capture — writing them here
 * would clobber state the automation owns.
 */
function fieldValues(c: ContactFields): Record<string, string> {
  const out: Record<string, string> = {
    parent_audience: PARENT_AUDIENCE,
    traffic_source: c.trafficSource,
  };

  /*
    `lead_magnet` is NOT written here — deliberately, and it is the one field
    that must never appear on this upsert.

    It's a single-select holding one value, and its job is attribution: which
    guide brought this person in. Because GHL's upsert overwrites whatever it
    is given, including it here would re-attribute anyone who comes back for a
    second guide, and the acquisition fact would be gone for good.

    It's written separately, after the upsert tells us the contact was created.
    See `writeLeadMagnet` and the ordering note in upsertContact.

    The full set of magnets someone holds lives on the `lead-magnet-*` tags,
    which is what the nurture workflows trigger on — never read this field to
    decide what someone has.
  */

  // Only send what we actually have; empty strings overwrite real data with
  // blanks on a repeat submission.
  if (c.campaign) out.campaign = c.campaign;
  if (c.utmSource) out.utm_source = c.utmSource;
  if (c.utmMedium) out.utm_medium = c.utmMedium;
  if (c.utmCampaign) out.utm_campaign = c.utmCampaign;
  if (c.utmContent) out.utm_content = c.utmContent;
  if (c.utmTerm) out.utm_term = c.utmTerm;
  if (c.landingPage) out.landing_page = c.landingPage;

  /*
    PHONE GOES IN A CUSTOM FIELD, NOT GHL's NATIVE `phone`.

    Measured 2026-09-08: GoHighLevel deduplicates contacts on phone number.
    Two upserts with different emails and the SAME phone collapse into ONE
    contact, and the later email overwrites the earlier one — so the first
    person's address is destroyed and they silently stop receiving anything.

    Verified with a direct probe: four upserts, two of which shared a phone,
    produced three contacts. The duplicate-phone pair merged.

    That matters here because a shared household or work number is completely
    ordinary, and because the `delivered-*` idempotency tags are read off the
    contact found by email — on a merged record those tags belong to someone
    else, which can suppress a real delivery.

    Keeping the number out of the native field avoids all of it. Nothing is
    lost today: no SMS is sent (A2P isn't filed) and nothing dials it, so the
    native field bought us dedupe risk and no capability.

    TO GO NATIVE LATER (only once SMS actually matters): send `phone` on the
    upsert body in upsertContact and drop this line — and decide first what
    should happen when two subscribers share a number.
  */
  if (c.phone) out.phone_number = c.phone;

  /*
    Permission record. `marketing_consent` already exists in this sub-account
    as a CHECKBOX, so this needs no new field.

    Only ever written as true. A false would mean "this browser hadn't granted
    consent", which is a statement about a browser, not a withdrawal of
    permission — and writing it would let a visitor on a fresh device silently
    downgrade a consent they gave earlier. Withdrawal comes from unsubscribe,
    which WF-4 handles as a hard suppression.
  */
  if (c.consent) {
    out.marketing_consent = "true";
    // Timestamp, if the field has been created. Skipped silently otherwise.
    out.consent_at = new Date().toISOString();
    /*
      WHICH disclosure they agreed to. A boolean alone can't answer "consented
      to what?", which is the question that actually matters if the basis for a
      send is ever challenged. Always overwritten, unlike lead_magnet: the most
      recent disclosure someone accepted is the one that governs.
    */
    if (c.consentVersion) out.consent_version = c.consentVersion;
  }

  return out;
}

/** Dropdown values for the single-select `lead_magnet` field. */
const LEAD_MAGNET_FIELD: Record<LeadMagnet, string> = {
  decode: "Decode",
  vetbill: "VetBill",
  newsletter: "Newsletter",
};

/**
 * Tags carry the things a single-select field can't.
 *
 * `lead_magnet` records only the FIRST magnet, for attribution — someone who
 * takes Decode this week and Vet Bill next week would otherwise overwrite it.
 * The `lead-magnet-*` tags carry the full set.
 *
 * ---------------------------------------------------------------------------
 * `lead-magnet-<concept>` IS THE DELIVERY TRIGGER. DO NOT RENAME IT.
 * ---------------------------------------------------------------------------
 * As of 2026-09-09 the GHL delivery workflows trigger on Contact Tag matching
 * these exact strings, replacing an Inbound Webhook that fired but left every
 * workflow action skipped for want of a contact in context.
 *
 * So this function is no longer just record-keeping — it is the mechanism that
 * sends someone their guide. A typo here does not produce an error; it
 * produces a subscriber who never receives anything, silently. The nurture
 * workflows trigger on the same tags.
 *
 * If you change a string here, change the trigger in GHL in the same breath.
 */
export const tagsFor = (m: LeadMagnet) => [
  "audience-pets-dogs",
  `lead-magnet-${m}`,
];


function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function headers() {
  return {
    Authorization: `Bearer ${env("GHL_API_KEY")}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/* -------------------------------------------------------------------------
   Custom field id resolution
   ------------------------------------------------------------------------- */

let fieldIdCache: Map<string, string> | null = null;
let warnedMissing = false;

/**
 * Maps bare field key -> field id. Cached in module scope, so on Fluid Compute
 * (which reuses instances) this is roughly one call per cold start.
 */
async function fieldIds(): Promise<Map<string, string>> {
  if (fieldIdCache) return fieldIdCache;

  const res = await fetch(
    `${API}/locations/${env("GHL_LOCATION_ID")}/customFields`,
    { headers: headers(), cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`GHL customFields ${res.status}`);
  }

  const body = (await res.json()) as {
    customFields?: Array<{ id: string; fieldKey: string }>;
  };

  const map = new Map<string, string>();
  for (const f of body.customFields ?? []) {
    // fieldKey comes back prefixed, e.g. "contact.utm_source"
    map.set(f.fieldKey.replace(/^contact\./, ""), f.id);
  }

  fieldIdCache = map;
  return map;
}

/* -------------------------------------------------------------------------
   Public surface
   ------------------------------------------------------------------------- */

export type UpsertResult = {
  contactId: string;
};

/**
 * Creates or updates the contact. Naturally idempotent on email — GHL dedupes,
 * so calling twice produces one contact.
 *
 * ---------------------------------------------------------------------------
 * THE ORDERING HERE IS THE WHOLE POINT — measured, not guessed (2026-09-08)
 * ---------------------------------------------------------------------------
 * Both the first-touch attribution and the delivery idempotency need to know
 * something about the contact as it was BEFORE this call. The obvious way to
 * get that is to look the contact up first, and that is exactly what was
 * broken: GHL's `GET /contacts/?query=` is a SEARCH INDEX and it lags writes.
 *
 * Probed directly — write a tag, then read it back two ways with no delay:
 *
 *   GET /contacts/{id}          -> ["probe-immediate"]   (strongly consistent)
 *   GET /contacts/?query=email  -> 0 rows                (index hasn't caught up)
 *
 * A zero-row search result is therefore ambiguous: it means either "no such
 * contact" or "created moments ago and not indexed yet", and nothing in the
 * response distinguishes them. Attribution built on that read silently breaks
 * for the case it exists to handle — someone taking a second guide shortly
 * after the first looked brand new, so `lead_magnet` got overwritten. That's
 * how a decode-then-vetbill sequence ended up attributed to VetBill.
 *
 * So the search index is not consulted at all any more. Instead:
 *
 *   1. Upsert WITHOUT `lead_magnet`. The response carries GHL's own `new`
 *      flag, which is authoritative because it comes from the write itself —
 *      `{"new": true}` on create, `{"new": false, "succeeded": true}` on
 *      update, same `contact.id` either way.
 *   2. `new: true` means nobody existed, so this IS the first touch and there
 *      can be no prior tags. Write `lead_magnet` now, by id.
 *   3. `new: false` means they existed, so read their tags by id — the
 *      consistent path — for the delivery decision.
 *
 * Net effect: one fewer round trip than the old search-first version, and the
 * two decisions rest on the write's own answer rather than on a cache.
 */
export async function upsertContact(c: ContactFields): Promise<UpsertResult> {
  const locationId = env("GHL_LOCATION_ID");
  const ids = await fieldIds();

  const wanted = fieldValues(c);

  const customFields: Array<{ id: string; field_value: string }> = [];
  const missing: string[] = [];
  for (const [key, value] of Object.entries(wanted)) {
    const id = ids.get(key);
    if (id) customFields.push({ id, field_value: value });
    else missing.push(key);
  }

  if (missing.length && !warnedMissing) {
    warnedMissing = true;
    console.warn(
      `[ghl] ${missing.length} custom field(s) do not exist in this sub-account ` +
        `and were NOT written: ${missing.join(", ")}. ` +
        `Create them (Settings > Custom Fields) with these exact keys, then ` +
        `redeploy. Run "npm run check:ghl" for a full report.`,
    );
  }

  /*
    Tags are DELIBERATELY not sent here.

    GHL's upsert REPLACES the tag array rather than merging, so sending a
    computed list means a read failure or two concurrent submits can overwrite
    the contact's real tags with just these two — destroying delivered-*
    markers plus every tag the workflows own (suppression, buyer state,
    nurture membership).

    The additive endpoint can't do that, so tags are applied after the upsert
    via addTags().
  */
  const res = await fetch(`${API}/contacts/upsert`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({
      locationId,
      email: c.email,
      /*
        Native fields, spread conditionally. Sending `firstName: ""` would
        blank a name captured on an earlier submission — and the newsletter
        form doesn't collect any of these, so it must not send them at all.
      */
      ...(c.firstName ? { firstName: c.firstName } : {}),
      ...(c.lastName ? { lastName: c.lastName } : {}),
      /*
        No `phone` here — deliberately. GHL dedupes contacts on phone, so
        sending it merges two subscribers who share a number and destroys one
        of their email addresses. It goes to the `phone_number` custom field
        instead; see the note in fieldValues().
      */
      ...(customFields.length ? { customFields } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GHL upsert ${res.status}: ${await safeText(res)}`);
  }

  /*
    `new` is GHL's own create-vs-update answer and the only trustworthy one.
    Verified shape: `{"new": true, ...}` on create, and
    `{"new": false, "succeded": true, "succeeded": true, ...}` on update —
    note GHL ships both the misspelt and correct key; neither is read here.

    Defaulting an absent `new` to false is the safe direction: it means we
    treat the contact as pre-existing, skip the `lead_magnet` write, and fall
    back to reading tags. An unset attribution is backfillable from the
    `lead-magnet-*` tags at any time; an overwritten one is gone. Prefer the
    recoverable failure.
  */
  const body = (await res.json()) as {
    new?: boolean;
    contact?: { id?: string };
  };
  const contactId = body.contact?.id;
  if (!contactId) throw new Error("GHL upsert returned no contact id");
  const created = body.new === true;

  /*
    A contact created a moment ago cannot carry a `delivered-*` tag, so there
    is nothing to read and `[]` is a fact rather than an assumption. Only the
    update path needs the round trip.
  */
  const existingTags = created ? [] : await readContactTags(contactId);

  /*
    FIRST TOUCH IS "NO lead-magnet-* TAG YET", NOT MERELY "CREATED JUST NOW".

    `created` alone is too narrow and skipping the write whenever it's false
    leaves attribution permanently blank for anyone who already had a record
    for some other reason — someone who used the contact form first, was
    imported, or was added by hand in the GHL UI. Their first actual guide is
    still the magnet that acquired them.

    So the tag test is back, but it is now safe in a way it wasn't before. What
    made the old version wrong was never the test itself — it was reading the
    tags from the eventually-consistent `?query=` search index, where "not
    indexed yet" is indistinguishable from "doesn't exist". `readContactTags`
    reads by id, which is strongly consistent.

    `existingTags === null` (the read failed) still skips the write: an unset
    `lead_magnet` can be backfilled from the tags at any time, an overwritten
    one cannot. Prefer the recoverable failure.
  */
  const isFirstTouch =
    created ||
    (existingTags !== null &&
      !existingTags.some((t) => t.startsWith("lead-magnet-")));

  if (isFirstTouch) {
    await writeLeadMagnet(contactId, c.leadMagnet, ids);
  }

  /*
    Additive, so it can't clobber anything the workflows own.

    Best-effort, and that matters: this used to throw, and it runs BEFORE the
    caller fires the delivery webhook. A transient 429 or 5xx on the tag
    endpoint therefore failed the whole request after the contact had already
    been created — so the person was acquired and then never sent the guide
    they asked for.

    Tags are reconstructible from the contact record; a delivery someone never
    received is not. The nurture workflows trigger on `lead-magnet-*`, so a
    failure here does need to be visible in the logs.
  */
  try {
    await addTags(contactId, tagsFor(c.leadMagnet));
  } catch (err) {
    console.error(`[ghl] tagging ${contactId} failed (delivery continues):`, err);
  }

  return { contactId };
}

/**
 * Tags currently on the contact, read by id.
 *
 * By id specifically: `GET /contacts/{id}` reflects writes immediately, while
 * the `?query=` search endpoint lags them. See the ordering note on
 * upsertContact for the measurement — that lag was a live attribution bug.
 *
 * Returns `null` when the read failed, which the caller must not treat as `[]`.
 */
async function readContactTags(contactId: string): Promise<string[] | null> {
  try {
    const res = await fetch(`${API}/contacts/${contactId}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = (await res.json()) as { contact?: { tags?: string[] } };
    return body.contact?.tags ?? [];
  } catch {
    return null;
  }
}

/**
 * Writes the first-touch attribution, by id, on its own.
 *
 * A targeted PUT rather than a second upsert on purpose: an upsert re-enters
 * GHL's dedupe matching, and this call already knows exactly which record it
 * means. Verified 2026-09-08 that the PUT writes the one field and leaves
 * tags, email and every other field untouched.
 *
 * Best-effort. By the time this runs the contact exists and the guide is about
 * to be delivered, so failing the request over an attribution field would cost
 * a real delivery to protect a value that can be backfilled from the
 * `lead-magnet-*` tags.
 */
async function writeLeadMagnet(
  contactId: string,
  magnet: LeadMagnet,
  ids: Map<string, string>,
) {
  /*
    `lead_magnet` is no longer part of the upsert's field set, so it isn't
    covered by the missing-field warning there. `npm run check:ghl` is what
    guards its existence, and it exits non-zero, so this returning silently
    can't hide a misconfigured sub-account from a deploy.
  */
  const id = ids.get("lead_magnet");
  if (!id) return;

  try {
    const res = await fetch(`${API}/contacts/${contactId}`, {
      method: "PUT",
      headers: headers(),
      cache: "no-store",
      body: JSON.stringify({
        customFields: [{ id, field_value: LEAD_MAGNET_FIELD[magnet] }],
      }),
    });
    if (!res.ok) {
      console.error(
        `[ghl] lead_magnet write ${res.status} for ${contactId}: ${await safeText(res)}`,
      );
    }
  } catch (err) {
    console.error("[ghl] lead_magnet write failed:", err);
  }
}

/** Adds tags without touching the ones already there. */
async function addTags(contactId: string, tags: string[]) {
  const res = await fetch(`${API}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) {
    throw new Error(`GHL tag ${res.status}: ${await safeText(res)}`);
  }
}




/* -------------------------------------------------------------------------
   Contact form — a question, not a lead
   ------------------------------------------------------------------------- */

/**
 * Records a contact-form enquiry.
 *
 * Deliberately separate from `upsertContact` and deliberately narrow:
 *
 *  - It does NOT write `marketing_consent`, `lead_magnet`, `traffic_source`
 *    or any `lead-magnet-*` / `audience-*` tag. Someone asking a question has
 *    not opted into marketing, and tagging them as a lead would enrol them in
 *    a nurture sequence they never agreed to.
 *  - It does NOT fire a delivery webhook. Nothing is being delivered.
 *  - The only tag is `contact-form`, so enquiries are findable.
 *
 * The message is written twice on purpose: to the `contact_message` field so
 * it's visible on the contact record at a glance, and as a NOTE so the full
 * history survives a second enquiry overwriting the field.
 *
 * ---------------------------------------------------------------------------
 * IT MUST NOT OVERWRITE A SUBSCRIBER'S EXISTING DATA
 * ---------------------------------------------------------------------------
 * An enquiry usually arrives from someone who is ALREADY a contact, so every
 * field written here lands on a record that other data already depends on.
 * An earlier version wrote three fields it had no business touching, and each
 * destroyed something unrecoverable:
 *
 *  - `landing_page` -> overwritten with `/contact`. That field means "which
 *    page captured them". A paid lead who later asked a question permanently
 *    lost their acquisition page.
 *  - `firstName` -> sent unconditionally as the single name field, so someone
 *    captured as firstName `Sam` / lastName `Rivera` became firstName
 *    `Sam Rivera`.
 *  - `consent_version` -> overwritten with the contact-form version while
 *    `marketing_consent` and `consent_at` stayed put. The audit trail then
 *    claimed they accepted wording that reads "It doesn't sign you up to
 *    anything" — the precise opposite of a marketing permission.
 *
 * So the upsert now writes ONE field, `contact_message`. The page path and the
 * disclosure version go in the note instead, where they're a record of the
 * enquiry rather than a claim about the contact. `firstName` is written only
 * when this call actually created the record.
 */
export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
  consentVersion: string | null;
  pagePath: string | null;
}): Promise<void> {
  const locationId = env("GHL_LOCATION_ID");
  const ids = await fieldIds();

  /*
    One field only. See the note above on what the extra ones destroyed —
    `landing_page` and `consent_version` belong to the capture path and are
    recorded in the note below instead.
  */
  const messageFieldId = ids.get("contact_message");
  const customFields = messageFieldId
    ? [{ id: messageFieldId, field_value: input.message }]
    : [];

  const res = await fetch(`${API}/contacts/upsert`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({
      locationId,
      email: input.email,
      /*
        No `firstName` here. GHL's upsert overwrites what it's given, and an
        enquirer is usually an existing contact whose name is already split
        properly across firstName/lastName. Written below only on a create.
      */
      ...(customFields.length ? { customFields } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GHL contact upsert ${res.status}: ${await safeText(res)}`);
  }

  const body = (await res.json()) as {
    new?: boolean;
    contact?: { id?: string };
  };
  const contactId = body.contact?.id;
  if (!contactId) throw new Error("GHL upsert returned no contact id");

  /*
    Only on a create, and only then, is there no name to damage.

    A contact form gives one name field while GHL splits first/last, so the
    whole string goes in firstName rather than being guessed apart — a
    "Mary Jo Van Der Berg" cannot be split reliably, and a wrong guess shows
    up in the greeting line of every email afterwards.
  */
  if (body.new === true) {
    try {
      const named = await fetch(`${API}/contacts/${contactId}`, {
        method: "PUT",
        headers: headers(),
        cache: "no-store",
        body: JSON.stringify({ firstName: input.name }),
      });
      if (!named.ok) {
        console.error(`[ghl] contact name ${named.status}: ${await safeText(named)}`);
      }
    } catch (err) {
      console.error("[ghl] contact name write failed:", err);
    }
  }

  /*
    Best-effort, like the note. The message is already on the record by this
    point, so failing the request over a tag would show the visitor an error
    for an enquiry that actually landed — and they'd send it again.
  */
  try {
    await addTags(contactId, ["contact-form"]);
  } catch (err) {
    console.error(`[ghl] contact-form tag on ${contactId} failed:`, err);
  }

  /*
    The note is the durable copy, and now also the only record of which page
    they wrote from and which disclosure they saw. Best-effort: the enquiry is
    already on the record via the field and the tag by this point, so failing
    the whole request over a note would lose a message that actually landed.
  */
  try {
    const lines = [
      `Contact form (${input.pagePath ?? "/contact"})`,
      input.consentVersion ? `Disclosure: ${input.consentVersion}` : null,
      "",
      input.message,
    ].filter((l) => l !== null);

    const note = await fetch(`${API}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: headers(),
      cache: "no-store",
      body: JSON.stringify({ body: lines.join("\n") }),
    });
    if (!note.ok) {
      console.error(`[ghl] note ${note.status}: ${await safeText(note)}`);
    }
  } catch (err) {
    console.error("[ghl] note failed:", err);
  }
}

/** Never let a diagnostic read throw over the original error. */
async function safeText(res: Response) {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "<no body>";
  }
}

export { PARENT_AUDIENCE, TRAFFIC_SOURCE };
