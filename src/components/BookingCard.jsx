import { useEffect, useRef, useState } from "react";
import DateRangePicker from "./DateRangePicker";
import GuestPicker from "./GuestPicker";
import { CANCEL_BEFORE, DEFAULT_STAY, formatPrice, stayTotal } from "../data/booking";
import { ChevronIcon } from "./Icons";
import { formatLong, formatShort, nightsBetween, startOfDay, toISO } from "../utils/dates";
import { api } from "../api";
import "../booking.css";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function BookingCard({ dates, setDates, blocked, onBooked }) {
  const [guests, setGuests] = useState({ adults: DEFAULT_STAY.adults, children: 0, infants: 0, pets: 0 });
  const [panel, setPanel] = useState(null); // null | "dates" | "guests"
  const [step, setStep] = useState("idle"); // idle | form | done
  const [form, setForm] = useState({ name: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const keyRef = useRef(null); // one Idempotency-Key per attempt, so a double-click can't book twice
  const cardRef = useRef(null);

  const today = startOfDay(new Date());
  const { checkIn, checkOut } = dates;
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const total = stayTotal(nights);

  // Click outside the card or press Esc -> close the open panel
  useEffect(() => {
    const onPointerDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setPanel(null);
    };
    const onKey = (e) => e.key === "Escape" && setPanel(null);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const changeDates = (next) => {
    setDates(next);
    if (step !== "idle") { setStep("idle"); setError(""); }
  };

  const guestCount = guests.adults + guests.children;
  const guestLabel =
    plural(guestCount, "guest") +
    (guests.infants ? `, ${plural(guests.infants, "infant")}` : "") +
    (guests.pets ? `, ${plural(guests.pets, "pet")}` : "");

  const toggle = (name) => setPanel((p) => (p === name ? null : name));

  const onReserve = () => {
    if (!nights) { setPanel("dates"); return; }   // no dates yet -> pick dates first
    keyRef.current = crypto.randomUUID();
    setError("");
    setStep("form");
  };

  const confirm = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const b = await api.book(
        { checkIn: toISO(checkIn), checkOut: toISO(checkOut), ...guests, guestName: form.name, guestEmail: form.email },
        keyRef.current
      );
      setBooking(b);
      setStep("done");
      onBooked?.();            // refresh calendars so these nights show as taken
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelBooking = async () => {
    setBusy(true);
    try {
      await api.cancel(booking.reference);
      setBooking(null);
      setStep("idle");
      onBooked?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="booking" className="booking-card" ref={cardRef}>

      <div className="booking-price">
        {nights > 0 ? (
          <>
            <strong>{formatPrice(total)}</strong>
            <span>&nbsp; for {plural(nights, "night")}</span>
          </>
        ) : (
          <strong className="bk-add-dates">Add dates for prices</strong>
        )}
      </div>

      <div className="bk-fields-wrap">
        <div className="booking-fields">

          <button
            type="button"
            className={`booking-field bk-clickable ${panel === "dates" && !checkIn ? "active" : ""}`}
            onClick={() => setPanel("dates")}
          >
            <strong>CHECK-IN</strong>
            <span className={checkIn ? "bk-filled" : ""}>
              {checkIn ? formatShort(checkIn) : "Add date"}
            </span>
          </button>

          <button
            type="button"
            className={`booking-field bk-clickable ${panel === "dates" && checkIn && !checkOut ? "active" : ""}`}
            onClick={() => setPanel("dates")}
          >
            <strong>CHECKOUT</strong>
            <span className={checkOut ? "bk-filled" : ""}>
              {checkOut ? formatShort(checkOut) : "Add date"}
            </span>
          </button>

          <button
            type="button"
            className={`booking-field guests-field bk-clickable ${panel === "guests" ? "active" : ""}`}
            onClick={() => toggle("guests")}
          >
            <strong>GUESTS</strong>
            <span className="bk-filled">{guestLabel}</span>
            <span className={`guest-arrow ${panel === "guests" ? "open" : ""}`}><ChevronIcon dir="down" size={16} /></span>
          </button>

        </div>

        {panel === "dates" && (
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            minDate={today}
            blocked={blocked}
            onChange={changeDates}
            onClose={() => setPanel(null)}
          />
        )}

        {panel === "guests" && (
          <GuestPicker
            guests={guests}
            setGuests={setGuests}
            onClose={() => setPanel(null)}
          />
        )}
      </div>

      <p className="bk-cancel">Free cancellation before <b>{CANCEL_BEFORE}</b></p>

      {step === "done" && booking ? (
        <div className="bk-confirmed" role="status">
          <p className="bk-success"><b>✓ Booking confirmed</b></p>
          <div className="bk-breakdown">
            <div><span>Reference</span><strong>{booking.reference}</strong></div>
            <div><span>Dates</span><span>{formatLong(checkIn)} - {formatLong(checkOut)}</span></div>
            <div><span>Guests</span><span>{guestLabel}</span></div>
            <div><span>{formatPrice(booking.price.nightlyRate)} x {plural(booking.nights, "night")}</span><span>{formatPrice(booking.price.total)}</span></div>
            <div className="bk-total"><strong>Total before taxes</strong><strong>{formatPrice(booking.price.total)}</strong></div>
          </div>
          <p className="booking-note">Confirmation for {booking.guest.name} ({booking.guest.email})</p>
          {error && <p className="bk-error" role="alert">{error}</p>}
          <button type="button" className="bk-cancel-link" disabled={busy} onClick={cancelBooking}>Cancel this booking</button>
        </div>
      ) : step === "form" ? (
        <form className="bk-form" onSubmit={confirm}>
          <label>Full name
            <input required minLength={2} maxLength={80} value={form.name} autoComplete="name"
                   onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>Email
            <input required type="email" value={form.email} autoComplete="email"
                   onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          {error && <p className="bk-error" role="alert">{error}</p>}
          <button className="reserve-button" type="submit" disabled={busy}>
            {busy ? "Booking\u2026" : `Confirm \u00b7 ${formatPrice(total)}`}
          </button>
          <button type="button" className="bk-cancel-link" onClick={() => { setStep("idle"); setError(""); }}>Back</button>
          <p className="booking-note">You won't be charged yet</p>
        </form>
      ) : (
        <>
          <button className="reserve-button" onClick={onReserve}>
            {nights ? "Reserve" : "Check availability"}
          </button>
          <p className="booking-note">You won't be charged yet</p>
        </>
      )}

    </div>
  );
}

export default BookingCard;