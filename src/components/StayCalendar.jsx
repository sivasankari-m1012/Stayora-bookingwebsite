import { useState } from "react";
import { addMonths, firstOfMonth, formatLong, nightsBetween, pickDay, startOfDay } from "../utils/dates";
import MonthGrid from "./MonthGrid";
import { ChevronIcon } from "./Icons";
import "../calendar.css";

// "5 nights in Varkala" availability calendar. Shares its dates with the booking card.
export default function StayCalendar({ dates, setDates, blocked }) {
  const today = startOfDay(new Date());
  const { checkIn, checkOut } = dates;
  const [view, setView] = useState(() => firstOfMonth(checkIn ?? today));
  const [hover, setHover] = useState(null);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const previewEnd = checkOut ?? (checkIn && hover && hover > checkIn ? hover : null);

  return (
    <section className="stay-cal" id="calendar" aria-labelledby="cal-h">
      <h2 id="cal-h">
        {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""} in Varkala` : checkIn ? "Select checkout date" : "Select check-in date"}
      </h2>
      <p className="muted">
        {checkIn && checkOut ? `${formatLong(checkIn)} - ${formatLong(checkOut)}` : "Add your travel dates for exact pricing"}
      </p>

      <div className="sc-months">
        <button type="button" className="sc-nav sc-prev" aria-label="Previous month"
                disabled={view <= firstOfMonth(today)} onClick={() => setView(addMonths(view, -1))}>
          <ChevronIcon dir="left" size={14} />
        </button>
        <button type="button" className="sc-nav sc-next" aria-label="Next month" onClick={() => setView(addMonths(view, 1))}>
          <ChevronIcon size={14} />
        </button>
        {[view, addMonths(view, 1)].map((m) => (
          <MonthGrid key={m.getTime()} month={m} checkIn={checkIn} checkOut={checkOut}
                     previewEnd={previewEnd} minDate={today} blocked={blocked} onHover={setHover}
                     onPick={(day) => setDates(pickDay(dates, day))} />
        ))}
      </div>

      <div className="sc-foot">
        <button type="button" className="link" onClick={() => setDates({ checkIn: null, checkOut: null })}>Clear dates</button>
      </div>
    </section>
  );
}
