import { useCallback, useEffect, useRef, useState } from "react";
import HomeIcon from "./HomeIcon";
import Logo from "./Logo";
import "../navbar.css";

const DESTINATIONS = [
  ["Nearby", "Find stays close to you"],
  ["Varkala, Kerala", "Cliffs, beaches and cafes"],
  ["Kovalam, Kerala", "Popular with travellers near you"],
  ["Mumbai, Maharashtra", "For its stunning architecture"],
  ["Jaipur, Rajasthan", "For sights like Hawa Mahal"],
  ["Kochi, Kerala", "Backwaters and heritage"],
];
const MENU = [
  { label: "Help Center" },
  { label: "Become a host", sub: "It's easy to start hosting and earn extra income." },
  { divider: true },
  { label: "Gift cards" },
  { label: "Log in or sign up", strong: true },
];
const LANGS = ["English (IN)", "Tamil", "हिन्दी", "English (US)"];
const GUEST_ROWS = [
  ["adults", "Adults", "Ages 13 or above"],
  ["children", "Children", "Ages 2 – 12"],
  ["infants", "Infants", "Under 2"],
  ["pets", "Pets", "Bringing a service animal?"],
];

const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

function Navbar() {
  const [open, setOpen] = useState(null); // null | where | when | who | menu | lang
  const [where, setWhere] = useState("");
  const [dates, setDates] = useState({ in: "", out: "" });
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });
  const [lang, setLang] = useState(LANGS[0]);
  const wrapRef = useRef(null);

  const isSearch = open === "where" || open === "when" || open === "who";
  const total = guests.adults + guests.children;

  // Close the open popover; optionally hand focus back to the button that opened it
  const close = useCallback((restoreFocus) => {
    const opener = wrapRef.current?.querySelector('button[aria-expanded="true"]');
    setOpen(null);
    if (restoreFocus) opener?.focus();
  }, []);

  const toggle = (name) => setOpen((cur) => (cur === name ? null : name));

  // Outside click + Esc close whatever is open
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(null); };
    const onKey = (e) => { if (e.key === "Escape") close(true); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  // Move focus into a freshly opened menu / language popover
  useEffect(() => {
    if (open === "menu" || open === "lang") wrapRef.current?.querySelector(`[data-pop="${open}"] [role]`)?.focus();
  }, [open]);

  // Arrow-key navigation inside menus
  const onMenuKey = (e) => {
    const items = [...e.currentTarget.querySelectorAll("[role^='menuitem']")];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
    if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
    if (e.key === "Tab") setOpen(null);
  };

  const step = (key, d) => setGuests((g) => {
    const next = { ...g, [key]: Math.max(0, g[key] + d) };
    if (d > 0 && key !== "adults" && next.adults === 0) next.adults = 1; // a child/infant/pet needs an adult
    return next;
  });

  const submit = () => close(false);
  const secProps = (name) => ({ "aria-haspopup": "dialog", "aria-expanded": open === name, onClick: () => toggle(name) });

  return (
    <nav className="navbar" aria-label="Main" ref={wrapRef}>
      <a className="logo" href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <Logo />
      </a>

      <div className={`search-wrap ${isSearch ? "is-open" : ""}`}>
        <div className={`search-bar ${isSearch ? "active" : ""}`} role="group" aria-label="Search stays">
          <button type="button" className={`search-section home-section ${open === "where" ? "on" : ""}`} {...secProps("where")}>
            <HomeIcon />
            <span className="search-title">{where || "Anywhere"}</span>
          </button>
          <span className="search-divider" aria-hidden="true" />
          <button type="button" className={`search-section ${open === "when" ? "on" : ""}`} {...secProps("when")}>
            <span className="search-title">{dates.in && dates.out ? `${fmt(dates.in)} – ${fmt(dates.out)}` : "Anytime"}</span>
          </button>
          <span className="search-divider" aria-hidden="true" />
          <button type="button" className={`search-section guest-section ${open === "who" ? "on" : ""}`} {...secProps("who")}>
            <span className={`search-title ${total ? "" : "guest-text"}`}>{total ? plural(total, "guest") : "Add guests"}</span>
          </button>
          <button type="button" className="search-button" aria-label="Search" onClick={submit}>
            <svg
viewBox="0 0 24 24"
width="18"
height="18"
fill="none"
xmlns="http://www.w3.org/2000/svg"
>
<circle
cx="10.8"
cy="10.8"
r="6.8"
stroke="white"
strokeWidth="2"
/>
<path
d="M16 16L21 21"
stroke="white"
strokeWidth="2"
strokeLinecap="round"
/>
</svg>
            {isSearch && <span className="search-label">Search</span>}
          </button>
        </div>

        {open === "where" && (
          <div className="nav-panel panel-where" role="dialog" aria-label="Choose destination">
            <h3>Suggested destinations</h3>
            <ul>
              {DESTINATIONS.map(([name, sub]) => (
                <li key={name}>
                  <button type="button" onClick={() => { setWhere(name === "Nearby" ? "Nearby" : name.split(",")[0]); setOpen("when"); }}>
                    <span className="dest-ico" aria-hidden="true">📍</span>
                    <span><b>{name}</b><small>{sub}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {open === "when" && (
          <div className="nav-panel panel-when" role="dialog" aria-label="Choose dates">
            <label>Check in
              <input type="date" value={dates.in} onChange={(e) => setDates((d) => ({ in: e.target.value, out: d.out && d.out <= e.target.value ? "" : d.out }))} />
            </label>
            <label>Check out
              <input type="date" value={dates.out} min={dates.in || undefined} onChange={(e) => setDates((d) => ({ ...d, out: e.target.value }))} />
            </label>
            <div className="panel-actions">
              <button type="button" className="link" onClick={() => setDates({ in: "", out: "" })}>Clear dates</button>
              <button type="button" className="solid" onClick={() => setOpen("who")}>Next</button>
            </div>
          </div>
        )}

        {open === "who" && (
          <div className="nav-panel panel-who" role="dialog" aria-label="Choose guests">
            {GUEST_ROWS.map(([key, title, sub]) => (
              <div className="gp-row" key={key}>
                <div><strong>{title}</strong><p>{sub}</p></div>
                <div className="gp-stepper">
                  <button type="button" onClick={() => step(key, -1)} disabled={guests[key] <= 0 || (key === "adults" && guests.adults <= 1 && (guests.children || guests.infants || guests.pets) > 0)} aria-label={`Decrease ${title}`}>−</button>
                  <span aria-live="polite">{guests[key]}</span>
                  <button type="button" onClick={() => step(key, 1)} disabled={guests[key] >= 16} aria-label={`Increase ${title}`}>+</button>
                </div>
              </div>
            ))}
            <div className="panel-actions">
              <button type="button" className="link" onClick={() => setGuests({ adults: 0, children: 0, infants: 0, pets: 0 })}>Clear</button>
              <button type="button" className="solid" onClick={submit}>Search</button>
            </div>
          </div>
        )}
      </div>

      <div className="navbar-right">
        <button type="button" className="host-button">Become a host</button>

        <div className="nav-pop-anchor">
          <button type="button" className="icon-button" aria-label="Language and region" aria-haspopup="menu" aria-expanded={open === "lang"} onClick={() => toggle("lang")}>
            <svg
viewBox="0 0 24 24"
width="19"
height="19"
fill="none"
xmlns="http://www.w3.org/2000/svg"
>
<circle
cx="12"
cy="12"
r="8.5"
stroke="#222222"
strokeWidth="1.6"
/>
<path
d="M3.5 12H20.5"
stroke="#222222"
strokeWidth="1.6"
/>
<path
d="M12 3.5C14.2 5.8 15.2 8.7 15.2 12C15.2 15.3 14.2 18.2 12 20.5"
stroke="#222222"
strokeWidth="1.6"
/>
<path
d="M12 3.5C9.8 5.8 8.8 8.7 8.8 12C8.8 15.3 9.8 18.2 12 20.5"
stroke="#222222"
strokeWidth="1.6"
/>
</svg>
          </button>
          {open === "lang" && (
            <div className="nav-menu lang-menu" data-pop="lang" role="menu" aria-label="Language and region" onKeyDown={onMenuKey}>
              <p className="menu-head">Language and region</p>
              {LANGS.map((l) => (
                <button key={l} type="button" role="menuitemradio" aria-checked={lang === l} className={lang === l ? "sel" : ""} onClick={() => { setLang(l); close(true); }}>{l}</button>
              ))}
            </div>
          )}
        </div>

        <div className="nav-pop-anchor">
          <button type="button" className="menu-button" aria-label="Menu" aria-haspopup="menu" aria-expanded={open === "menu"} onClick={() => toggle("menu")}>
            <svg
viewBox="0 0 24 24"
width="20"
height="20"
fill="none"
xmlns="http://www.w3.org/2000/svg"
>
<path
d="M4 7H20"
stroke="#222222"
strokeWidth="1.8"
strokeLinecap="round"
/>
<path
d="M4 12H20"
stroke="#222222"
strokeWidth="1.8"
strokeLinecap="round"
/>
<path
d="M4 17H20"
stroke="#222222"
strokeWidth="1.8"
strokeLinecap="round"
/>
</svg>
          </button>
          {open === "menu" && (
            <div className="nav-menu" data-pop="menu" role="menu" aria-label="Menu" onKeyDown={onMenuKey}>
              {MENU.map((m, i) => m.divider
                ? <hr key={i} role="separator" />
                : <button key={m.label} type="button" role="menuitem" className={m.strong ? "strong" : ""} onClick={() => close(true)}>
                    {m.label}{m.sub && <small>{m.sub}</small>}
                  </button>)}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
