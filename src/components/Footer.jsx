import { FacebookIcon, GlobeIcon, InstagramIcon, XIcon } from "./Icons";
import "../footer.css";

// Link labels live in data so the markup stays tiny and the content is easy to correct.
const COLUMNS = [
  ["Support", ["Help Centre", "StayCover", "Anti-discrimination", "Disability support", "Cancellation options", "Report neighbourhood concern"]],
  ["Hosting", ["List your home on Stayora", "StayCover for Hosts", "Hosting resources", "Community forum", "Hosting responsibly", "Join a free Hosting class", "Find a co-host near you"]],
  ["Stayora", ["Newsroom", "New features", "Careers", "Investors", "Gift cards", "Stayora emergency stays"]],
];
const LEGAL = ["Privacy", "Terms", "Sitemap", "Company details"];
const SOCIAL = [["Facebook", FacebookIcon], ["X", XIcon], ["Instagram", InstagramIcon]];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-cols">
          {COLUMNS.map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h2>{title}</h2>
              <ul>{links.map((l) => <li key={l}><a href="#top" onClick={(e) => e.preventDefault()}>{l}</a></li>)}</ul>
            </nav>
          ))}
        </div>

        <div className="footer-bar">
          <p className="legal">
            <span>© 2026 Stayora</span>
            {LEGAL.map((l) => (
              <span key={l}><i aria-hidden="true">·</i><a href="#top" onClick={(e) => e.preventDefault()}>{l}</a></span>
            ))}
          </p>
          <div className="footer-tools">
            <button type="button"><GlobeIcon size={16} /> English (IN)</button>
            <button type="button"><b aria-hidden="true">₹</b> INR</button>
            <ul className="social">
              {SOCIAL.map(([name, Icon]) => (
                <li key={name}><a href="#top" aria-label={name} onClick={(e) => e.preventDefault()}><Icon size={18} /></a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
