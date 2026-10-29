import { BOOKING } from "../data/booking";

const ROWS = [
  { key: "adults",   title: "Adults",   sub: "Age 13+",             min: 1 },
  { key: "children", title: "Children", sub: "Ages 2-12",           min: 0 },
  { key: "infants",  title: "Infants",  sub: "Under 2",             min: 0 },
  { key: "pets",     title: "Pets",     sub: "Bringing a pet?",     min: 0 },
];

export default function GuestPicker({ guests, setGuests, onClose }) {
  const change = (key, delta) =>
    setGuests((g) => ({ ...g, [key]: g[key] + delta }));

  const canIncrease = (key) => {
    if (key === "adults" || key === "children")
      return guests.adults + guests.children < BOOKING.maxGuests;
    if (key === "infants") return guests.infants < BOOKING.maxInfants;
    return guests.pets < BOOKING.maxPets;
  };

  return (
    <div className="gp-popup" role="dialog" aria-label="Select guests">
      {ROWS.map((row) => (
        <div className="gp-row" key={row.key}>
          <div>
            <strong>{row.title}</strong>
            <p>{row.sub}</p>
          </div>

          <div className="gp-stepper">
            <button
              onClick={() => change(row.key, -1)}
              disabled={guests[row.key] <= row.min}
              aria-label={`Decrease ${row.title}`}
            >−</button>
            <span aria-live="polite">{guests[row.key]}</span>
            <button
              onClick={() => change(row.key, 1)}
              disabled={!canIncrease(row.key)}
              aria-label={`Increase ${row.title}`}
            >+</button>
          </div>
        </div>
      ))}

      <p className="gp-note">
        This place has a maximum of {BOOKING.maxGuests} guests, not including infants.
      </p>

      <button className="gp-close" onClick={onClose}>Close</button>
    </div>
  );
}