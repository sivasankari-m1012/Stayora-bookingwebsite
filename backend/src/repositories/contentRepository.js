// Read-only queries for the listing content. Repositories hold ALL the SQL; nothing above them writes SQL.
export function createContentRepository(db) {
  const q = {
    listing: db.prepare("SELECT data FROM listing WHERE id = 1"),
    rooms: db.prepare("SELECT * FROM rooms ORDER BY sort"),
    photos: db.prepare("SELECT * FROM photos ORDER BY position"),
    amenities: db.prepare("SELECT * FROM amenities ORDER BY sort"),
    reviewStats: db.prepare("SELECT data FROM review_stats WHERE id = 1"),
    reviewCount: db.prepare("SELECT COUNT(*) AS n FROM reviews WHERE text LIKE ? ESCAPE '\\'"),
    reviewPage: db.prepare("SELECT * FROM reviews WHERE text LIKE ? ESCAPE '\\' ORDER BY sort LIMIT ? OFFSET ?"),
    nearby: db.prepare("SELECT id, title, price, rating, image FROM nearby ORDER BY id"),
  };
  return {
    listing: () => JSON.parse(q.listing.get().data),
    rooms: () => q.rooms.all(),
    photos: () => q.photos.all(),
    amenities: () => q.amenities.all(),
    reviewStats: () => JSON.parse(q.reviewStats.get().data),
    reviewCount: (like) => q.reviewCount.get(like).n,
    reviewPage: (like, limit, offset) => q.reviewPage.all(like, limit, offset),
    nearby: () => q.nearby.all(),
    hasListing: () => Boolean(q.listing.get()),
  };
}
