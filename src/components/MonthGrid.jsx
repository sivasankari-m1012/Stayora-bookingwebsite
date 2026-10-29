import { buildMonth, formatLong, isPickable, isSameDay, monthLabel, toISO } from "../utils/dates";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// One month of a date-range calendar. Shared by the booking popup and the page calendar.
export default function MonthGrid({ month, checkIn, checkOut, previewEnd, minDate, blocked, onPick, onHover }) {
  return (
    <div className="mg">
      <h4>{monthLabel(month)}</h4>
      <div className="mg-grid mg-weekdays" aria-hidden="true">
        {WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}
      </div>
      <div className="mg-grid" onMouseLeave={() => onHover(null)}>
        {buildMonth(month).map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const selected = isSameDay(day, checkIn) || isSameDay(day, checkOut);
          const inRange = checkIn && previewEnd && day > checkIn && day < previewEnd;
          const start = checkIn && previewEnd && isSameDay(day, checkIn);
          const end = checkIn && previewEnd && isSameDay(day, previewEnd);
          return (
            <div key={day.getTime()} className={`mg-cell${inRange ? " in" : ""}${start ? " start" : ""}${end ? " end" : ""}`}>
              <button
                type="button"
                className={`mg-day${selected ? " selected" : ""}${blocked?.has(toISO(day)) ? " booked" : ""}`}
                disabled={!isPickable(day, { checkIn, checkOut, blocked, minDate })}
                aria-label={formatLong(day)}
                aria-pressed={selected}
                onClick={() => onPick(day)}
                onMouseEnter={() => onHover(day)}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
