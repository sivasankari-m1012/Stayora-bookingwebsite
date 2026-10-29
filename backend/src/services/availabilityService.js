import { assertGuests, assertStay, eachNight, firstOfMonthAfter, priceStay } from "../domain/stay.js";

export function createAvailabilityService({ content, bookings, clock }) {
  // Nights that cannot be booked inside [from, to): host-blocked nights + nights of confirmed bookings.
  function unavailableNights(from, to) {
    const set = new Set(bookings.blockedDates(from, to));
    for (const b of bookings.confirmedOverlapping(from, to)) {
      for (const night of eachNight(b.check_in, b.check_out)) if (night >= from && night < to) set.add(night);
    }
    return [...set].sort();
  }

  const isRangeFree = (checkIn, checkOut) => unavailableNights(checkIn, checkOut).length === 0;

  function availability({ from, months }) {
    const today = clock.today();
    const start = from ? `${from}-01` : `${today.slice(0, 7)}-01`;
    const to = firstOfMonthAfter(start, months);
    return { from: start, to, unavailable: unavailableNights(start, to), minDate: today };
  }

  function quote({ checkIn, checkOut, ...guests }) {
    const listing = content.listing();
    const nights = assertStay({ checkIn, checkOut }, clock.today());
    return {
      checkIn,
      checkOut,
      guests: assertGuests(guests, listing.capacity),
      available: isRangeFree(checkIn, checkOut),
      price: priceStay(nights, listing.pricing.nightlyRate, listing.pricing.currency),
      cancellation: listing.rules.cancellation,
    };
  }

  return { availability, quote, isRangeFree };
}
