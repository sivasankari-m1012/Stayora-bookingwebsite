// Shapes DB rows into the JSON the frontend expects.
export function createContentService({ content }) {
  const listing = () => content.listing();

  function photos() {
    const rooms = content.rooms();
    const rows = content.photos();
    const byRoom = new Map(rooms.map((r) => [r.id, r]));
    const shape = (p) => {
      const room = byRoom.get(p.room_id);
      return { id: p.id, url: p.url, order: p.position, roomId: p.room_id, title: room.title, description: room.description, roomIndex: p.room_index };
    };
    const all = rows.map(shape);
    return {
      total: all.length,
      hero: rows.filter((p) => p.is_hero).sort((a, b) => a.hero_order - b.hero_order).map(shape),
      rooms: rooms.map((r) => {
        const inRoom = all.filter((p) => p.roomId === r.id);
        return { id: r.id, title: r.title, description: r.description, photos: inRoom.map((p) => ({ ...p, roomCount: inRoom.length })) };
      }),
    };
  }

  function amenities() {
    const rows = content.amenities();
    const categories = new Map();
    for (const r of rows.filter((x) => !x.featured)) {
      if (!categories.has(r.category)) categories.set(r.category, []);
      categories.get(r.category).push({ icon: r.icon, label: r.label });
    }
    return {
      total: listing().totalAmenities,
      featured: rows.filter((x) => x.featured).map((r) => ({ icon: r.icon, label: r.label, off: Boolean(r.off) })),
      categories: [...categories].map(([title, items]) => ({ title, items })),
    };
  }

  function reviews({ limit, offset, q }) {
    const like = `%${q.replace(/[\\%_]/g, "\\$&")}%`;                  // escape LIKE wildcards typed by the user
    return {
      stats: content.reviewStats(),
      items: content.reviewPage(like, limit, offset).map((r) => ({
        id: r.id, name: r.name, tone: r.tone, avatar: r.avatar, tenure: r.tenure, ago: r.ago, text: r.text,
      })),
      page: { limit, offset, total: content.reviewCount(like) },
    };
  }

  return { listing, photos, amenities, reviews, nearby: () => ({ items: content.nearby() }) };
}
