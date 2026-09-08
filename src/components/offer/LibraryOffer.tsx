"use client";

import { useEffect, useId, useRef, useState } from "react";
import { track, type LeadMagnet } from "@/lib/analytics/track";
import { clearCapture, useRecentCapture } from "@/lib/recentCapture";
import { EMAIL_MAX, EMAIL_RE } from "@/lib/validation";
import { Bone } from "@/components/brand/Icons";
import { Reveal } from "@/components/motion/Reveal";
import {
  AVAILABILITY,
  CHECKOUT_URL,
  FULL_PRICE,
  LIBRARY,
  LIBRARY_PRICE,
  LIBRARY_V1,
  OFFER_DISCLAIMER,
  OFFER_MODE,
  PLANNED,
  PRICE_MODE,
  SINGLE_PRICE,
} from "@/lib/content/library";

/**
 * The Coco's Library offer, on the thank-you pages.
 *
 * Replaces OfferScaffold, which was a placeholder with no price, no contents
 * and a dead CTA.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS SECTION IS FOR, NARROWLY
 * ---------------------------------------------------------------------------
 * Not to take money. It can't — there is no cart on this page and checkout is
 * off-domain in GHL. The highest-converting mechanic in all the upsell data is
 * the order bump, and a bump needs a card already on file, so it belongs
 * inside the GHL order form rather than here. The printed Paperwork Pack is
 * the natural candidate for it.
 *
 * So this section's only job is to earn a qualified, INFORMED click. That
 * reframes everything: no pressure, no urgency, full disclosure of what
 * exists, and a decline path that isn't a guilt trip.
 *
 * Expectation setting, because it will be asked: every credible thank-you-page
 * upsell benchmark in circulation measures POST-PURCHASE offers with a card on
 * file. This page is post-optin with no payment method, so low single digits
 * is the honest range, not the 10-15% the internet quotes.
 *
 * ---------------------------------------------------------------------------
 * ANALYTICS — no new event names
 * ---------------------------------------------------------------------------
 * Reuses the existing vocabulary exactly, distinguished by `content_name`:
 *
 *   offer_view        on mount
 *   initiate_checkout the forward action, waitlist join OR checkout click
 *   decline_offer     the visible decline
 *
 * `initiate_checkout` covers the waitlist join deliberately, rather than
 * inventing an event. It keeps ONE funnel step across both phases, so the
 * waitlist-era numbers and the checkout-era numbers sit in the same report and
 * can actually be compared. `content_name` says which it was.
 *
 * No `value` is sent on the waitlist join — nothing was bought. When
 * OFFER_MODE flips to "checkout" the same event carries value: LIBRARY_PRICE.
 */

type WaitlistState = "idle" | "sending" | "joined" | "error";

const REQUEST_TIMEOUT_MS = 15_000;

export function LibraryOffer({ magnet }: { magnet: LeadMagnet }) {
  const uid = useId();
  const bridge = LIBRARY.bridge[magnet];

  const [state, setState] = useState<WaitlistState>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [declined, setDeclined] = useState(false);

  /**
   * The address they submitted moments ago, if we have it.
   *
   * useSyncExternalStore, not useState + useEffect. Reading sessionStorage
   * during render is a React 19 purity violation, and setting state from an
   * effect to work around it is an ERROR under this repo's lint config. See
   * useRecentCapture for the full reasoning.
   *
   * Null is an ordinary outcome — direct visit, shared link, new tab, private
   * mode — and the fallback is simply showing the field.
   */
  const known = useRecentCapture();

  useEffect(() => {
    track("offer_view", { lead_magnet: magnet, content_name: "coco_library" });
  }, [magnet]);

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function join(address: string) {
    if (state === "sending" || state === "joined") return;

    const clean = address.trim().toLowerCase();
    if (!EMAIL_RE.test(clean) || clean.length > EMAIL_MAX) {
      setError("That doesn't look like an email address — mind checking it?");
      setState("error");
      return;
    }

    setError(null);
    setState("sending");

    track("initiate_checkout", {
      lead_magnet: magnet,
      content_name: "coco_library_waitlist",
    });

    const abort = new AbortController();
    abortRef.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({ email: clean }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; joined?: boolean }
        | null;

      if (!res.ok || !data?.ok || !data.joined) {
        setError("Couldn't add you just then. Give it another tap?");
        setState("error");
        return;
      }

      /*
        Forget the stashed address once it's been used, so a back-navigation
        doesn't re-offer a one-tap action that already happened.
      */
      clearCapture();
      setState("joined");
    } catch {
      setError("Couldn't reach us just then. Give it another tap?");
      setState("error");
    } finally {
      window.clearTimeout(timeout);
      abortRef.current = null;
    }
  }

  return (
    <section
      className="section-pad relative isolate overflow-hidden bg-mint"
      aria-labelledby="offer-heading"
    >
      <div className="shell max-w-3xl">
        <Bone aria-hidden className="mb-5 h-8 w-8 text-ink" />

        {/* The bridge. Names the gap the guide they just got actually leaves. */}
        <h2 id="offer-heading" className="reveal-heading t-display-l text-ink">
          {bridge.heading}
        </h2>
        <p className="t-lead mt-5 max-w-[54ch] text-ink/80">{bridge.body}</p>

        <div className="mt-8 rounded-2xl border-2 border-ink bg-paper p-6 sm:p-8">
          <h3 className="t-h2 text-ink">{LIBRARY.name}</h3>

          {/*
            Kit framing, not a reading list. Straight from the product
            research: prose at this price invites "that's a lot of reading",
            where guides plus fill-in trackers plus fridge cards reads as
            something you'll use.
          */}
          <p className="t-body mt-3 text-ink/80">
            Guides and the fill-in stuff together — the trackers, the records,
            the one-pagers for the fridge. Meant to be used, not read once.
          </p>

          {/* Only the two v1 titles. Padding the list averages the value down. */}
          <ul className="mt-6 grid gap-5">
            {LIBRARY_V1.map((item) => (
              <Reveal as="li" key={item.title}>
                <h4 className="t-h3 text-ink">{item.title}</h4>
                <p className="t-small mt-1.5 text-ink-muted">{item.blurb}</p>
              </Reveal>
            ))}
          </ul>

          {/* Named as planned. Never as included. */}
          {PLANNED.length > 0 && (
            <p className="t-small mt-6 text-ink-muted">
              <span className="font-semibold text-ink">Coming after those:</span>{" "}
              {PLANNED.join(" · ")}. Planned, not written — they&apos;re not
              part of what you&apos;d be joining for.
            </p>
          )}

          <PriceBlock />

          {/*
            The availability disclosure, at the same visual weight as the
            price. A disclosure you'd only find by looking is itself in the
            FTC's dark-patterns taxonomy under information hiding.
          */}
          <p className="t-small mt-5 rounded-xl border-2 border-ink/20 bg-butter p-4 text-ink">
            {AVAILABILITY}
          </p>

          {/* ---- The action ---- */}
          <div className="mt-7">
            {state === "joined" ? (
              <div role="status" aria-live="polite">
                <p className="t-h3 text-ink">You&apos;re on the list.</p>
                <p className="t-body mt-2 text-ink/80">
                  I&apos;ll email you the day the first two are up. Nothing
                  before that, and nothing to pay.
                </p>
              </div>
            ) : OFFER_MODE === "checkout" && CHECKOUT_URL ? (
              <a
                href={CHECKOUT_URL}
                className="btn-coral inline-flex min-h-11 items-center"
                onClick={() =>
                  track("initiate_checkout", {
                    lead_magnet: magnet,
                    content_name: "coco_library",
                    value: LIBRARY_PRICE,
                    currency: "USD",
                  })
                }
              >
                {/*
                  Labelled with destination AND price. Required by Google's
                  payment-disclosure policy, and only fair on an off-domain
                  redirect — "Add the Library" told you neither.
                */}
                Continue to checkout — ${LIBRARY_PRICE}
              </a>
            ) : known ? (
              /*
                One tap. They gave us this address seconds ago, so asking for
                it again is friction that also reads as not having listened.
              */
              <>
                <button
                  type="button"
                  disabled={state === "sending"}
                  onClick={() => join(known)}
                  className="btn-coral min-h-11 w-full justify-center sm:w-auto"
                >
                  {state === "sending"
                    ? "Adding you…"
                    : "Tell me when it's ready"}
                </button>
                <p className="t-small mt-2 text-ink-muted">
                  Using {known} — the address you just gave me.
                </p>
              </>
            ) : (
              /* Direct visit, new tab, or blocked storage. Ask for it. */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  join(email);
                }}
                noValidate
              >
                <label
                  htmlFor={`${uid}-wl`}
                  className="t-small block font-semibold text-ink"
                >
                  Your email
                </label>
                <input
                  id={`${uid}-wl`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  enterKeyHint="go"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  maxLength={EMAIL_MAX}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                    if (state === "error") setState("idle");
                  }}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl border-2 border-ink/25 bg-paper px-4 py-3 text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="btn-coral mt-4 min-h-11 w-full justify-center sm:w-auto"
                >
                  {state === "sending" ? "Adding you…" : "Tell me when it's ready"}
                </button>
              </form>
            )}

            <div role="alert" aria-live="assertive">
              {error && (
                <p className="t-small mt-3 font-semibold text-ink">{error}</p>
              )}
            </div>
          </div>

          {/*
            A real decline. Visible, non-shaming, and it says something true
            rather than "no thanks, I hate saving money".

            Once tapped it stays acknowledged rather than reverting, so the
            page doesn't keep asking a question that's been answered.
          */}
          {state !== "joined" && (
            <div className="mt-6">
              {declined ? (
                <p className="t-small text-ink-muted" role="status">
                  Fair enough — the free guide is yours either way. Enjoy it.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDeclined(true);
                    track("decline_offer", {
                      lead_magnet: magnet,
                      content_name: "coco_library",
                    });
                  }}
                  className="t-small min-h-11 underline decoration-ink/40 underline-offset-4 hover:decoration-ink"
                >
                  No thanks — just the free guide
                </button>
              )}
            </div>
          )}

          <p className="t-small mt-6 text-ink-muted">{OFFER_DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
}

/**
 * The price, in whichever treatment PRICE_MODE selects.
 *
 * All four are implemented so switching is one constant in
 * lib/content/library.ts. The reasoning for the default lives there — in
 * short: "anchor" is the requested treatment and is available, but $29.99 has
 * never been offered, which is 16 CFR 233.1's own first example of a
 * fictitious former price.
 */
function PriceBlock() {
  if (PRICE_MODE === "anchor") {
    return (
      <div className="mt-7">
        <p className="flex flex-wrap items-baseline gap-3">
          {/*
            BUILT AGAINST ADVICE, ON INSTRUCTION. Preserved deliberately.

            A strikethrough IS a former-price claim, and relabelling it
            ("Compare at", "Value", "RRP") does not cure it — that is what
            Overstock was penalised $6.8M for. The Library has never been
            offered at this price, so there is no date on which it prevailed
            and California B&P 17501 cannot be satisfied either.

            If this ships, the explanation below must stay legible and
            adjacent at 390px. Hiding it in a footnote or a tooltip converts
            one problem into two, because a hidden disclosure is itself in the
            FTC's dark-patterns taxonomy.
          */}
          <span
            aria-hidden
            className="t-h3 text-ink-muted line-through decoration-2"
          >
            ${FULL_PRICE}.99
          </span>
          <span className="t-display-l leading-none text-ink">
            ${LIBRARY_PRICE}
          </span>
        </p>
        <p className="t-small mt-2 text-ink-muted">
          ${FULL_PRICE}.99 is the intended price once the Library is finished.
        </p>
      </div>
    );
  }

  if (PRICE_MODE === "two-prices") {
    return (
      <div className="mt-7">
        <p className="t-display-l leading-none text-ink">${LIBRARY_PRICE}</p>
        {/*
          The strongest framing, and it isn't a former-price claim at all —
          two live prices a visitor can verify. Requires the single guide to be
          genuinely buyable first; a decoy price is the same fiction relabelled.
        */}
        <p className="t-small mt-2 text-ink-muted">
          Any single guide is ${SINGLE_PRICE}. The whole Library is $
          {LIBRARY_PRICE}.
        </p>
      </div>
    );
  }

  if (PRICE_MODE === "flat") {
    return (
      <div className="mt-7">
        <p className="t-display-l leading-none text-ink">${LIBRARY_PRICE}</p>
        <p className="t-small mt-2 text-ink-muted">
          One payment, and the Paperwork Pack is included.
        </p>
      </div>
    );
  }

  /*
    Default: forward-looking, and true. It explains WHY it's cheap instead of
    inventing a discount, which is both more persuasive and the thing 16 CFR
    233.5 permits — on one condition: the price has to actually rise later.

    If nobody intends to raise it, switch PRICE_MODE to "flat" rather than
    leaving a claim that quietly becomes false.
  */
  return (
    <div className="mt-7">
      <p className="flex flex-wrap items-baseline gap-3">
        <span className="t-display-l leading-none text-ink">
          ${LIBRARY_PRICE}
        </span>
        <span className="t-small font-semibold text-ink">launch price</span>
      </p>
      <p className="t-small mt-2 text-ink-muted">
        ${LIBRARY_PRICE} for everyone on this list. It goes to ${FULL_PRICE}{" "}
        once the Library is finished.
      </p>
    </div>
  );
}
