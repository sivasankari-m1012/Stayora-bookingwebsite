// Date helper functions, written by hand (no date library).
// Local-date <-> "YYYY-MM-DD" (what the API speaks). Never use toISOString() here: it shifts the day in IST.
export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Can `day` be clicked? A new check-in needs a free night; a checkout needs every night in between free
// (the checkout day itself may be someone else's check-in).
export function isPickable(day, { checkIn, checkOut, blocked, minDate }) {
  if (day < minDate) return false;
  if (!blocked || blocked.size === 0) return true;
  if (checkIn && !checkOut && day > checkIn) {
    for (let d = new Date(checkIn); d < day; d.setDate(d.getDate() + 1)) if (blocked.has(toISO(d))) return false;
    return true;
  }
  return !blocked.has(toISO(day));
}

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const isSameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime();

export const firstOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

export const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

export const nightsBetween = (a, b) => Math.round((b - a) / 86400000);

export const monthLabel = (d) =>
  d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

export const formatLong = (d) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const formatShort = (d) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

// Cells for one month of the calendar: leading nulls for the weekday offset, then one entry per day
export function buildMonth(view) {
  const y = view.getFullYear();
  const m = view.getMonth();
  const offset = new Date(y, m, 1).getDay(); // 0 = Sunday
  const days = new Date(y, m + 1, 0).getDate();
  return [
    ...Array(offset).fill(null),
    ...Array.from({ length: days }, (_, i) => new Date(y, m, i + 1)),
  ];
}

// Click rule shared by every calendar: start a new range, or finish the open one.
export const pickDay = ({ checkIn, checkOut }, day) =>
  !checkIn || checkOut || day <= checkIn ? { checkIn: day, checkOut: null } : { checkIn, checkOut: day };
