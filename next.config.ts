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

    `includeSubDomains` is on, and that is a real commitment: it applies to
    `mail.coolstuffwithcoco.com` (the sending domain) and any future subdomain,
    all of which must then serve HTTPS. They do — everything is behind Vercel
    or GHL, both HTTPS-only.

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
    year of no plain-HTTP anything on any subdomain, including
    `mail.coolstuffwithcoco.com`.

    So: the standard ramp, and it is the only reversible order.

      300           <- HERE. Confirm every subdomain serves HTTPS.
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

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
