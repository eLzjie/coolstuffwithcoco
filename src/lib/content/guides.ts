/**
 * Guide content and page copy.
 *
 * Written in Coco's voice: warm, plain-spoken, first person from Coco's human.
 * Sentence case, plain verbs, no clinical register.
 *
 * ---------------------------------------------------------------------------
 * CHECKED AGAINST THE REAL GUIDES — 2026-09-08
 * ---------------------------------------------------------------------------
 * The v5 PDFs are now in docs/specs/ (`CTWCDecode YourDog V5.pdf`,
 * `CTWC VetBill v5.pdf`), so the chapter lists, the body-language claims and
 * the cost table below are no longer paraphrased from the brief's summary —
 * they're taken from the delivered documents. What that pass turned up:
 *
 *  - The cost table DISAGREED with the guide. See the note above COSTS.
 *  - Both chapter lists were missing a section that's in the guide.
 *  - The hazard audit was described as twenty minutes; the guide says ten.
 *  - All three SIGNALS claims checked out and are no longer flagged.
 *
 * THE GUIDE IS THE SOURCE OF TRUTH for anything a reader can compare. A number
 * on the landing page that differs from the same number in the PDF they just
 * downloaded costs more trust than a slightly stale figure would.
 *
 * So: if the guides are revised, re-read them and update this file. Anything
 * still marked `verify: true` has NOT been confirmed.
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
      title: "Coco's 7-day body language challenge",
      blurb:
        "One small observation a day for a week. Five minutes on the face, a day watching the tail, one calming signal to spot. By day seven you're reading the whole dog.",
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
 * CHECKED against `CTWCDecode YourDog V5.pdf` on 2026-09-08. All three match
 * the guide, so the `verify` flags are cleared:
 *
 *   whale eye  — guide: "Whites of the eyes showing / Step back. Do not push
 *                the interaction", cheat sheet: "Whale eye = stressed"
 *   yawn       — guide: "Not tired. Stress, or calming a tense moment. At the
 *                vet, in the car, around strangers"
 *   stiff wag  — guide: "A stiff, high, fast wag often signals arousal or
 *                tension, not joy. Read the whole body."
 *
 * These are body-language claims, not medical ones, and they are the guide's
 * own framing rather than ours. If the guide is revised, re-check them.
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
    verify: false,
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
    verify: false,
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
    verify: false,
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
      title: "Five mistakes that make emergencies cost more",
      blurb:
        "None of them are about being a bad owner. Waiting to see if it settles, not knowing where the 24-hour clinic is, assuming the first quote is the whole bill.",
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
        "A room-by-room hazard check. Takes about ten minutes and it's the cheapest thing in this guide.",
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

   PROVENANCE, updated 2026-09-08: these rows are now taken from Section 2 of
   `CTWC VetBill v5.pdf` ("Call Now, or Safe to Watch") rather than written
   here. That matters — the page was previously asserting its own triage
   categories, and quoting the delivered guide is both better provenance and
   guarantees the page and the PDF can't drift apart.

   ONE DELIBERATE DIFFERENCE: the guide's second column is headed "Safe to
   monitor". This site's second tier is "Ring your vet today", and it stays
   stricter on purpose. A landing page is read by people who have not yet read
   the surrounding context, caveats and cheat sheet that a guide reader has, so
   it should not hand out permission to wait. Do not "align" this away.

   TODO(Eli): still needs sign-off by a vet. Note the GUIDE has no vet sign-off
   either (confirmed 2026-09-08 as not obtainable before launch), so matching
   it improves consistency, not clinical authority. The disclaimer in
   CallNowTable is doing the real work here.
   -------------------------------------------------------------------------- */

export type TriageRow = {
  sign: string;
  /** "now" = don't wait. "call" = ring your vet, likely not a 2am drive. */
  tier: "now" | "call";
  note: string;
};

export const TRIAGE: TriageRow[] = [
  {
    sign: "Struggling to breathe, or gasping",
    tier: "now",
    note: "Breathing trouble never gets a wait-and-see. Flat-faced breeds least of all.",
  },
  {
    sign: "Gums gone pale, white, blue or grey",
    tier: "now",
    note: "Check them now so you know what normal looks like on your dog.",
  },
  {
    sign: "Unproductive retching with a hard, swollen belly",
    tier: "now",
    note: "The classic picture of bloat. This one moves in hours.",
  },
  {
    sign: "Collapse, or can't stand up",
    tier: "now",
    note: "Don't offer food or water if they're down. Ring and go.",
  },
  {
    sign: "Known or suspected poisoning",
    tier: "now",
    note: "Ring on the way and take the packaging with you. Don't induce vomiting unless you're told to.",
  },
  {
    sign: "Vomited once, then bright and drinking normally",
    tier: "call",
    note: "The reassuring part is the bright and eating. Still describe it to your vet — they decide, not you.",
  },
  {
    sign: "Mild limp, still putting weight on it",
    tier: "call",
    note: "Book it in. Rest it meanwhile, and stop waiting if it worsens.",
  },
  {
    sign: "Skipped one meal, otherwise completely normal",
    tier: "call",
    note: "Worth a mention rather than a drive. Any second change alongside it moves this up.",
  },
];

/**
 * One row of the cost table.
 *
 * `range` is a display string, not a number pair, because the guide prints it
 * that way and the guide is the source of truth. `CostChart` parses it for the
 * bar widths — see `parseRange` there, and its self-check.
 *
 * (This docstring previously said every figure was an unresearched placeholder.
 * That stopped being true on 2026-09-08 when the figures were replaced with the
 * guide's own table, and the block below explains the swap in full. Two adjacent
 * comments were contradicting each other about whether the live numbers were
 * verified; they are.)
 */
export type CostRow = {
  label: string;
  range: string;
  /** The bit that stops a number being read as a quote. */
  note?: string;
};

/**
 * US emergency ranges — TAKEN FROM THE GUIDE'S OWN TABLE, 2026-09-08.
 *
 * ---------------------------------------------------------------------------
 * WHY THESE CHANGED
 * ---------------------------------------------------------------------------
 * An earlier version researched these independently from pet-insurance
 * aggregators, and the result quietly contradicted the guide it advertises:
 *
 *   bloat surgery        page said $3,000–8,000   guide says $2,000–7,500
 *   swallowed object     page said $2,000–3,500   guide says $1,500–5,000
 *   emergency exam       page said $100–250       guide says $150–500
 *
 * A reader takes the page's number, downloads the PDF, and finds a different
 * one for the same thing. That undermines the exact document being offered as
 * the authoritative version — and it's the page that should yield, because the
 * guide is what they keep.
 *
 * So these now mirror Section 1 of `CTWC VetBill v5.pdf` exactly. If the guide
 * is revised, change these to match; do not re-research them separately.
 *
 * They remain RANGES, not quotes, and the page says so in plain sight — cost
 * varies enormously by city, clinic and severity. They are US figures; if the
 * site ever targets outside the US they need replacing, not converting.
 */
export const COSTS: CostRow[] = [
  {
    label: "Emergency exam and diagnostics",
    range: "$150 – $500",
    note: "Just walking in and finding out what's wrong, before any treatment.",
  },
  {
    label: "Toxin ingestion or poisoning",
    range: "$300 – $3,000+",
    note: "The range is this wide because it depends entirely on what they ate and how long ago.",
  },
  {
    label: "Foreign object removal surgery",
    range: "$1,500 – $5,000",
    note: "Socks, corn cobs, string, small toys. The usual culprits are all things lying around a normal house.",
  },
  {
    label: "Bloat (GDV) surgery",
    range: "$2,000 – $7,500",
    note: "Life threatening, and it moves in hours rather than days.",
  },
  {
    label: "Breathing emergency",
    range: "$500 – $3,000",
    note: "Flat-faced breeds are over-represented here. Coco included.",
  },
  {
    label: "Broken bone or fracture",
    range: "$1,000 – $5,000",
  },
  {
    label: "Seizure treatment",
    range: "$500 – $2,000",
  },
  {
    label: "Heat stroke",
    range: "$500 – $2,500",
    note: "Can develop in minutes, not hours.",
  },
];

export type ReadStep = {
  /** R, E, A or D. Decorative — rendered aria-hidden. */
  letter: string;
  title: string;
  body: string;
};

/**
 * The R.E.A.D. method — Section 3 of the Decode guide, verbatim.
 *
 * Lifted here from `components/decode/ReadMethod.tsx` on 2026-09-09, where it
 * was a module-local const. It now has two consumers — `ReadMethod` on
 * `/decode` and `BodyLanguageDiagram` on `/decode/b` — and two copies of
 * guide-verbatim wording is exactly how a page ends up contradicting the PDF
 * someone just downloaded.
 *
 * ---------------------------------------------------------------------------
 * TWO OF THE FOUR STEPS ARE NOT ABOUT THE DOG
 * ---------------------------------------------------------------------------
 * R and D are instructions to the human: calm yourself down, then make a
 * judgement. Only E and A point at anatomy. That is why the diagram on
 * `/decode/b` pins two of these four and not all of them — there is nothing
 * on a dog to point at for "relax yourself first".
 *
 * DO NOT let step D grow into advice about what to do next. "Comfortable, or
 * do they need space" is an observation; "so do X" would be behavioural
 * advice, which this brand is not qualified to give.
 */
export const READ_METHOD: ReadStep[] = [
  {
    letter: "R",
    title: "Relax yourself first",
    body: "Dogs read your stress before you read theirs. If you come in tense, you're now part of what they're reacting to.",
  },
  {
    letter: "E",
    title: "Eyes, ears, mouth",
    body: "Scan the face as a whole and take the overall expression. One signal on its own tells you almost nothing.",
  },
  {
    letter: "A",
    title: "Assess the body",
    body: "Tail height and stiffness, posture, and where their weight is sitting. The tail gets the attention but posture tells the real story.",
  },
  {
    letter: "D",
    title: "Decide",
    body: "Comfortable, or do they need space? That's the whole question, and you're the one standing there.",
  },
];

export type CheatRow = {
  /** The thing you can see. Left column. */
  signal: string;
  /** What it means. Right column. */
  meaning: string;
};

export type CheatGroup = {
  title: string;
  rows: CheatRow[];
};

/**
 * The quick-reference cheat sheet — page 12 of `CTWCDecode YourDog V5.pdf`,
 * transcribed verbatim on 2026-09-09.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS HERE AND NOT REWRITTEN
 * ---------------------------------------------------------------------------
 * This is the page the guide tells people to print and stick on the fridge, so
 * it is the single most-looked-at thing we produce. Showing a slice of it on
 * the landing page is showing the actual product rather than describing it.
 *
 * Every pair below is the guide's own wording, down to the "=" — which is
 * also why the phrasing is clipped rather than sentence-shaped. Do not
 * paraphrase for the web. A visitor who reads a signal here and then finds it
 * worded differently in the PDF has caught us being loose with the one
 * document we asked them for their email to get.
 *
 * Eighteen rows, six per group. That count is the reason `GuessTheSignal` no
 * longer claims "about thirty more of these in the guide" — the brief said
 * thirty, the guide has eighteen, and the guide wins.
 */
export const CHEAT_SHEET: CheatGroup[] = [
  {
    title: "The face",
    rows: [
      { signal: "Forward ears", meaning: "alert" },
      { signal: "Flat ears", meaning: "anxious" },
      { signal: "Soft eyes", meaning: "happy" },
      { signal: "Hard stare", meaning: "tension" },
      { signal: "Whale eye", meaning: "stressed" },
      { signal: "Open mouth", meaning: "content" },
    ],
  },
  {
    title: "The body",
    rows: [
      { signal: "High stiff tail", meaning: "aroused" },
      { signal: "Loose wag", meaning: "relaxed" },
      { signal: "Tucked tail", meaning: "fear" },
      { signal: "Weight forward", meaning: "confident" },
      { signal: "Play bow", meaning: "let's play" },
      { signal: "Freeze", meaning: "step in now" },
    ],
  },
  {
    title: "Weird stuff",
    rows: [
      { signal: "Grass", meaning: "instinct" },
      { signal: "Head tilt", meaning: "listening" },
      { signal: "Zoomies", meaning: "pure joy" },
      { signal: "Guilty look", meaning: "appeasement" },
      { signal: "Digging", meaning: "survival wiring" },
      { signal: "Licking", meaning: "context matters" },
    ],
  },
];

/**
 * The calming signals from the same page. Five of them, listed rather than
 * paired — the guide prints them as a single run, not as signal/meaning.
 */
export const CALMING_SIGNALS = [
  "Yawning",
  "Lip licking",
  "Turning away",
  "Ground sniffing",
  "Slow blinking",
] as const;

/**
 * How many things are actually printed on the fridge card.
 *
 * 18 signal/meaning pairs plus the 5 calming signals, which are listed on the
 * same page but not paired — so 23. Derived, because three places on
 * `/decode/b` quote this number and they were not agreeing: the fact chip and
 * the section heading both said 18 (the pair count) while the quiz payoff said
 * "twenty-odd", which is only true if you include the calming five. Both were
 * defensible readings of the same page, which is the worst kind of
 * inconsistency — nobody notices until a reader does.
 *
 * One number, one story, and it moves if the guide does.
 */
export const CHEAT_SHEET_COUNT: number =
  CHEAT_SHEET.reduce((n, g) => n + g.rows.length, 0) + CALMING_SIGNALS.length;

/** Where the ranges above came from. Rendered on the page. */
export const COST_SOURCES: Array<{ name: string; url: string }> = [
  {
    name: "Rover — 2026 Cost of Dog Parenthood Report",
    url: "https://www.rover.com/blog/cost-of-dog-parenthood/",
  },
  {
    name: "Forbes — pet owner emergency cost survey",
    url: "https://www.forbes.com/advisor/pet-insurance/pet-care-costs/",
  },
  {
    name: "ASPCA Animal Poison Control — annual case data",
    url: "https://www.aspca.org/pet-care/animal-poison-control",
  },
  {
    name: "Royal Veterinary College — brachycephalic heat-related illness",
    url: "https://www.rvc.ac.uk/vetcompass",
  },
];

/**
 * The three numbers the guide opens with.
 *
 * These are the page's strongest hook and they are lifted from the guide's own
 * cover, deliberately, so the landing page and the deliverable state the same
 * figures. See the note above COSTS about why that matters.
 *
 * Each one is a statement about OWNERS, not about a dog — which is the whole
 * point. Nobody thinks the emergency will be theirs; the useful fact is how
 * many people were equally sure and then had minutes to decide.
 */
export const VETBILL_STATS: Array<{ figure: string; label: string }> = [
  { figure: "$1,035", label: "average dog emergency" },
  { figure: "8 in 10", label: "owners aren't financially ready for one" },
  { figure: "39%", label: "had only minutes to decide" },
];

/**
 * The five expensive emergencies that are largely preventable.
 *
 * Section 3 of the guide, condensed. Kept because it's the most actionable
 * thing on either page: four of the five cost very little to prevent and a
 * great deal to treat, and that gap is the reason the guide exists.
 */
export const PREVENTABLE: Array<{
  title: string;
  stat: string;
  action: string;
}> = [
  {
    title: "Toxin ingestion",
    stat: "ASPCA handled over 376,000 exposure cases in 2025",
    action:
      "Medication is the single largest category. Keep pills, grapes, raisins, xylitol, chocolate and onions genuinely out of reach — not just off the counter.",
  },
  {
    title: "Swallowed objects",
    stat: "Surgery commonly runs $1,500 – $5,000",
    action:
      "Socks, string and small toys, unsupervised. Frenchies and terriers are particularly determined about it.",
  },
  {
    title: "Dental disease",
    stat: "Affects 80–90% of dogs over three",
    action:
      "The most common disease in dogs, and most owners don't notice until it's advanced because dogs hide dental pain well. Brushing three times a week is the minimum that helps.",
  },
  {
    title: "Weight-related illness",
    stat: "Around 65% of dogs are overweight",
    action:
      "Measure meals instead of eyeballing them. One study found roughly a third of owners judged an overweight dog to be a normal weight.",
  },
  {
    title: "Heat injury",
    stat: "Flat-faced breeds are around 4× more at risk",
    action:
      "No walks on hot pavement — test it with the back of your hand. Never a parked car, even briefly. This is the one Coco's human watches hardest.",
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
 *
 * ---------------------------------------------------------------------------
 * WWW, NOT THE APEX — changed 2026-09-09, and it was wrong before
 * ---------------------------------------------------------------------------
 * This was the apex. Measured against the live site:
 *
 *     GET https://coolstuffwithcoco.com/vetbill
 *       -> 308 Permanent Redirect
 *          Location: https://www.coolstuffwithcoco.com/vetbill
 *     GET https://www.coolstuffwithcoco.com/vetbill
 *       -> 200
 *
 * So www is the primary domain and the apex permanently redirects to it. With
 * the apex in here, every page served from www was emitting a canonical
 * pointing at a URL that redirects away from itself — confirmed on the live
 * page:
 *
 *     <link rel="canonical" href="https://coolstuffwithcoco.com/vetbill"/>
 *
 * A canonical is supposed to name the final, non-redirecting address. So did
 * every sitemap entry and the robots `host`. It is the kind of thing that
 * doesn't break anything visibly and quietly splits the signal Google uses to
 * decide which URL to rank.
 *
 * If the primary domain is ever switched to the apex, change this back — and
 * check with a request, not from memory. `curl -sI https://<apex>/vetbill`
 * and read the Location header.
 */
export const SITE_URL = "https://www.coolstuffwithcoco.com";
