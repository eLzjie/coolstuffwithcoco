import { Ball, Bone, Heart, Paw, Speech } from "@/components/brand/Icons";

/**
 * Decorative brand furniture for a section wash: a few slow-moving shapes
 * behind the content.
 *
 * Rules this sticks to:
 *  - everything here is `aria-hidden` and `pointer-events-none`
 *  - only `transform` animates, so it stays on the compositor
 *  - loops are long (4.5s–18s) and low-amplitude, so they never pull the eye
 *    off the copy
 *  - all of it stops under `prefers-reduced-motion` (handled in globals.css)
 *  - sparse by design — this is texture, not confetti
 *
 * Server component: no interactivity, so it ships no JS.
 */

type Variant = "paws" | "balls" | "care" | "mixed";

const SETS: Record<Variant, Array<{ Icon: typeof Paw; cls: string }>> = {
  paws: [
    { Icon: Paw, cls: "drift left-[4%] top-[14%] h-10 w-10 text-ink/10" },
    { Icon: Paw, cls: "drift delay-2 right-[7%] top-[62%] h-8 w-8 text-ink/10" },
    { Icon: Bone, cls: "bob delay-1 left-[12%] bottom-[10%] h-7 w-7 text-ink/10" },
  ],
  balls: [
    { Icon: Ball, cls: "bob left-[5%] top-[20%] h-9 w-9 text-coral/40" },
    { Icon: Ball, cls: "spin-slow right-[6%] top-[70%] h-12 w-12 text-coral/25" },
    { Icon: Paw, cls: "drift delay-3 right-[16%] top-[16%] h-8 w-8 text-ink/10" },
  ],
  care: [
    { Icon: Heart, cls: "bob left-[6%] top-[24%] h-9 w-9 text-coral/40" },
    { Icon: Heart, cls: "bob delay-2 right-[9%] bottom-[16%] h-6 w-6 text-coral/30" },
    { Icon: Speech, cls: "drift delay-1 right-[5%] top-[22%] h-9 w-9 text-ink/10" },
  ],
  mixed: [
    { Icon: Bone, cls: "drift left-[4%] top-[18%] h-9 w-9 text-ink/10" },
    { Icon: Ball, cls: "bob delay-1 right-[6%] top-[30%] h-8 w-8 text-coral/35" },
    { Icon: Paw, cls: "drift delay-3 left-[14%] bottom-[12%] h-7 w-7 text-ink/10" },
    { Icon: Heart, cls: "bob delay-2 right-[14%] bottom-[18%] h-6 w-6 text-coral/25" },
  ],
};

export function Ambient({ variant = "mixed" }: { variant?: Variant }) {
  return (
    <div aria-hidden className="decor-layer pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {SETS[variant].map(({ Icon, cls }, i) => (
        <Icon key={i} className={`absolute ${cls}`} />
      ))}
    </div>
  );
}
