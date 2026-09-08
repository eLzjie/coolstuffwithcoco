/**
 * Coco's Library — the paid offer on the thank-you pages.
 *
 * ---------------------------------------------------------------------------
 * WEDNESDAY STATE: THIS IS A WAITLIST, NOT A CHECKOUT
 * ---------------------------------------------------------------------------
 * Neither v1 title is written yet and there is no GHL order form URL. So the
 * offer captures interest at a stated price rather than taking money, which
 * removes the refund, chargeback and "where's my product" exposure entirely
 * while still qualifying and segmenting the people who want it.
 *
 * Flip `OFFER_MODE` to "checkout" when both are true: the first two titles
 * exist, and CHECKOUT_URL is set. Nothing else needs to change.
 */

export type OfferMode = "waitlist" | "checkout";

/** Waitlist until the products exist and a checkout URL is set. */
export const OFFER_MODE: OfferMode = "waitlist";

/**
 * The GHL order form. Empty until it exists.
 *
 * Deliberately not a placeholder URL — a CTA that 404s on launch day is worse
 * than a CTA that honestly isn't a checkout yet.
 */
export const CHECKOUT_URL = "";

/* -------------------------------------------------------------------------
   PRICE
   ------------------------------------------------------------------------- */

/**
 * How the price is presented. THIS IS THE ONE LINE TO CHANGE.
 *
 * ---------------------------------------------------------------------------
 * WHY "anchor" IS NOT THE DEFAULT, DESPITE BEING WHAT WAS ASKED FOR
 * ---------------------------------------------------------------------------
 * The instruction was "$29.99 crossed out to $15". It is implemented below and
 * one word switches it on. It is not the default because the research came
 * back harder than the request assumed, and the person choosing should choose
 * knowingly:
 *
 *  - 16 CFR 233.1's own first example of a fictitious price comparison is
 *    "a price at which he never offered the article at all". The Library has
 *    never been offered at $29.99, so this is the named case, not a grey area.
 *  - Relabelling does not cure it. "Compare at" is what Overstock was
 *    penalised $6.8M for; a bare strikethrough is itself the former-price
 *    claim.
 *  - California B&P 17501 requires either a prevailing market price in the
 *    preceding three months or a conspicuously stated date on which the former
 *    price prevailed. There is no such date to state, and a US dog-owner
 *    audience guarantees California traffic.
 *  - The FTC's own dark-patterns staff report lists "False Discount Claims" as
 *    a dark pattern — so it collides with this project's LOCKED "no dark
 *    patterns, no fake scarcity" rule before any lawyer is involved.
 *
 * "launch" is the default because it is true, it explains the low price
 * instead of inventing a discount, and 16 CFR 233.5 permits it on one
 * condition: the price must actually rise later. If nobody intends to raise
 * it, switch to "flat" rather than lying forward.
 *
 * "two-prices" is the strongest framing but needs the $12 single guide to be
 * genuinely buyable first. Arithmetic between two real prices is not a
 * former-price claim at all, so 233.1 never engages.
 */
export type PriceMode = "launch" | "two-prices" | "flat" | "anchor";

export const PRICE_MODE: PriceMode = "launch";

/** What the Library costs. Analytics sends this number; never the anchor. */
export const LIBRARY_PRICE = 15;

/**
 * The single-guide price, for "two-prices" mode.
 *
 * MUST be genuinely purchasable by the same visitor at the same moment before
 * that mode ships. A single-guide price that exists only to make $15 look good
 * is the same fiction relabelled, and 16 CFR 233.4(b) covers it.
 */
export const SINGLE_PRICE = 12;

/**
 * The eventual full price, for "launch" and "anchor" modes.
 *
 * In "launch" mode this is a FORWARD claim — what it goes to — which is only
 * honest if it happens. Pick a date, tell Chase, and actually raise it.
 */
export const FULL_PRICE = 29;

/* -------------------------------------------------------------------------
   CONTENTS
   ------------------------------------------------------------------------- */

/**
 * What's in the Library.
 *
 * ---------------------------------------------------------------------------
 * ONLY THE TWO v1 TITLES ARE LISTED, AND THAT IS DELIBERATE
 * ---------------------------------------------------------------------------
 * The product research ranks five candidates, and the temptation is to list
 * all five so the bundle looks bigger. Two reasons not to:
 *
 *  1. The presenter's paradox (JCR, seven studies): adding weaker or
 *     not-yet-existing items AVERAGES DOWN the perceived value of the whole
 *     bundle rather than adding to it. A tight two beats a padded five.
 *  2. Three of them aren't written. Listing them as contents is a claim about
 *     something that doesn't exist.
 *
 * `PLANNED` exists so the page can say what's coming honestly, in its own
 * visually distinct block — named as planned, never as included.
 */
export const LIBRARY_V1: Array<{
  title: string;
  blurb: string;
  /** Written and ready to send? Drives the honest availability line. */
  ready: boolean;
}> = [
  {
    title: "The Home Alone Guide",
    blurb:
      "What alone-time distress actually looks like, how to tell boredom from the real thing, and what to do about either. The question Decode leaves you with.",
    ready: false,
  },
  {
    title: "The Coco Paperwork Pack",
    blurb:
      "The fill-in stuff: vaccination and health record, vet visit log, medication schedule, grooming log, the dog-sitter handover sheet, emergency contact card.",
    ready: false,
  },
];

/** Named as planned, never as included. Order is the research's ranking. */
export const PLANNED: string[] = [
  "He's Not Aggressive, He's Scared — reactivity",
  "The First 30 Days — rescue and rehome",
  "The Walk — leash pulling and manners",
];

/**
 * The positioning line, and the reason this offer is framed as a kit.
 *
 * Straight from the product research: "Eight PDFs of prose at $27-30 invites
 * the thought 'that's a lot of reading.' A library — guides plus fill-in
 * trackers plus the fridge cards — feels like a kit you'll use, not homework."
 *
 * The free guides already proved it — the quick-reference card is the piece
 * people keep. So the Paperwork Pack leads, and the guides are the depth
 * behind it.
 */
export const LIBRARY = {
  name: "Coco's Library",
  /** Per-concept bridge: names the gap the free guide just left. */
  bridge: {
    decode: {
      heading: "You can read her now. The next bit is when you're not there.",
      body: "Decode teaches you to spot distress. It doesn't tell you what to do when the distress is you leaving — and that's the one owners worry about most. In a survey of 600 US owners, 61% named it their single biggest behavioural concern, and 72% said they worry about their dog being alone.",
    },
    vetbill: {
      heading: "The page you'll actually use is page 12.",
      body: "It's the fill-in one — your vet, the nearest 24-hour clinic, your dog's details. That's the piece people keep, and the Paperwork Pack is the rest of it: health records, a vet visit log, a medication schedule, the handover sheet for whoever has her when you don't.",
    },
    newsletter: {
      heading: "There's a shelf of these now.",
      body: "The ones that took longer to work out, and the ones I only wrote because enough people asked the same question twice.",
    },
  },
} as const;

/* -------------------------------------------------------------------------
   Copy that carries a compliance obligation
   ------------------------------------------------------------------------- */

/**
 * The availability disclosure. NOT optional, and not shrinkable.
 *
 * The FTC's dry-testing guidance is the template: name what exists today, say
 * plainly that the rest is planned and may not ship, give a window, and
 * provide a way out. This is a waitlist rather than a sale, which lowers the
 * stakes — but the honest disclosure is what makes it a waitlist rather than
 * a pre-order in disguise.
 *
 * Must render at the same visual weight as the price. A disclosure that is
 * legible only if you go looking is itself in the FTC's dark-patterns
 * taxonomy under information hiding.
 */
export const AVAILABILITY =
  "Nothing to pay today, and nothing is written yet — I'm building these now. Join the list and I'll email you the day the first two are up, at the price above. If they never ship, you've lost nothing and you can leave the list from any email.";

/**
 * Liability guardrails for the two v1 titles, restated where the copy lives.
 *
 * HOME ALONE: separation anxiety is a diagnosis. Clinical prevalence sits far
 * below what owners self-report, so some readers have a bored dog and some
 * have one who needs a vet. The guide helps tell the difference and STOPS
 * THERE — no diagnosis, no medication discussion, no promises. Never use the
 * circulating 85.9% figure; the paper's own authors call it an overstatement.
 * The sourced numbers are 61% and 72%.
 *
 * REACTIVITY (not v1, but the copy will be written from this file eventually):
 * highest liability on the site. Scope to understanding and de-escalation
 * only, never a training or handling protocol, and state plainly that any bite
 * history or bite risk goes to a qualified behaviourist.
 */
export const OFFER_DISCLAIMER =
  "General guidance for dog owners — not veterinary or behavioural advice. If your dog's distress is severe or you're worried about their health, that's a conversation for your vet.";
