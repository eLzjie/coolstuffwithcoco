import Script from "next/script";
import { GA4_ID, GTM_ID } from "@/lib/analytics/ids";

/**
 * Loads GA4 (gtag.js) and Google Tag Manager.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS ISN'T THE COPY-PASTED SNIPPET
 * ---------------------------------------------------------------------------
 * Google's snippets assume a hand-written page. Pasted into a Next app they
 * cause three problems this component exists to avoid:
 *
 *  1. THEY BLOCK. A raw `<script async>` in the document head competes with
 *     hydration for the main thread. The LCP element here is the hero
 *     HEADLINE — text, already waiting on a render delay from the app's own
 *     JS — so anything added to that queue lands directly on the number that
 *     matters. `afterInteractive` puts both tags after hydration instead.
 *
 *  2. CONSENT ARRIVES TOO LATE. Consent Mode has to be set BEFORE the tag
 *     reads it, and a pasted snippet gives no way to order that. Handled by a
 *     `beforeInteractive` block in the root layout — see below.
 *
 *  3. NO SPA PAGE VIEWS. gtag's config fires one page_view on load and never
 *     again; client-side navigation between /decode and /vetbill would go
 *     unrecorded. `send_page_view: false` hands that job to AnalyticsBoot,
 *     which already fires on every pathname change.
 *
 * Not using `@next/third-parties` deliberately: it wraps the same
 * `next/script` that is already available here, and it offers no way to order
 * a consent-default block ahead of the loader — which is the one thing that
 * actually needs controlling.
 *
 * ---------------------------------------------------------------------------
 * THE CONSENT DEFAULT IS NOT IN THIS FILE
 * ---------------------------------------------------------------------------
 * It renders directly in app/layout.tsx, and it has to. Next requires
 * `beforeInteractive` scripts to be placed in the ROOT LAYOUT itself — not in
 * a component the layout happens to render — and since the only thing that
 * makes that script worth having is running before these loaders, a grey area
 * about whether the strategy applies is not something to build on.
 *
 * If you move these loaders, check that the consent default still precedes
 * them. Nothing fails loudly if it doesn't; the hits just go out assuming
 * consent that was never granted.
 *
 * ---------------------------------------------------------------------------
 * DO NOT PUT A GA4 TAG IN THE GTM CONTAINER
 * ---------------------------------------------------------------------------
 * GA4 is loaded directly, right here. A GA4 Configuration tag inside GTM for
 * the same measurement id counts every hit TWICE, with no error anywhere —
 * page views, conversions, revenue. A new container has no such tag, so the
 * default is correct; use GTM for other vendors. If GA4 should ever move into
 * GTM, delete the gtag block below in the same commit. Never both.
 *
 * Server component — it renders script tags and holds no state.
 */
export function GoogleTags() {
  /*
    Nothing renders when the ids are unset, which is what keeps local and
    staging traffic out of the production property. See lib/analytics/ids.ts.
  */
  if (!GA4_ID && !GTM_ID) return null;

  return (
    <>
      {GA4_ID && (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
gtag('js', new Date());
gtag('config', '${GA4_ID}', {
  /* AnalyticsBoot owns page_view so client-side navigation is counted. */
  send_page_view: false
});`.trim(),
            }}
          />
        </>
      )}

      {GTM_ID && (
        <Script
          id="gtm-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`.trim(),
          }}
        />
      )}
    </>
  );
}

/**
 * GTM's no-JavaScript fallback iframe. Belongs immediately inside `<body>`.
 *
 * Kept as its own export because it has to render in a different place from
 * the loader above, and because it is genuinely close to useless: it fires
 * nothing but a page view, and a visitor with JS disabled can't use the forms
 * this site exists for. It's here because GTM's install check looks for it and
 * flags the container as misconfigured without it.
 */
export function GoogleTagsNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
