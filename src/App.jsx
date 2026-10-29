import { useState } from "react";
import Navbar from "./components/Navbar";
import ImageGallery from "./components/ImageGallery";
import PropertyInfo from "./components/PropertyInfo";
import BookingCard from "./components/BookingCard";
import Amenities from "./components/Amenities";
import ReviewsSection from "./components/ReviewsSection";
import StayCalendar from "./components/StayCalendar";
import { DEFAULT_STAY } from "./data/booking";
import { useAvailability } from "./hooks/useAvailability";
import Footer from "./components/Footer";
import PromoCard from "./components/PromoCard";
import { ShareIcon, HeartIcon, FlagIcon } from "./components/Icons";
import { SubNav, Location, Host, MoreStays, ThingsToKnow } from "./components/Sections";
import "./details.css";

const TITLE = "Sea Breeze Suite | Hot tub 1BHK in Varkala";

function App() {
  const [saved, setSaved] = useState(false);
  const [dates, setDates] = useState({ checkIn: DEFAULT_STAY.checkIn, checkOut: DEFAULT_STAY.checkOut });
  const [shared, setShared] = useState(false);
  const { blocked, refresh } = useAvailability();

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: TITLE, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <div id="top">
      <Navbar />
      <SubNav />

      <main>
        <section className="property-header">
          <div className="property-title">
            <h1>{TITLE}</h1>
          </div>

          <div className="header-actions">
            <button className="hdr-btn" onClick={share} aria-live="polite">
              <ShareIcon /> {shared ? "Link copied" : "Share"}
            </button>
            <button className="hdr-btn" aria-pressed={saved} onClick={() => setSaved((v) => !v)}>
              <HeartIcon filled={saved} /> {saved ? "Saved" : "Save"}
            </button>
          </div>
        </section>

        <div id="photos"><ImageGallery /></div>

        <section className="property-main">
          <div className="property-left">
            <PropertyInfo />
            <div id="amenities"><Amenities /></div>
            <StayCalendar dates={dates} setDates={setDates} blocked={blocked} />
          </div>
          <aside className="property-aside">
            <PromoCard />
            <BookingCard dates={dates} setDates={setDates} blocked={blocked} onBooked={refresh} />
            <p className="report"><FlagIcon size={16} /><a href="#top" onClick={(e) => e.preventDefault()}>Report this listing</a></p>
          </aside>
        </section>

        <ReviewsSection />
        <Location />
        <Host />
        <ThingsToKnow />
        <MoreStays />
      </main>

      <Footer />
    </div>
  );
}

export default App;
