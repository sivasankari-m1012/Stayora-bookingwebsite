// Loads the listing content into SQLite from the frontend's own data files, so there is ONE source of truth.
// Re-runnable: wipes and reloads the content tables, never touches bookings.   Run: npm run seed
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config/index.js";
import { openDatabase, withTransaction } from "../db/connection.js";
import { runMigrations } from "../db/migrate.js";
import { PHOTOS, ROOMS, HERO_IDS } from "../../../src/data/photos.js";
import { AMENITY_CATEGORIES, FEATURED, TOTAL_AMENITIES } from "../../../src/data/amenities.js";
import { REVIEWS, RATING, TOTAL_REVIEWS, DISTRIBUTION, CATEGORIES, TOPICS } from "../../../src/data/reviews.js";
import { NEARBY } from "../../../src/data/nearby.js";
import { BOOKING, CANCEL_BEFORE } from "../../../src/data/booking.js";
const LISTING = {
  title: "Sea Breeze Suite | Hot tub 1BHK in Varkala",
  propertyType: "Entire serviced apartment",
  location: { city: "Varkala", region: "Kerala", country: "India", note: "Exact location will be provided after booking." },
  capacity: { guests: BOOKING.maxGuests, bedrooms: 1, beds: 1, bathrooms: 1, maxInfants: BOOKING.maxInfants, maxPets: BOOKING.maxPets },
  pricing: { currency: "INR", nightlyRate: BOOKING.nightlyRate },
  host: {
    name: "Palmcrest Stays",
    hostingSince: "2 years hosting",
    coHosts: ["Arjun", "Lakshmi Nair", "Joseph Mathew", "Anita", "Vishnu", "Reshma", "Gopika", "Sneha"],
  },
  highlights: [
    { icon: "pool", title: "Outdoor entertainment", text: "The pool and alfresco dining are great for summer trips." },
    { icon: "fan", title: "Designed for staying cool", text: "Beat the heat with the A/C and ceiling fan." },
    { icon: "door", title: "Self check-in", text: "You can check in with the building staff." },
  ],
  about:
    "Unwind at Sea Breeze Suite by Palmcrest Stays! This bright 1BHK sits a short walk from the Varkala cliff, with a private hot tub on the terrace for slow evenings. Enjoy fast WiFi, a Smart TV, pet-friendly comfort and calm, airy interiors. Beaches, cafes and seafood shacks are all minutes away, making it a great pick for couples who want rest, sea air and a little luxury on the Kerala coast.",
  sleeping: [
    { title: "Bedroom", beds: "1 double bed", image: "/sleep/bedroom.jpg" },
    { title: "Living room", beds: "1 sofa", image: "/sleep/living-room.jpg" },
  ],
  neighbourhood:
    "Set a short walk from the Varkala cliff, Sea Breeze Suite offers a peaceful stay with easy access to beaches, cafes, and popular attractions.",
  rules: {
    checkIn: "After 2:00 pm",
    checkOut: "Before 11:00 am",
    maxGuests: BOOKING.maxGuests,
    cancellation: { freeBefore: CANCEL_BEFORE, summary: `Free cancellation before ${CANCEL_BEFORE}. Cancel before check-in on 20 November for a partial refund.` },
    safety: ["Carbon monoxide alarm not reported", "Smoke alarm not reported", "Exterior security cameras on property"],
  },
  totalAmenities: TOTAL_AMENITIES,
};

export function seed(db) {
  withTransaction(db, () => {
    for (const t of ["listing", "photos", "rooms", "amenities", "reviews", "review_stats", "nearby"]) db.exec(`DELETE FROM ${t}`);

    db.prepare("INSERT INTO listing (id, data) VALUES (1, ?)").run(JSON.stringify(LISTING));

    const insRoom = db.prepare("INSERT INTO rooms (id, title, description, sort) VALUES (?,?,?,?)");
    ROOMS.forEach((r, i) => insRoom.run(r.id, r.title, r.description, i));

    const insPhoto = db.prepare(
      "INSERT INTO photos (id, room_id, url, position, room_index, is_hero, hero_order) VALUES (?,?,?,?,?,?,?)"
    );
    for (const p of PHOTOS) {
      const h = HERO_IDS.indexOf(p.id);
      insPhoto.run(p.id, p.roomId, p.image, p.order, p.roomIndex, h >= 0 ? 1 : 0, h >= 0 ? h : null);
    }

    const insAm = db.prepare("INSERT INTO amenities (category, icon, label, featured, off, sort) VALUES (?,?,?,?,?,?)");
    let n = 0;
    for (const c of AMENITY_CATEGORIES) for (const it of c.items) insAm.run(c.title, it.icon, it.label, 0, 0, n++);
    FEATURED.forEach((f, i) => insAm.run("Featured", f.icon, f.label, 1, f.off ? 1 : 0, i));

    const insRev = db.prepare("INSERT INTO reviews (id, name, tone, avatar, tenure, ago, text, sort) VALUES (?,?,?,?,?,?,?,?)");
    REVIEWS.forEach((r, i) => insRev.run(r.id, r.name, r.tone, r.avatar, r.tenure, r.ago, r.text, i));
    db.prepare("INSERT INTO review_stats (id, data) VALUES (1, ?)").run(
      JSON.stringify({
        rating: RATING,
        total: TOTAL_REVIEWS,
        distribution: DISTRIBUTION,
        categories: CATEGORIES.map(([label, score, icon]) => ({ label, score, icon })),
        topics: TOPICS.map(([emoji, label, mentions]) => ({ emoji, label, mentions })),
      })
    );

    const insNb = db.prepare("INSERT INTO nearby (id, title, price, rating, image) VALUES (?,?,?,?,?)");
    for (const s of NEARBY) insNb.run(s.id, s.title, s.price, s.rating, s.image);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDatabase(loadConfig().dbPath);
  runMigrations(db);
  seed(db);
  const count = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
  console.log(`Seeded: ${count("rooms")} rooms, ${count("photos")} photos, ${count("amenities")} amenities, ${count("reviews")} reviews, ${count("nearby")} nearby stays`);
}
