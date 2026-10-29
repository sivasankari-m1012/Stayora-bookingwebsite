import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, DISTRIBUTION, RATING, REVIEWS, TOPICS, TOTAL_REVIEWS } from "../data/reviews";
import { ChatIcon, CheckCircleIcon, ChevronIcon, KeyMagIcon, LaurelIcon, MapIcon, PriceTagIcon, SprayIcon, StarIcon } from "./Icons";
import "../reviews.css";
import useModalParams from "../hooks/useModalParams";
import useDialog from "../hooks/useDialog";

const CAT_ICONS = { clean: SprayIcon, accuracy: CheckCircleIcon, key: KeyMagIcon, chat: ChatIcon, map: MapIcon, tag: PriceTagIcon };

function Card({ r, clamp }) {
  const [open, setOpen] = useState(false);
  const long = r.text.length > 140;
  return (
    <li className="rv-card">
      <div className="rv-head">
        {r.avatar
          ? <img className="avatar sm" src={r.avatar} alt="" />
          : <span className={`avatar sm av-${r.tone || "warm"}`} aria-hidden="true">{r.name[0]}</span>}
        <div><b>{r.name}</b><small>{r.tenure}</small></div>
      </div>
      <div className="rv-meta">
        <span className="rv-stars" role="img" aria-label="Rated 5 out of 5">
          {Array.from({ length: 5 }, (_, i) => <StarIcon key={i} size={10} />)}
        </span>
        <i aria-hidden="true">·</i>{r.ago}
      </div>
      <p className={clamp && !open ? "clamp" : ""}>{r.text}</p>
      {clamp && long && (
        <button className="link" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </li>
  );
}

// Topic chips: scroll sideways (trackpad, touch, shift+wheel) or use the edge arrows.
function TopicChips() {
  const row = useRef(null);
  const [edge, setEdge] = useState({ left: false, right: true });

  const sync = () => {
    const el = row.current;
    if (el) setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };
  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const nudge = (dir) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.7, behavior: "smooth" });

  return (
    <div className="topics">
      {edge.left && <button type="button" className="topics-arrow left" aria-label="Scroll topics left" onClick={() => nudge(-1)}><ChevronIcon dir="left" size={12} /></button>}
      <ul ref={row} onScroll={sync} aria-label="Topics guests mention">
        {TOPICS.map(([emoji, label, n]) => (
          <li key={label}><span aria-hidden="true">{emoji}</span><b>{label}</b><em>{n}</em></li>
        ))}
      </ul>
      {edge.right && <button type="button" className="topics-arrow right" aria-label="Scroll topics right" onClick={() => nudge(1)}><ChevronIcon size={12} /></button>}
    </div>
  );
}

function ReviewsModal({ onClose }) {
  const dialogRef = useRef(null);
  useDialog(dialogRef, { initialFocus: ".rv-search" });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const f = REVIEWS.filter((r) => !t || (r.text + r.name).toLowerCase().includes(t));
    return sort === "recent" ? f : [...f].reverse();
  }, [q, sort]);

  return (
    <div className="am-backdrop" onClick={onClose}>
      <div className="am-dialog rv-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Reviews" onClick={(e) => e.stopPropagation()}>
        <header className="am-header"><button className="am-close" onClick={onClose} aria-label="Close">✕</button></header>
        <div className="rv-modal">
          <aside>
            <h2 className="big">{RATING}</h2>
            <h3>Guest favourite</h3>
            <ul className="rv-cats">{CATEGORIES.map(([k, v]) => <li key={k}><span>{k}</span><b>{v.toFixed(1)}</b></li>)}</ul>
          </aside>
          <div>
            <div className="rv-top">
              <h3>{TOTAL_REVIEWS} reviews</h3>
              <select aria-label="Sort reviews" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recent">Most recent</option><option value="oldest">Oldest</option>
              </select>
            </div>
            <input className="rv-search" type="search" placeholder="Search reviews" aria-label="Search reviews" value={q} onChange={(e) => setQ(e.target.value)} />
            {list.length ? <ul className="rv-list">{list.map((r) => <Card key={r.id} r={r} />)}</ul> : <p className="muted">No reviews match "{q}".</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const [{ modal }, navigate] = useModalParams();
  return (
    <section className="sec" id="reviews" aria-labelledby="rev-h">
      <div className="rating-hero">
        <div className="rh-score">
          <LaurelIcon size={96} />
          <h2 id="rev-h">{RATING}</h2>
          <LaurelIcon size={96} flip />
        </div>
        <h3>Guest favourite</h3>
        <p>This home is a guest favourite based on ratings, reviews and reliability</p>
        <a href="#reviews" onClick={(e) => e.preventDefault()}>How reviews work</a>
      </div>

      <div className="rb">
        <div className="rb-col rb-overall">
          <h4>Overall rating</h4>
          <ol>
            {[5, 4, 3, 2, 1].map((n) => (
              <li key={n}>
                <span>{n}</span>
                <i role="img" aria-label={`${DISTRIBUTION[n]} of ${TOTAL_REVIEWS} reviews`}>
                  <b style={{ width: `${(DISTRIBUTION[n] / TOTAL_REVIEWS) * 100}%` }} />
                </i>
              </li>
            ))}
          </ol>
        </div>
        {CATEGORIES.map(([label, score, icon]) => {
          const Icon = CAT_ICONS[icon];
          return (
            <div className="rb-col" key={label}>
              <h4>{label}</h4>
              <strong>{score.toFixed(1)}</strong>
              <Icon size={32} />
            </div>
          );
        })}
      </div>

      <TopicChips />

      <ul className="rv-grid">{REVIEWS.map((r) => <Card key={r.id} r={r} clamp />)}</ul>
      <button className="btn-outline" onClick={() => navigate("modal=REVIEWS")}>Show all {TOTAL_REVIEWS} reviews</button>
      {modal === "REVIEWS" && <ReviewsModal onClose={() => navigate("")} />}
    </section>
  );
}
