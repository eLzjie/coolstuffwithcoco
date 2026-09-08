/**
 * Answer-first Q&A for /decode and /vetbill.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS, AND WHY IT IS *NOT* PRIMARILY ABOUT SCHEMA
 * ---------------------------------------------------------------------------
 * Google removed FAQ rich results entirely on 7 May 2026. `FAQPage` is still
 * valid schema, it just no longer produces a rich result for anybody. So the
 * markup is a byproduct here, not the goal — anyone adding this expecting
 * stars in the SERP will be disappointed.
 *
 * The value is the VISIBLE CONTENT. AI assistants and Google's own passage
 * indexing read the rendered HTML, and both reward the same shape:
 *
 *   1. The question as a heading, phrased the way a person asks it.
 *   2. The answer in the FIRST sentence — a direct claim, not a wind-up.
 *   3. The supporting detail after, not before.
 *
 * That ordering is the whole technique. "There are a few reasons dogs eat
 * grass…" is unquotable; "Grass eating is normal and usually harmless" can be
 * lifted straight into an answer with attribution. `answer` below is that
 * first sentence, deliberately kept to one, and `detail` is everything else.
 *
 * llms.txt was considered and skipped. Measured adoption is negligible — of
 * 500M+ AI crawler visits in one 2026 study, 408 fetched it — and Google has
 * said publicly it won't support it. The crawlers read the HTML instead, which
 * is what this file feeds.
 *
 * ---------------------------------------------------------------------------
 * EVERY ANSWER COMES FROM THE GUIDES
 * ---------------------------------------------------------------------------
 * Sourced from `CTWCDecode YourDog V5.pdf` and `CTWC VetBill v5.pdf`, not
 * written fresh. Two reasons: the landing page must not contradict the PDF a
 * reader is about to download, and inventing pet-health claims to win search
 * traffic is exactly the thing this brand shouldn't do.
 *
 * The statistics are the guides' own, with their attributions kept. If a claim
 * isn't in a guide, it doesn't go here.
 */

export type FaqItem = {
  /** Phrased as a person would actually ask it. */
  question: string;
  /** ONE sentence, answering directly. This is the quotable unit. */
  answer: string;
  /** Supporting detail. Optional — a short answer that's complete is fine. */
  detail?: string;
};

/**
 * /decode — the behaviour questions.
 *
 * Ordered by how often they're actually asked, not by guide order. The guide
 * notes licking is "the single most Googled dog question", so it leads, and
 * grass and the head tilt follow because they're the two the guide singles out
 * as the 2am searches.
 */
export const DECODE_FAQ: FaqItem[] = [
  {
    question: "Why does my dog lick me?",
    answer:
      "Usually affection or the salt on your skin — but obsessive licking of one spot is different, and can mean pain or anxiety.",
    detail:
      "A few licks on your hand is social. What's worth watching is constant paw licking, lip licking when there's no food around, or returning to one repeated spot. Licking at the air can be nausea.",
  },
  {
    question: "Why does my dog eat grass?",
    answer:
      "Grass eating is normal and it doesn't mean your dog is sick or trying to make themselves vomit.",
    detail:
      "It's ordinary canine behaviour with deep roots — plant material turned up in as much as 74% of wild wolf scat samples, and a study of 12 dogs found the hungrier they were, the more grass they ate. Most dogs don't vomit afterwards. Worry only if they're eating it obsessively, vomiting repeatedly, or the grass has been treated.",
  },
  {
    question: "What does it mean when my dog tilts their head?",
    answer:
      "The head tilt is your dog listening harder, not being confused.",
    detail:
      "They're adjusting their ears to place a sound and moving their head to see past their own muzzle. Long-muzzled dogs tilt more; flat-faced breeds like Coco tend to stare instead. Keep talking — they're actively tuning you in.",
  },
  {
    question: "Does a wagging tail mean my dog is happy?",
    answer:
      "No — a wag means your dog is feeling something strongly, not that the something is good.",
    detail:
      "A loose, mid-height wag is the happy one. A high, stiff, fast wag usually signals arousal or tension, and a low or tucked tail is fear. Read the whole body rather than the tail on its own.",
  },
  {
    question: "Does my dog actually feel guilty?",
    answer:
      "No — the guilty look is appeasement, not guilt.",
    detail:
      "Dogs don't connect a past action to your current reaction. The ears back and averted eyes are them reading your upset body language and trying to calm you down. They're saying “you seem upset, I'm trying to fix it”, not “I regret the shoe”.",
  },
  {
    question: "What is whale eye in dogs?",
    answer:
      "Whale eye is when the whites of your dog's eyes show as they look away, and it means they're uncomfortable.",
    detail:
      "It's a request for space, not guilt. Step back and don't push the interaction — the tension usually drops as soon as they get room.",
  },
  {
    question: "Why does my dog get the zoomies?",
    answer:
      "Zoomies are a normal energy release, properly called Frenetic Random Activity Periods, and nothing is wrong.",
    detail:
      "They're most common after baths, naps, meals, or the moment you pick up the leash. Don't try to stop them — clear the space and let it run out.",
  },
  {
    question: "How can I tell if dogs are playing or fighting?",
    answer:
      "Watch for pauses: playing dogs stop voluntarily and check in, and stressed dogs don't pause at all.",
    detail:
      "Play looks loose, bouncy and exaggerated, with open mouths and soft eyes. Stress looks stiff, with a hard stare, closed mouth or a low sustained growl. If one dog freezes or tries to leave and the other keeps pushing, step in calmly and separate them.",
  },
  {
    question: "When is a behaviour change a health problem?",
    answer:
      "Ring your vet when a behaviour changes suddenly — especially new aggression, hiding, or obsessive licking of one spot.",
    detail:
      "Dogs in pain lash out at handling they normally accept, and a social dog going quiet may be ill rather than moody. House-training regression, loss of interest in food or play, and panting without exercise are all worth a call. This is general guidance, not veterinary advice.",
  },
];

/**
 * /vetbill — the cost and urgency questions.
 *
 * CAREFUL: nothing here recommends a financial product. The guide's own
 * section on paying for it opens by saying it isn't licensed to give financial
 * or insurance advice, and describes the options neutrally instead. The
 * insurance answer below keeps that posture, and it must stay neutral — a
 * recommendation would be both a compliance problem and a betrayal of the
 * "protective, never predatory" framing the whole page is built on.
 */
export const VETBILL_FAQ: FaqItem[] = [
  {
    question: "How much does an emergency vet visit cost for a dog?",
    answer:
      "The average dog emergency runs about $1,035, and the emergency exam and diagnostics alone are typically $150 to $500 before any treatment.",
    detail:
      "From there it depends on what's wrong: poisoning $300 to $3,000+, foreign object surgery $1,500 to $5,000, bloat surgery $2,000 to $7,500. These are typical US ranges rather than quotes — cost varies enormously by city, clinic and severity.",
  },
  {
    question: "What symptoms mean I should go to the vet immediately?",
    answer:
      "Go now for struggling to breathe, collapse, seizures, suspected poisoning, pale or blue gums, a hard swollen belly, unproductive retching, repeated vomiting, unconsciousness, bleeding that won't stop, a suspected fracture, or sudden vision loss.",
    detail:
      "For most of those the window is measured in minutes rather than hours. A phone call to your vet or an emergency clinic costs nothing, and every clinic would rather answer a question that turns out to be nothing than see a dog that waited too long. This is general guidance and can't diagnose your dog.",
  },
  {
    question: "What is bloat in dogs and why is it so urgent?",
    answer:
      "Bloat (GDV) is a twisted, gas-filled stomach that can become life threatening within hours, and the classic sign is retching that brings nothing up alongside a hard, swollen belly.",
    detail:
      "Surgery typically runs $2,000 to $7,500. The combination that should send you straight in is unproductive retching plus a distended abdomen, often with pacing and restlessness.",
  },
  {
    question: "Why have vet bills gone up so much?",
    answer:
      "Veterinary costs have risen more than 60% since 2014, far outpacing general inflation.",
    detail:
      "One 2026 report put the rise at around 15% in that year alone, and 83% of owners said their pet costs went up over the past year. The practical consequence is that the bill a friend paid three years ago isn't the bill you'll pay.",
  },
  {
    question: "Which expensive dog emergencies are preventable?",
    answer:
      "Five account for a large share of avoidable spend: toxin ingestion, swallowed objects, dental disease, weight-related illness and heat injury.",
    detail:
      "Four of the five cost very little to prevent and a great deal to treat. Dental disease affects 80–90% of dogs over three and is the most common disease in dogs; around 65% of dogs are overweight; and flat-faced breeds are roughly four times more at risk of heat-related illness.",
  },
  {
    question: "Is pet insurance worth it?",
    answer:
      "We're not licensed to advise on that, and this guide deliberately doesn't — it describes the options so you can decide.",
    detail:
      "What's true factually: around 34% of US owners carry a policy, pre-existing conditions are typically excluded so cover gets harder to obtain as a dog ages, and 38% of owners said they couldn't cover an emergency without taking on debt. A dedicated savings fund has no exclusions but can be outrun by an emergency arriving early. Clinic payment plans and charitable assistance also exist and vary locally.",
  },
  {
    question: "What should I have ready before I call the vet?",
    answer:
      "Have what happened and when, what they ate and how much, your dog's weight and age, current medication, and the symptoms in the order they appeared.",
    detail:
      "While you wait, don't induce vomiting unless you've been told to, don't give human painkillers, don't offer food or water if your dog has collapsed, don't try to remove a stuck object, and ring ahead rather than just driving.",
  },
];
