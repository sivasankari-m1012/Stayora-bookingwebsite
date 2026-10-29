import { useEffect, useRef, useState } from "react";
import "../sections.css";
import { RATING, TOTAL_REVIEWS } from "../data/reviews";
import { NEARBY } from "../data/nearby";
import { ChevronIcon, StarIcon, BalloonIcon, GradCapIcon, ShieldIcon, CalendarXIcon, KeyMagIcon } from "./Icons";
import { BOOKING, CANCEL_BEFORE, DEFAULT_STAY, formatPrice, stayTotal } from "../data/booking";

const TABS = [
  ["photos", "Photos"],
  ["amenities", "Amenities"],
  ["reviews", "Reviews"],
  ["location", "Location"],
];

// Sticky sub-nav: appears after the gallery scrolls away, highlights the section in view.
export function SubNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("photos");

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const gallery = document.getElementById("photos");
        setVisible(!!gallery && gallery.getBoundingClientRect().bottom < 0);
        let cur = "photos";
        TABS.forEach(([id]) => {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < 120) cur = id;
        });
        setActive(cur);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav className={`subnav ${visible ? "show" : ""}`} aria-label="Page sections" aria-hidden={!visible}>
      <div className="subnav-inner">
        <ul>
          {TABS.map(([id, label]) => (
            <li key={id}>
              <button tabIndex={visible ? 0 : -1} className={active === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
            </li>
          ))}
        </ul>
        <div className="subnav-price">
          <p><span><b>{formatPrice(stayTotal(5))}</b> for 5 nights</span><small>★ {RATING} · {TOTAL_REVIEWS} reviews</small></p>
          <button tabIndex={visible ? 0 : -1} className="reserve-sm" onClick={() => go("booking")}>Reserve</button>
        </div>
      </div>
    </nav>
  );
}

// Sleeping-area cover photos live in public/sleep/ (bedroom.jpg, living-room.jpg).
const SLEEP = [
  { title: "Bedroom", beds: "1 double bed", src: "/sleep/bedroom.jpg" },
  { title: "Living room", beds: "1 sofa", src: "/sleep/living-room.jpg" },
];

export function Sleep() {
  return (
    <section className="pi-sleep" aria-labelledby="sleep-h">
      <h2 id="sleep-h">Where you'll sleep</h2>
      <div className="sleep-row">
        {SLEEP.map(({ title, beds, src }, i) => (
          <figure key={title} className="sleep-card">
            {src ? <img src={src} alt={title} loading="lazy" /> : <div className={`ph ph-${i}`} role="img" aria-label={title} />}
            <figcaption><b>{title}</b><span>{beds}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Location() {
  return (
    <section className="sec" id="location" aria-labelledby="loc-h">
      <h2 id="loc-h">Where you'll be</h2>
      <div className="map" role="img" aria-label="Map of Varkala, Kerala">
        <span className="pin" aria-hidden="true"><svg viewBox="0 0 32 32" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 15L16 4l12 11M7 13v15h18V13M13 28v-8h6v8"/></svg></span>
      </div>
      <p className="muted">Exact location will be provided after booking.</p>
      <h3>Neighbourhood highlights</h3>
      <p>Set a short walk from the Varkala cliff, Sea Breeze Suite offers a peaceful stay with easy access to beaches, cafés, and popular attractions.</p>
    </section>
  );
}

// Co-hosts. Add `photo: "/path.jpg"` to show a picture; otherwise an initial on a soft tone is used.
const CO_HOSTS = [
  { name: "Arjun", tone: "sand" },
  { name: "Lakshmi Nair", tone: "sand" },
  { name: "Joseph Mathew", tone: "sand" },
  { name: "Anita", tone: "sand" },
  { name: "Vishnu", tone: "sand" },
  { name: "Reshma", tone: "sand" },
  { name: "Gopika", tone: "rose" },
  { name: "Sneha", tone: "sky" },
];

function CoHostAvatar({ name, photo, tone }) {
  return photo
    ? <img className={`ch-avatar`} src={photo} alt="" loading="lazy" />
    : <span className={`ch-avatar ch-${tone}`} aria-hidden="true">{name[0]}</span>;
}

export function Host() {
  return (
    <section className="sec host" aria-labelledby="host-h">
      <h2 id="host-h">Meet your host</h2>
      <div className="host-grid">
        <div className="host-left">
          <div className="host-card">
            <div className="host-id">
              <div className="host-avatar" aria-hidden="true">
                <svg viewBox="0 0 112 112" width="112" height="112">
                  <circle cx="56" cy="56" r="56" fill="#0f5a3a" />
                  <circle cx="56" cy="46" r="6" fill="none" stroke="#e9e2d0" strokeWidth="1" opacity=".7" />
                  <text x="56" y="62" textAnchor="middle" fill="#e9e2d0" fontFamily="Georgia, serif" fontSize="14" letterSpacing="1">PALMCREST</text>
                  <text x="56" y="71" textAnchor="middle" fill="#e9e2d0" fontFamily="Georgia, serif" fontSize="5" letterSpacing="1.5">STAYS</text>
                </svg>
                <span className="host-badge">
                  <svg viewBox="0 0 32 32" width="14" height="14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 17l7 7 13-15" /></svg>
                </span>
              </div>
              <h3>Palmcrest Stays</h3>
              <span className="host-role">Host</span>
            </div>
            <dl className="host-stats">
              <div><dt>Reviews</dt><dd>1,204</dd></div>
              <div><dt>Rating</dt><dd>4.68<StarIcon size={12} /></dd></div>
              <div><dt>Years hosting</dt><dd>2</dd></div>
            </dl>
          </div>
          <ul className="host-facts">
            <li><BalloonIcon size={22} /><span>Born in the 90s</span></li>
            <li><GradCapIcon size={22} /><span>Where I went to school: University of Kerala</span></li>
          </ul>
        </div>

        <div className="host-right">
          <h3>Co-Hosts</h3>
          <ul className="cohosts">
            {CO_HOSTS.map((c) => (
              <li key={c.name}><CoHostAvatar {...c} /><span>{c.name}</span></li>
            ))}
          </ul>

          <h3 className="host-details-h">Host details</h3>
          <p>Response rate: 100%</p>
          <p>Responds within an hour</p>
          <button type="button" className="msg-host">Message host</button>

          <p className="host-protect">
            <ShieldIcon size={22} />
            <span>To help protect your payment, always use Stayora to send money and communicate with hosts.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function MoreStays() {
  const ref = useRef(null);
  const [page, setPage] = useState(0);
  const pages = 2;
  const move = (d) => {
    const n = Math.min(pages - 1, Math.max(0, page + d));
    setPage(n);
    const el = ref.current;
    // page 1 = start of the row, page 2 = end of the row (the last 5 stays)
    el?.scrollTo({ left: n * (el.scrollWidth - el.clientWidth), behavior: "smooth" });
  };
  return (
    <section className="sec" aria-labelledby="more-h">
      <div className="row-between">
        <h2 id="more-h">More stays nearby</h2>
        <div className="pager">
          <span>{page + 1} / {pages}</span>
          <button onClick={() => move(-1)} disabled={page === 0} aria-label="Previous stays"><ChevronIcon dir="left" size={12} /></button>
          <button onClick={() => move(1)} disabled={page === pages - 1} aria-label="Next stays"><ChevronIcon size={12} /></button>
        </div>
      </div>
      <ul className="stays" ref={ref}>
        {NEARBY.map((st, i) => (
          <li key={st.id}>
            <a href="#top" onClick={(e) => e.preventDefault()}>
              <div className="stay-img">
                {st.image ? <img src={st.image} alt={st.title} loading="lazy" /> : <div className={`ph ph-${i % 4}`} role="img" aria-label={st.title} />}
              </div>
              <b>{st.title}</b>
              <span className="stay-meta">{formatPrice(st.price)}<span className="stay-rate"><StarIcon size={11} /> {st.rating}</span></span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ThingsToKnow() {
  const checkInDay = DEFAULT_STAY.checkIn.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  const cols = [
    [CalendarXIcon, "Cancellation policy", [`Free cancellation before ${CANCEL_BEFORE}. Cancel before check-in on ${checkInDay} for a partial refund.`, "Review this host\u2019s full policy for details."]],
    [KeyMagIcon, "House rules", ["Check-in after 2:00 pm", "Checkout before 11:00 am", `${BOOKING.maxGuests} guests maximum`]],
    [ShieldIcon, "Safety & property", ["Carbon monoxide alarm not reported", "Smoke alarm not reported", "Exterior security cameras on property"]],
  ];
  return (
    <section className="sec" aria-labelledby="ttk-h">
      <h2 id="ttk-h">Things to know</h2>
      <div className="ttk">
        {cols.map(([Icon, h, ls]) => (
          <div key={h}>
            <Icon size={24} />
            <h3>{h}</h3>
            {ls.map((l) => <p key={l}>{l}</p>)}
            <button className="link">Learn more</button>
          </div>
        ))}
      </div>
    </section>
  );
}
