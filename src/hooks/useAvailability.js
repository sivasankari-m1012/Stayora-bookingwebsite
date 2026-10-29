import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

// Nights already booked / blocked by the host, as a Set of "YYYY-MM-DD". Fails soft: no backend => nothing blocked.
export function useAvailability() {
  const [blocked, setBlocked] = useState(() => new Set());
  const refresh = useCallback(() => {
    api.availability().then((r) => setBlocked(new Set(r.unavailable))).catch(() => {});
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { blocked, refresh };
}
