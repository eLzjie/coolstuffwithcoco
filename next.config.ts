import type { NextConfig } from "next";

/**
 * Security response headers.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE STOPPED BEING EMPTY
 * ---------------------------------------------------------------------------
 * A pre-launch checklist item. The site collects email addresses on four
 * pages, so the cheap headers that harden a form page are worth having before
 * any paid traffic arrives, not after.
 *
 * Each one below earns its place. There is deliberately NO Content-Security-
 * Policy — see the note at the bottom for why adding one carelessly would take
 * the analytics stack down.
 */

const securityHeaders = [
  /*
    HSTS. Tells the browser to refuse plain HTTP for this host, so a
    `http://coolstuffwithcoco.com` link can't be intercepted before Vercel's
    redirect fires.

    `includeSubDomains` is on, and that is a real commitment — but measure
    what it actually reaches before trusting it. Measured 2026-09-10:

      www.coolstuffwithcoco.com  ->  max-age=300; includeSubDomains  (ours)
      coolstuffwithcoco.com      ->  max-age=63072000                (Vercel's,
                                     on the 308 to www, NO includeSubDomains)

    So this policy is scoped to `*.www.` today and does NOT reach the sibling
    `mail.coolstuffwithcoco.com`. The earlier version of this comment claimed
    it did, and that the sending subdomain was all-HTTPS anyway. Both were
    wrong.

    The sending subdomain is NOT all-HTTPS. Mail goes out through Mailgun, and
    its tracking host `email.mail.coolstuffwithcoco.com` is serving `http`
    with no certificate — `https://` on that host fails the TLS name check.
    Every unsubscribe and click link in every delivered email is a plain-http
    URL on a subdomain of this brand.

    Which is the whole hazard: a policy that DID cover it would force-upgrade
    those links into a hard TLS failure, in emails that stay in inboxes for
    years, with no way to withdraw the header. Flip Mailgun's tracking
    protocol to HTTPS first — the measurements and the steps are in
    docs/emails/README.md.

    NOT preloaded. Getting on the HSTS preload list is a manual submission and
    effectively permanent, which is the wrong shape of decision for a site
    this young.

    ---------------------------------------------------------------------------
    MAX-AGE IS DELIBERATELY 5 MINUTES. RAISE IT ON PURPOSE, IN STEPS.
    ---------------------------------------------------------------------------
    This shipped at a year first, which was the wrong order. HSTS is cached BY
    THE BROWSER, so a max-age you regret cannot be withdrawn — shortening the
    header only helps visitors who come back and get the new one. Anyone who
    already has the old value keeps it for its full term. A year of that is a
    year of no plain-HTTP anything on any subdomain the policy reaches —
    which, once this header ships on the apex, includes
    `mail.coolstuffwithcoco.com`.

    So: the standard ramp, and it is the only reversible order.

      300           <- HERE. Confirm every subdomain serves HTTPS.
                       As of 2026-09-10 that check FAILS: Mailgun's tracking
                       host is http-only. See above. Fix it, then ramp.
      86400         <- a day. Leave it a day.
      31536000      <- a year. Only once you are sure.

    Five minutes still does the real job for a visitor mid-session, which is
    the case that matters most on paid traffic.
  */
  {
    key: "Strict-Transport-Security",
    value: "max-age=300; includeSubDomains",
  },

  /*
    No MIME sniffing. Without it, a browser can decide an uploaded or
    user-influenced response "looks like" HTML and execute it.
  */
  { key: "X-Content-Type-Options", value: "nosniff" },

  /*
    Clickjacking. `frame-ancestors` in a CSP is the modern equivalent, but
    this header is still what older browsers honour and it costs nothing.

    SAMEORIGIN rather than DENY because the GHL form embed
    (`GhlFormEmbed`, the launch-morning fallback) frames a GHL page from OUR
    page — this header governs who may frame US, so either value would be
    fine today, but DENY would break any future in-page preview of our own
    routes.
  */
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  /*
    Referrer policy. `strict-origin-when-cross-origin` is the browser default
    now, so this is belt-and-braces — but it matters more here than on a
    typical site: the thank-you page paths reveal which guide someone
    requested, and full-URL referrers would hand that to every third party the
    page loads.

    This is also the header that keeps a query string out of a referrer if one
    is ever added. An email address must never reach a URL (see
    `lib/recentCapture.ts` for that rule), and this is the second line.
  */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  /*
    Nothing on this site uses the camera, microphone or geolocation, so deny
    them outright. If a feature ever needs one, the failure will be loud and
    the fix is one line here.
  */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

/*
  SHORT LINKS FOR THE GUIDE PDFs
  -----------------------------------------------------------------------------
  The delivery emails carry a "Button not working? Paste this into your
  browser:" line, and what it showed was

    assets.cdn.filesafe.space/…/6aa0201b360a619b9fc92cc3.pdf

  which is not pasteable. The ellipsis is literal — the line invited someone to
  copy a URL that cannot resolve. Showing the full CDN URL instead would be
  pasteable and 96 characters of opaque hash.

  So: one short branded URL per guide, which is readable, actually pasteable,
  and the same string in the button and in the fallback line. It also means the
  emails no longer name the CDN id at all — if a guide is re-uploaded, this is
  the only place that changes.

  `permanent: false` (307) on purpose. A 308 is cached by the browser
  indefinitely, and the whole point of this indirection is that the
  destination is expected to change.
*/
/*
  The fallbacks are not laziness and they are not secrets. These exact URLs are
  already printed in the delivery emails, and the whole job of /g/ is to be the
  one link that always resolves.

  An earlier version of this threw when the env var was missing, on the theory
  that a silent 404 in delivered mail is worse than a loud build failure. That
  was the wrong call: it makes the entire site's deploy depend on a variable
  that only two redirects need, so a missing value in the Vercel project would
  take down the whole site rather than one path. Env wins when set; otherwise
  these.

  If a guide is re-uploaded and gets a new media id, update BOTH here and
  NEXT_PUBLIC_GUIDE_*_URL, or set only the env var and delete the fallback.
*/
const GUIDE_REDIRECTS = [
  {
    source: "/g/decode",
    env: "NEXT_PUBLIC_GUIDE_DECODE_URL",
    fallback:
      "https://assets.cdn.filesafe.space/xqC9nSOeygEkT3p5nUi3/media/6aa0201b360a619b9fc92cc3.pdf",
  },
  {
    source: "/g/vetbill",
    env: "NEXT_PUBLIC_GUIDE_VETBILL_URL",
    fallback:
      "https://assets.cdn.filesafe.space/xqC9nSOeygEkT3p5nUi3/media/6aa0201b641597c752ae35e7.pdf",
  },
] as const;

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return GUIDE_REDIRECTS.map(({ source, env, fallback }) => ({
      source,
      destination: process.env[env] || fallback,
      permanent: false,
    }));
  },
};

export default nextConfig;

/*
  -----------------------------------------------------------------------------
  ON CONTENT-SECURITY-POLICY — read this before adding one
  -----------------------------------------------------------------------------
  A CSP is the header that would actually raise the bar here, and it is also
  the one that will silently break this site if it is copy-pasted.

  What a working policy has to allow, all of it verified in the codebase:

    script-src   googletagmanager.com (GA4 + GTM), clarity.ms (Clarity is
                 installed INSIDE the GTM container — see the foot of
                 lib/analytics/ids.ts), connect.facebook.net if the Meta Pixel
                 is ever added to GTM, and Next's own inline hydration and
                 flight-payload scripts.
    'unsafe-inline' or a nonce  — the Consent Mode default snippet in
                 app/layout.tsx is a `beforeInteractive` inline script, and it
                 is only useful because it runs BEFORE the tags initialise. A
                 policy without a nonce for it kills consent defaults, which
                 is worse than having no CSP.
    img-src      data: (the SVG covers and inlined placeholders)
    connect-src  the GA4 / Clarity / GHL collection endpoints

  So: a CSP here needs a nonce plumbed through the layout, and it needs
  testing against the real GTM container rather than against what this repo
  contains. It is a proper task, not a line to add in passing. Doing it half
  way would take analytics down without telling anyone, which is exactly the
  failure mode that cost a day on the GTM install already.
*/
