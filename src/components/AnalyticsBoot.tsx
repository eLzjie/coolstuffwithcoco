"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution } from "@/lib/utm";
import { track } from "@/lib/analytics/track";

/**
 * Captures campaign params on landing and fires page_view.
 *
 * Attribution capture runs before the first event so every event carries the
 * campaign that brought the visitor in.
 *
 * The Meta Pixel script itself is NOT loaded here — it must sit behind the
 * consent gate. TODO(Eli): once you've decided banner vs CMP, load the Pixel
 * from the gate's granted callback. Until then `track()` queues events and
 * logs them under NEXT_PUBLIC_ANALYTICS_DEBUG=1, so the vocabulary is
 * verifiable without a live Pixel.
 */
export function AnalyticsBoot() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    track("page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}
