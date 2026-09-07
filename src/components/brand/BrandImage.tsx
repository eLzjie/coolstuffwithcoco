import Image from "next/image";
import { BRAND, brandSrc, type BrandKey } from "@/lib/brand/manifest";

type Props = {
  slot: BrandKey;
  className?: string;
  /** Responsive sizes hint. Always pass this for anything not fixed-width. */
  sizes?: string;
  /** Set on the LCP image only. */
  priority?: boolean;
  /** Override alt when context makes the manifest default wrong. */
  alt?: string;
};

/**
 * Renders a brand asset, or an obviously-unfinished placeholder box at the
 * correct aspect ratio while `ready: false` in the manifest.
 *
 * The placeholder reserves the exact same space as the real image, so swapping
 * an asset in never shifts layout.
 */
export function BrandImage({ slot, className, sizes, priority, alt }: Props) {
  const asset = BRAND[slot];

  if (!asset.ready) {
    return (
      <div
        className={`ph ${className ?? ""}`}
        style={{ aspectRatio: `${asset.w} / ${asset.h}` }}
        role="img"
        aria-label={`Placeholder for: ${asset.alt}`}
      >
        <span>
          <strong className="block font-semibold">Placeholder</strong>
          {asset.note}
          <span className="mt-1 block opacity-60">
            {asset.file} · {asset.w}×{asset.h}
          </span>
        </span>
      </div>
    );
  }

  return (
    <Image
      src={brandSrc(slot)}
      alt={alt ?? asset.alt}
      width={asset.w}
      height={asset.h}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
