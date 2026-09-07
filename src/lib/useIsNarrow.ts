"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * True below 768px.
 *
 * `useSyncExternalStore` rather than useState+useEffect — matchMedia is an
 * external store, which is exactly what this hook is for, and it avoids the
 * cascading render that setState-in-an-effect causes.
 *
 * The server snapshot is `true`, so the first paint on mobile — effectively all
 * of this site's traffic — never arms a parallax transform it's about to
 * disable.
 */
export function useIsNarrow(query = "(max-width: 767px)") {
  const subscribe = useMemo(
    () => (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
