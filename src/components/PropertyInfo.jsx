import { useState } from "react";
import { ChevronIcon, DoorIcon, FanIcon, LaurelIcon, PoolIcon, StarIcon } from "./Icons";
import { RATING, TOTAL_REVIEWS } from "../data/reviews";
import { Sleep } from "./Sections";
import "../details.css";

const FEATURES = [
  [PoolIcon, "Outdoor entertainment", "The pool and alfresco dining are great for summer trips."],
  [FanIcon, "Designed for staying cool", "Beat the heat with the A/C and ceiling fan."],
  [DoorIcon, "Self check-in", "You can check in with the building staff."],
];

const ABOUT =
  "\u{1F334} Unwind at Sea Breeze Suite by Palmcrest Stays! \u2728 This bright 1BHK sits a short walk from the Varkala cliff, with a private hot tub \u{1F6C1} on the terrace for slow evenings. Enjoy fast WiFi \u{1F4BB}, a Smart TV \u{1F4FA}, pet-friendly comfort \u{1F43E} and calm, airy interiors. Beaches, caf\u00e9s and seafood shacks \u{1F379} are all minutes away, making it a great pick for couples who want rest, sea air and a little luxury on the Kerala coast. \u2764\uFE0F \u{1F334}";

export default function PropertyInfo() {
  const [open, setOpen] = useState(false);
  return (
    <section className="property-content pi" aria-label="About this place">
      <h2>Entire serviced apartment in Varkala, India</h2>
      <p className="guest-details">3 guests · 1 bedroom · 1 bed · 1 bathroom</p>

      <div className="pi-fav">
        <div className="pi-badge">
          <LaurelIcon />
          <span>Guest<br />favourite</span>
          <LaurelIcon flip />
        </div>
        <p className="pi-fav-text">One of the most loved homes on Stayora, according to guests</p>
        <div className="score">
          <b>{RATING}</b>
          <span className="stars" role="img" aria-label={`${RATING} out of 5`}>
            {Array.from({ length: 5 }, (_, i) => <StarIcon key={i} size={9} />)}
          </span>
        </div>
        <div className="count"><b>{TOTAL_REVIEWS}</b><small>Reviews</small></div>
      </div>

      <div className="pi-host">
        <span className="avatar" aria-hidden="true">PALMCREST</span>
        <div><b>Hosted by Palmcrest Stays</b><span>2 years hosting</span></div>
      </div>

      <div className="pi-features">
        {FEATURES.map(([Icon, title, text]) => (
          <div className="pi-feature" key={title}>
            <Icon size={28} />
            <div><h3>{title}</h3><p>{text}</p></div>
          </div>
        ))}
      </div>

      <div className="pi-about">
        <p className="pi-translated">Some info has been automatically translated. <a href="#top" onClick={(e) => e.preventDefault()}>Show original</a></p>
        <p id="about-text" className={open ? "" : "clamp"}>{ABOUT}</p>
        <button className="show-more" aria-expanded={open} aria-controls="about-text" onClick={() => setOpen((v) => !v)}>
          {open ? "Show less" : "Show more"} <ChevronIcon size={14} />
        </button>
      </div>

      <Sleep />
    </section>
  );
}
