import { useCallback, useEffect, useState } from "react";

// ?modal=PHOTO_TOUR_SCROLLABLE               -> photo tour
// ?modal=PHOTO_TOUR_SCROLLABLE&modalItem=3   -> single photo viewer
// ?modal=PHOTO_TOUR_SCROLLABLE&photo=<id>  -> photo tour, scrolled to that photo
// ?modal=AMENITIES                           -> all amenities modal
const read = () => {
  const q = new URLSearchParams(window.location.search);
  const item = q.get("modalItem");
  return { modal: q.get("modal"), item: item === null ? null : Number(item), photo: q.get("photo") };
};

export default function useModalParams() {
  const [params, setParams] = useState(read);

  useEffect(() => {
    const sync = () => setParams(read());
    window.addEventListener("popstate", sync);     // browser Back / Forward
    window.addEventListener("modalchange", sync);  // our own navigate() -> keeps every component in sync
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("modalchange", sync);
    };
  }, []);

  // navigate("") -> home,  navigate("modal=...") -> open modal
  const navigate = useCallback((query) => {
    const url = window.location.pathname + (query ? `?${query}` : "");
    window.history.pushState({}, "", url);
    window.dispatchEvent(new Event("modalchange"));
  }, []);

  return [params, navigate];
}