import { useEffect, useLayoutEffect, useRef, useState } from "react";
import useDialog from "../hooks/useDialog";
import { ChevronIcon, HeartIcon, ShareIcon } from "./Icons";
import { ROOMS, photoUrl, photoAlt } from "../data/photos";

const TOUR = "PHOTO_TOUR_SCROLLABLE";

// Scrollable "Photo tour" overlay (opened from "Show all photos" or any hero photo)
export default function PhotoTour({ navigate, focusPhoto }) {
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const [active, setActive] = useState(ROOMS[0].id);

  useDialog(rootRef, { initialFocus: ".pt-icon" });

  // Lock background scroll while the tour is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Esc -> close (when the single-photo viewer is open, it handles Esc itself)
  useEffect(() => {
    const onKey = (e) => {
      const viewerOpen = new URLSearchParams(window.location.search).has("modalItem");
      if (e.key === "Escape" && !viewerOpen) navigate("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Scroll-spy: highlight the thumbnail of the room currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.dataset.id));
      },
      { root: scrollRef.current, rootMargin: "-10% 0px -70% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Opened from a gallery photo: jump straight to that photo (before paint, so no flash of the top).
  useLayoutEffect(() => {
    if (!focusPhoto) return;
    const el = scrollRef.current?.querySelector(`[data-photo="${focusPhoto}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    setActive(el.closest("section").dataset.id);
    el.classList.add("pt-focus");
  }, [focusPhoto]);

  const scrollToRoom = (id) =>
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="pt-overlay" ref={rootRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Photo tour">
      <header className="pt-bar">
        <button className="pt-icon" onClick={() => navigate("")} aria-label="Back"><ChevronIcon dir="left" size={16} /></button>
        <strong>Photo tour</strong>
        <span className="pt-bar-right">
          <button className="pt-icon" aria-label="Share" onClick={() => navigator.clipboard?.writeText(location.href)}><ShareIcon size={16} /></button>
          <button className="pt-icon" aria-label="Save"><HeartIcon size={16} /></button>
        </span>
      </header>

      <div className="pt-scroll" ref={scrollRef}>
        <div className="pt-inner">
          {/* Room thumbnails: click -> smooth-scroll to that room */}
          <div className="pt-thumbs">
            {ROOMS.map((room) => (
              <button
                key={room.id}
                className={`pt-thumb ${active === room.id ? "active" : ""}`}
                onClick={() => scrollToRoom(room.id)}
              >
                <img src={photoUrl(room.photos[0], 240)} alt="" loading="lazy" />
                <small>{room.title}</small>
              </button>
            ))}
          </div>

          {ROOMS.map((room) => (
            <section
              key={room.id}
              data-id={room.id}
              ref={(el) => (sectionRefs.current[room.id] = el)}
              className="pt-room"
            >
              <div className="pt-room-text">
                <h2>{room.title}</h2>
                {room.description && <p>{room.description}</p>}
              </div>

              <div className="pt-room-photos">
                {room.photos.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    data-photo={p.id}
                    className={`pt-photo ${i === 0 ? "wide" : ""}`}
                    aria-label={`Open ${photoAlt(p)} in viewer`}
                    onClick={() => navigate(`modal=${TOUR}&modalItem=${p.order - 1}`)}
                  >
                    <img src={photoUrl(p)} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}