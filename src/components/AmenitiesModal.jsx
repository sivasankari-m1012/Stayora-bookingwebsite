import { useEffect, useRef } from "react";
import useDialog from "../hooks/useDialog";
import { AMENITY_CATEGORIES } from "../data/amenities";

export default function AmenitiesModal({ onClose }) {
  const dialogRef = useRef(null);
  useDialog(dialogRef, { initialFocus: ".am-close" });

  // Lock page scroll while open + Esc closes
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    // Backdrop click closes; clicks inside the dialog do not bubble
    <div className="am-backdrop" onClick={onClose}>
      <div
        className="am-dialog"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="What this place offers"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="am-header">
          <button className="am-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="am-body">
          <h2>What this place offers</h2>

          {AMENITY_CATEGORIES.map((cat) => (
            <section key={cat.title} className="am-section">
              <h3>{cat.title}</h3>
              <ul>
                {cat.items.map((item) => (
                  <li key={item.label}>
                    <span>{item.icon}</span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}