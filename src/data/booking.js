// Booking card numbers live here; change them in this one place.
export const BOOKING = {
  nightlyRate: 5699.8, // 5 nights => exactly the listed 28,499
  maxGuests: 3,        // adults + children (property: "3 guests")
  maxInfants: 5,
  maxPets: 1,
};

// Stay shown when the page first loads (month is 0-based: 10 = November)
export const DEFAULT_STAY = { checkIn: new Date(2026, 10, 20), checkOut: new Date(2026, 10, 25), adults: 2 };
export const CANCEL_BEFORE = "19 November";

export const stayTotal = (nights) => Math.round(nights * BOOKING.nightlyRate);
export const formatPrice = (n) => `\u20b9${Math.round(n).toLocaleString("en-IN")}`;
