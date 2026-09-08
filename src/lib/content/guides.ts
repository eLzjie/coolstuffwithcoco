/**
 * Guide content and page copy.
 *
 * Written in Coco's voice: warm, plain-spoken, first person from Coco's human.
 * Sentence case, plain verbs, no clinical register.
 *
 * IMPORTANT — every factual claim in here is marked `verify: true` and carries
 * a TODO(Eli) note. Nothing marked `verify: true` should go live without
 * sign-off. Chapter lists are paraphrased from the brief's summary table, NOT
 * from the actual guide PDFs (which weren't in the repo) — so they need a pass
 * against the real documents.
 *
 * TODO(Eli): the guide PDFs weren't available. Confirm every chapter title and
 * description below against the real files.
 */

export type Chapter = {
  title: string;
  blurb: string;
};

/* ==========================================================================
   Decode Your Dog — curiosity
   ========================================================================== */

export const DECODE = {
  slug: "decode",
  wash: "bubblegum",
  title: "Decode Your Dog",
  /** The locked ad angle. Do not soften this without telling the media buyer. */
  hook: "Do you know what this look means?",
  subhook: "Most owners get it wrong.",
  promise:
    "Read your dog's body language, and finally understand the weird stuff they do.",
  intro:
    "Your dog talks constantly. Ears, tail, eyes, the way they sit down next to you — it's all saying something. Once you can read it, half the stuff that used to be baffling turns into a dog telling you exactly what they need.",
  chapters: [
    {
      title: "Face and body basics",
      blurb:
        "The signals that show up every single day, and what each one is actually telling you.",
    },
    {
      title: "The weird stuff",
      blurb:
        "Zoomies, the head tilt, kicking grass after a poo, staring at you while you eat. There's a reason for all of it.",
    },
    {
      title: "Calming signals",
      blurb:
        "The quiet things dogs do to defuse a moment. Easiest signals to miss, and the most useful ones to know.",
    },
    {
      title: "Stress or play?",
      blurb:
        "These two look almost identical, and mixing them up is how good afternoons go wrong. Here's how to tell.",
    },
    {
      title: "When it's not behaviour",
      blurb:
        "Some signals aren't personality — they're discomfort. What to notice, and when to ring your vet instead of a trainer.",
    },
    {
      title: "The quick-reference card",
      blurb: "One page. Stick it on the fridge. Everyone in the house learns the same language.",
    },
  ] satisfies Chapter[],
  audience: [
    "You've got a new dog and you're guessing a lot",
    "Your dog does something odd and nobody can tell you why",
    "You want to catch trouble before it turns into a growl",
    "You live with someone who reads the dog completely differently to you",
  ],
} as const;

/**
 * The three signals in "Guess the signal" on /decode.
 *
 * These are body-language claims, not medical ones — but they're still claims.
 * TODO(Eli): verify all three against the guide text before launch.
 */
export const SIGNALS = [
  {
    id: "whale-eye",
    prompt: "She turns her head away but keeps her eyes on you, showing the whites.",
    caption: "The side-eye",
    options: [
      { label: "She feels guilty", correct: false },
      { label: "She's uncomfortable and asking for space", correct: true },
    ],
    reveal:
      "That crescent of white is usually discomfort, not guilt. She's tracking something she's wary of while trying to look away from it. Give her room and the tension drops.",
    verify: true,
  },
  {
    id: "yawn",
    prompt: "Big, slow yawn — in the middle of the afternoon, nowhere near a nap.",
    caption: "The out-of-nowhere yawn",
    options: [
      { label: "She's settling herself down", correct: true },
      { label: "She's tired", correct: false },
    ],
    reveal:
      "A yawn away from bedtime is often a dog taking the edge off a moment. Vet waiting rooms are full of yawning dogs who slept all morning.",
    verify: true,
  },
  {
    id: "tail",
    prompt: "Tail going hard and fast, held high and stiff.",
    caption: "The wag that isn't a welcome",
    options: [
      { label: "She's pleased to see them", correct: false },
      { label: "She's wound up — could go either way", correct: true },
    ],
    reveal:
      "A wag means the dog is feeling something strongly, not that the something is good. High and stiff with a fast, tight beat is arousal. Look at the rest of her before you let anyone reach in.",
    verify: true,
  },
] as const;

/* ==========================================================================
   The $1,000 Vet Bill — protective, never predatory
   ========================================================================== */

export const VETBILL = {
  slug: "vetbill",
  wash: "sky",
  title: "The $1,000 Vet Bill",
  hook: "The vet bill you didn't plan for",
  subhook: "You can be ready for this one.",
  promise:
    "Know which symptoms mean call now, and what emergencies actually cost before you're standing at the counter.",
  intro:
    "Nobody makes good decisions at 2am with a sick dog and no idea what's coming. This is the boring preparation that makes that night easier: what's urgent, what can wait until morning, and roughly what the bill looks like either way.",
  chapters: [
    {
      title: "What emergencies actually cost",
      blurb:
        "Plain ranges by type, so the number at the counter isn't the first number you've seen.",
    },
    {
      title: "Call now, or wait until morning",
      blurb:
        "The symptom-by-symptom table. General categories, not a diagnosis — but enough to stop you guessing.",
    },
    {
      title: "The preventable big five",
      blurb:
        "Five of the most common expensive emergencies, and the unglamorous habits that head them off.",
    },
    {
      title: "Walk your house once",
      blurb:
        "A room-by-room hazard check. Takes twenty minutes and it's the cheapest thing in this guide.",
    },
    {
      title: "Your emergency contacts page",
      blurb:
        "Fill it in now, while nothing is wrong. Your vet, the nearest out-of-hours clinic, the poison line.",
    },
    {
      title: "Paying for it",
      blurb:
        "The options that exist, described plainly. Not advice, and not a recommendation — just what's out there.",
    },
    {
      title: "The quick-reference card",
      blurb: "One page on the fridge, so whoever's home knows what to do.",
    },
  ] satisfies Chapter[],
  audience: [
    "You've never had a real emergency and you'd rather not improvise your first one",
    "You want to know the number before you're standing at the counter",
    "There's more than one adult in the house and only one of you knows the vet's number",
    "You've had a scare already and don't want a repeat",
  ],
} as const;

/* --------------------------------------------------------------------------
   Call-now vs wait — the slice shown on the page.

   COMPLIANCE, non-negotiable:
   - This is general categories, never individualised advice.
   - It must not read as triage anyone can rely on.
   - Every "wait" row still points at a phone call.
   - The disclaimer renders INSIDE the component, not just in the footer.

   TODO(Eli): this table needs review and sign-off by a vet before launch.
   Do not publish it on my say-so.
   -------------------------------------------------------------------------- */

export type TriageRow = {
  sign: string;
  /** "now" = don't wait. "call" = ring your vet, likely not a 2am drive. */
  tier: "now" | "call";
  note: string;
};

export const TRIAGE: TriageRow[] = [
  {
    sign: "Struggling to breathe, or gums looking pale or blue",
    tier: "now",
    note: "Breathing trouble doesn't get a wait-and-see. Go.",
  },
  {
    sign: "Swallowed something toxic — or you think they might have",
    tier: "now",
    note: "Ring on your way, and take the packaging with you.",
  },
  {
    sign: "Hard, swollen belly with retching but nothing coming up",
    tier: "now",
    note: "This one moves fast. Treat it as an emergency.",
  },
  {
    sign: "Straining to urinate and producing little or nothing",
    tier: "now",
    note: "Hours matter here, especially with male dogs.",
  },
  {
    sign: "One vomit, then back to normal and drinking fine",
    tier: "call",
    note: "Still ring your vet and describe it. They decide, not you.",
  },
  {
    sign: "Mild limp that's easing, no yelping when touched",
    tier: "call",
    note: "Book it in. Rest it meanwhile and stop if it worsens.",
  },
];

/**
 * Cost ranges. Every figure is a placeholder.
 *
 * TODO(Eli): verify source. Nothing here goes live without sign-off — these
 * numbers are invented to hold the layout, not researched. The vet-cost survey
 * figures you mentioned are better sourced but still need your approval.
 */
export type CostRow = {
  label: string;
  range: string;
  /** The bit that stops a number being read as a quote. */
  note?: string;
};

/**
 * US emergency ranges, researched 2026-09-08.
 *
 * These replace the earlier `TODO(Eli)` placeholders. They are RANGES from
 * published pet-insurance and veterinary-cost aggregators, cross-checked
 * across several sources for consistency — NOT a peer-reviewed survey, and
 * not quotes. `COST_SOURCES` below lists what they came from, and the page
 * says all of this in plain sight rather than presenting them as authoritative.
 *
 * They are US figures. If the site ever targets outside the US these are
 * wrong and need replacing, not converting.
 */
export const COSTS: CostRow[] = [
  {
    label: "Walking in the door out of hours",
    range: "$100 – $250",
    note: "The exam and triage fee, before anything is done.",
  },
  {
    label: "Bloods or an X-ray",
    range: "$150 – $400 each",
    note: "Most emergencies involve at least one of these.",
  },
  {
    label: "A night in hospital",
    range: "$200 – $600",
    note: "Intensive care runs higher — $500 to $1,500 a night.",
  },
  {
    label: "Something swallowed, removed",
    range: "$2,000 – $3,500",
    note: "Caught early enough for an endoscope, nearer $800 – $2,000. If the gut is damaged and has to be resected, $3,500 – $6,000.",
  },
  {
    label: "Bloat surgery",
    range: "$3,000 – $8,000",
    note: "With the intensive care that follows it, total bills of $5,000 – $12,000 are common.",
  },
  {
    label: "A typical emergency visit, all in",
    range: "$800 – $3,000",
    note: "The two things that move this most are whether there's surgery and how many nights they stay.",
  },
];

/** Where the ranges above came from. Rendered on the page. */
export const COST_SOURCES: Array<{ name: string; url: string }> = [
  {
    name: "CareCredit — intestinal blockage surgery cost",
    url: "https://www.carecredit.com/well-u/pet-care/cat-and-dog-intestinal-blockage-surgery-cost-and-financing/",
  },
  {
    name: "Pawlicy Advisor — what a vet visit costs",
    url: "https://www.pawlicy.com/blog/vet-visit-cost/",
  },
  {
    name: "Lemonade — intestinal blockage surgery",
    url: "https://www.lemonade.com/pet/explained/intestinal-blockage-dog-surgery-cost/",
  },
  {
    name: "MetLife Pet Insurance — bloat in dogs",
    url: "https://www.metlifepetinsurance.com/blog/pet-health/bloat-in-dogs/",
  },
];

/* ==========================================================================
   Shared
   ========================================================================== */

/** Supplied by Eli, 2026-09-08. Wording is his — don't paraphrase it. */
export const DISCLAIMER =
  "General guidance only — not a substitute for veterinary care.";

/**
 * Longer form, used where there's room to say it properly.
 */
export const DISCLAIMER_LONG =
  "Cool Stuff with Coco shares general guidance for dog owners. It isn't veterinary care and it can't replace your vet. If you're worried about your dog, ring your vet or your nearest out-of-hours clinic.";

/**
 * Emergency numbers supplied by Eli on 2026-09-08. These are used verbatim as
 * given — do not "helpfully update", reformat or substitute them, and do not
 * add numbers from any other source.
 *
 * ---------------------------------------------------------------------------
 * THE FEE IS NOT OPTIONAL COPY — never ship these numbers without it
 * ---------------------------------------------------------------------------
 * Both lines charge per incident. We present them to someone who is frightened
 * and about to dial immediately, so omitting the charge sets them up for a
 * surprise bill at the worst possible moment — and it makes us the reason they
 * hit it. Whatever the legal position, that's not a thing to do to someone
 * mid-emergency.
 *
 * Amounts verified against each operator's own current pages, September 2026:
 *   - ASPCA APCC: $95 per incident (some case-dependent variation reported)
 *   - Pet Poison Helpline: $89 per incident, follow-ups included
 *
 * These change. Re-check before a campaign push, and if a number can't be
 * confirmed say "a per-incident fee applies" rather than printing a stale one —
 * a wrong figure is worse than a vague true one. Both render the fee already
 * (contact page and footer), so correcting it here is the whole change.
 *
 * Both are US lines. TODO(Eli): if the site takes meaningful UK/EU traffic,
 * these need a regional equivalent alongside them.
 */
export const HOTLINES: Array<{
  name: string;
  number: string;
  note: string;
  /** Displayed on its own line. See the fee note above before editing. */
  fee: string;
}> = [
  {
    name: "ASPCA Animal Poison Control",
    number: "(888) 426-4435",
    note: "If she's eaten something she shouldn't have.",
    fee: "$95 per incident",
  },
  {
    name: "Pet Poison Helpline",
    number: "(855) 764-7661",
    note: "Second line, if the first is busy.",
    fee: "$89 per incident",
  },
];

/** Where every legal page and the contact form point. */
export const SUPPORT_EMAIL = "info@mail.coolstuffwithcoco.com";

export const IG_HANDLE = "@coolstuffwithcoco";
export const IG_URL = "https://instagram.com/coolstuffwithcoco";
export const SITE_NAME = "Cool Stuff with Coco";

/**
 * Confirmed by Eli, 2026-09-08: the site ships on coolstuffwithcoco.com, so
 * brand name, IG handle and domain now all agree on "stuff". This supersedes
 * brief §8 entirely.
 *
 * Every canonical URL, the sitemap, robots.txt and the JSON-LD read from this
 * one constant.
 *
 * The GitHub repo is still named `coolthingswithcoco` — that's only a repo
 * name and doesn't affect anything served.
 */
export const SITE_URL = "https://coolstuffwithcoco.com";
