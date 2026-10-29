import { useEffect, useRef } from "react";
import useDialog from "../hooks/useDialog";
import { PHOTOS, photoUrl, photoAlt } from "../data/photos";
import { ChevronIcon, CloseIcon, ExpandIcon, GridIcon } from "./Icons";

const TOUR = "PHOTO_TOUR_SCROLLABLE";

// Single-photo viewer. EVERYTHING shown (image, category, title, description, counter, alt)
// is read from the one PHOTOS[index] object, so next / prev / thumbnail / swipe / fullscreen can't desync.
export default function PhotoViewer({ index, navigate }) {
  const last = PHOTOS.length - 1;
  const photo = PHOTOS[index];
  const rootRef = useRef(null);
  const stripRef = useRef(null);
  const touchX = useRef(null);

  useDialog(rootRef, { initialFocus: ".pt-stage .pt-figure" });

  const goTo = (i) => navigate(`modal=${TOUR}&modalItem=${i}`);
  const backToTour = () => navigate(`modal=${TOUR}`);
  const prev = () => index > 0 && goTo(index - 1);
  const next = () => index < last && goTo(index + 1);

  // Keyboard: ← → arrows, Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") backToTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // no deps: every render sees the latest index

  // Keep the active filmstrip thumbnail in view
  useEffect(() => {
    stripRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [index]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.();
  };

  // Mobile swipe: left = next, right = previous (same PHOTOS order)
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  };

  return (
    <div className="pt-overlay pt-viewer" ref={rootRef} role="dialog" aria-modal="true" aria-label="Photo viewer" tabIndex={-1}>
      <header className="pt-bar">
        <button className="pt-icon" onClick={backToTour} aria-label="Show all photos"><GridIcon size={16} /></button>
        <strong>{photo.category}</strong>
        <span className="pt-bar-right">
          <span className="pt-count" aria-live="polite">{photo.order} of {PHOTOS.length}</span>
          <button className="pt-icon" onClick={toggleFullscreen} aria-label="Toggle fullscreen"><ExpandIcon size={16} /></button>
          <button className="pt-icon" onClick={backToTour} aria-label="Close"><CloseIcon size={16} /></button>
        </span>
      </header>

      <div className="pt-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button className="pt-arrow" disabled={index === 0} onClick={prev} aria-label="Previous photo"><ChevronIcon dir="left" size={16} /></button>

        <figure className="pt-figure" tabIndex={-1}>
          <img key={photo.id} src={photoUrl(photo, 1200)} alt={photoAlt(photo)} />
          <figcaption className="pt-caption">
            <b>{photo.title}</b>
            {photo.description && <span>{photo.description}</span>}
          </figcaption>
        </figure>

        <button className="pt-arrow" disabled={index === last} onClick={next} aria-label="Next photo"><ChevronIcon size={16} /></button>
      </div>

      <ul className="pt-filmstrip" ref={stripRef} aria-label="All photos">
        {PHOTOS.map((p) => (
          <li key={p.id}>
            <button
              className={p.order - 1 === index ? "on" : ""}
              aria-current={p.order - 1 === index ? "true" : undefined}
              aria-label={`Photo ${p.order}: ${p.title}`}
              onClick={() => goTo(p.order - 1)}
            >
              <img src={photoUrl(p, 240)} alt="" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
