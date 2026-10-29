import { useState } from "react";
import { addMonths, firstOfMonth, formatLong, nightsBetween, pickDay } from "../utils/dates";
import MonthGrid from "./MonthGrid";

export default function DateRangePicker({ checkIn, checkOut, minDate, blocked, onChange, onClose }) {
  const [view, setView] = useState(() => firstOfMonth(checkIn ?? minDate));
  const [hover, setHover] = useState(null);

  const canGoPrev = view > firstOfMonth(minDate);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  const pick = (day) => {
    const next = pickDay({ checkIn, checkOut }, day);
    onChange(next);
    if (next.checkOut) onClose(); // range complete
  };

  // while choosing checkout, hovering previews the range
  const previewEnd = checkOut ?? (checkIn && hover && hover > checkIn ? hover : null);

  return (
    <div className="dp-popup" role="dialog" aria-label="Select dates">
      <div className="dp-head">
        <h3>
          {nights > 0
            ? `${nights} night${nights > 1 ? "s" : ""}`
            : checkIn ? "Select checkout date" : "Select check-in date"}
        </h3>
        <p>{checkIn && checkOut ? `${formatLong(checkIn)} - ${formatLong(checkOut)}` : "Minimum stay: 1 night"}</p>
      </div>

      <div className="dp-months">
        <button className="dp-nav dp-prev" onClick={() => setView(addMonths(view, -1))} disabled={!canGoPrev} aria-label="Previous month">‹</button>
        <button className="dp-nav dp-next" onClick={() => setView(addMonths(view, 1))} aria-label="Next month">›</button>
        {[view, addMonths(view, 1)].map((month) => (
          <MonthGrid key={month.getTime()} month={month} checkIn={checkIn} checkOut={checkOut}
                     previewEnd={previewEnd} minDate={minDate} blocked={blocked} onPick={pick} onHover={setHover} />
        ))}
      </div>

      <div className="dp-foot">
        <button className="dp-link" onClick={() => onChange({ checkIn: null, checkOut: null })}>Clear dates</button>
        <button className="dp-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
