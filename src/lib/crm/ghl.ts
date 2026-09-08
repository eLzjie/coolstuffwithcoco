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
 *  - Of the 12 fields in the build spec, only 5 existed at time of writing:
 *      present  utm_source utm_medium utm_campaign utm_content buyer_state
 *      MISSING  parent_audience lead_magnet interest traffic_source
 *               campaign utm_term landing_page
 *    Missing fields are skipped and named in a single warning per cold start,
 *    rather than sent blind and dropped. Run `npm run check:ghl` for a report.
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
    lead_magnet: LEAD_MAGNET_FIELD[c.leadMagnet],
    traffic_source: c.trafficSource,
  };
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
 * The `lead-magnet-*` tags carry the full set, and the nurture workflows
 * trigger on those tags. Never read the field to decide what someone has.
 */
export const tagsFor = (m: LeadMagnet) => [
  "audience-pets-dogs",
  `lead-magnet-${m}`,
];

/** Per-concept delivery marker — the idempotency key. */
export const deliveredTag = (m: LeadMagnet) => `delivered-${m}`;

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
  /**
   * Tags the contact had BEFORE this upsert, or `null` when the lookup
   * failed and we genuinely don't know.
   *
   * `null` is not the same as `[]` and callers must not conflate them: `[]`
   * means "definitely no tags", `null` means "couldn't read". Treating a
   * failed read as `[]` is how a delivery gets suppressed or re-sent wrongly.
   */
  existingTags: string[] | null;
};

/**
 * Creates or updates the contact. Naturally idempotent on email — GHL dedupes,
 * so calling twice produces one contact.
 *
 * Returns the tags the contact had beforehand, which is what the delivery
 * decision is made on.
 */
export async function upsertContact(c: ContactFields): Promise<UpsertResult> {
  const locationId = env("GHL_LOCATION_ID");

  // Independent calls — run them together rather than adding a round trip to
  // the critical path of every submit.
  const [before, ids] = await Promise.all([
    findContactTags(c.email, locationId),
    fieldIds(),
  ]);

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
    computed list means a read failure, a fuzzy-search miss, or two concurrent
    submits can overwrite the contact's real tags with just these two —
    destroying delivered-* markers plus every tag the workflows own
    (suppression, buyer state, nurture membership).

    The additive endpoint below can't do that, so tags are applied after the
    upsert via addTags(). The lookup above is now read-only, used solely for
    the idempotency decision.
  */
  const res = await fetch(`${API}/contacts/upsert`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({
      locationId,
      email: c.email,
      ...(customFields.length ? { customFields } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GHL upsert ${res.status}: ${await safeText(res)}`);
  }

  const body = (await res.json()) as { contact?: { id?: string } };
  const contactId = body.contact?.id;
  if (!contactId) throw new Error("GHL upsert returned no contact id");

  // Additive, so it can't clobber anything the workflows own.
  await addTags(contactId, tagsFor(c.leadMagnet));

  return { contactId, existingTags: before };
}

/**
 * Tags currently on the contact.
 *
 * Returns `[]` when the contact genuinely doesn't exist, and `null` when the
 * lookup failed — the caller has to tell those apart.
 */
async function findContactTags(
  email: string,
  locationId: string,
): Promise<string[] | null> {
  const url = new URL(`${API}/contacts/`);
  url.searchParams.set("locationId", locationId);
  url.searchParams.set("query", email);
  // `query` is a FUZZY search that can rank another contact first (matching a
  // name or partial). With limit=1 the real contact may not be in the page at
  // all, so the exact-match filter below finds nothing and we'd wrongly
  // conclude "no tags". Ask for enough rows that the exact match is present.
  url.searchParams.set("limit", "20");

  try {
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      contacts?: Array<{ email?: string | null; tags?: string[] }>;
    };

    const target = email.toLowerCase();
    const hit = body.contacts?.find((x) => x.email?.toLowerCase() === target);
    // No hit across the page = no such contact. Distinct from a failed read.
    return hit?.tags ?? [];
  } catch {
    return null;
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

/** Adds the delivered marker so a repeat submission won't re-send. */
export async function markDelivered(contactId: string, m: LeadMagnet) {
  await addTags(contactId, [deliveredTag(m)]);
}

const WEBHOOK_ENV: Record<LeadMagnet, string> = {
  decode: "GHL_WEBHOOK_DECODE",
  vetbill: "GHL_WEBHOOK_VETBILL",
  newsletter: "GHL_WEBHOOK_NEWSLETTER",
};

/**
 * Fires the concept's Inbound Webhook, which is what actually triggers the
 * delivery workflow.
 *
 * This is separate from the upsert on purpose and the two must not be
 * collapsed: an API upsert does NOT fire GHL's "form submitted" trigger, and
 * "Contact Created" won't fire for someone who already exists — so a returning
 * subscriber coming back for the second guide would never receive it.
 */
export async function fireDeliveryWebhook(c: ContactFields) {
  const url = process.env[WEBHOOK_ENV[c.leadMagnet]];
  if (!url) {
    throw new Error(
      `Missing ${WEBHOOK_ENV[c.leadMagnet]} — the delivery workflow cannot be triggered`,
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      email: c.email,
      lead_magnet: c.leadMagnet,
      parent_audience: PARENT_AUDIENCE,
      traffic_source: c.trafficSource,
      campaign: c.campaign,
      utm_source: c.utmSource,
      utm_medium: c.utmMedium,
      utm_campaign: c.utmCampaign,
      utm_content: c.utmContent,
      utm_term: c.utmTerm,
      landing_page: c.landingPage,
    }),
  });

  if (!res.ok) {
    throw new Error(`GHL webhook ${res.status}: ${await safeText(res)}`);
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
