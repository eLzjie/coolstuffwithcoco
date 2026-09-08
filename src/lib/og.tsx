/**
 * Shared layout for the generated Open Graph cards.
 *
 * ---------------------------------------------------------------------------
 * WHY THE COLOURS ARE HARDCODED HEX
 * ---------------------------------------------------------------------------
 * `ImageResponse` runs Satori, which is not a browser. It resolves a small
 * subset of CSS and knows nothing about custom properties, `color-mix()`, or
 * the stylesheet — so `var(--color-coral)` renders as nothing at all, and the
 * failure is a silently wrong image rather than an error.
 *
 * These therefore duplicate the palette from globals.css, which is a genuine
 * duplication and worth being honest about. If a brand colour changes, change
 * it in both places. The alternative — parsing the stylesheet at build time to
 * extract two hex values — is more machinery than the problem deserves.
 *
 * ---------------------------------------------------------------------------
 * SATORI CONSTRAINTS THAT BITE
 * ---------------------------------------------------------------------------
 *  - Flexbox only. No grid, no float. Every container needs an explicit
 *    `display: "flex"` — Satori does not default to it the way it defaults to
 *    block in a browser.
 *  - No `gap` shorthand reliability; margins are safer.
 *  - Fonts: without a font buffer passed in, Satori falls back to its bundled
 *    sans. That's deliberate here. Loading Poppins would mean reading the font
 *    file on every render for a decorative image, and the generated card is a
 *    stopgap until real artwork lands — see the note in opengraph-image.tsx.
 */

/** Facebook, X, LinkedIn and iMessage all treat 1200×630 as the canonical size. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

/** Palette, mirrored from globals.css. See the note above. */
const INK = "#211C1A";
const PAPER = "#FDF9F5";

/**
 * The card layout, returned as a React element for `ImageResponse`.
 *
 * Deliberately one function rather than a component per page: the three cards
 * differ only in their text and accent colour, and three near-identical files
 * is how they drift apart.
 */
export function ogImage({
  eyebrow,
  title,
  sub,
  accent,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  /** Brand wash for the bar and the rule. Hex only — see the note above. */
  accent: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: PAPER,
        // The thick ink border is the brand's most recognisable device.
        border: `12px solid ${INK}`,
      }}
    >
      {/* Accent bar — tells the three guides apart at a glance in a feed. */}
      <div style={{ display: "flex", height: 24, backgroundColor: accent }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "56px 64px",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: INK,
            opacity: 0.7,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            color: INK,
            marginTop: 20,
            // Keeps a long guide title from crowding the subtitle.
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            width: 140,
            height: 8,
            backgroundColor: accent,
            marginTop: 32,
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 32,
            lineHeight: 1.35,
            color: INK,
            opacity: 0.8,
            marginTop: 28,
            maxWidth: 880,
          }}
        >
          {sub}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          padding: "0 64px 44px",
          fontSize: 26,
          color: INK,
          opacity: 0.65,
        }}
      >
        coolstuffwithcoco.com
      </div>
    </div>
  );
}
