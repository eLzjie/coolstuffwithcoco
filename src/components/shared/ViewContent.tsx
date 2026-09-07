"use client";

import { useEffect } from "react";
import { track, type LeadMagnet } from "@/lib/analytics/track";

/**
 * Fires `view_content` once on mount for a guide landing page.
 *
 * Exists as its own tiny client component so the landing pages themselves stay
 * server components — nothing on them needs interactivity except the quiz, the
 * table and the form.
 */
export function ViewContent({
  magnet,
  name,
}: {
  magnet: LeadMagnet;
  name: string;
}) {
  useEffect(() => {
    track("view_content", { lead_magnet: magnet, content_name: name });
  }, [magnet, name]);

  return null;
}
