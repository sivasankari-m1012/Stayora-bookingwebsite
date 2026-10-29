// SINGLE SOURCE OF TRUTH for every photo on the page.
// One object per photo: image + title + description + category + order travel together.
// The hero grid, photo tour, viewer, filmstrip and the "Where you'll sleep" covers all read from PHOTOS,
// so a photo can never be shown with another photo's metadata. Add / remove / reorder photos ONLY in GROUPS.
// Images are local files in public/photos/<id>.jpg (illustrated demo set from tools/make_photos.py).
// To use real photos, drop JPGs with the same ids into public/photos/.
const BASE_URL = "/photos/";

// PASTE YOUR OWN IMAGE LINKS HERE (right-click a photo in Chrome -> "Copy image address").
// Format:  "photo-id": "https://...jpg",   Any id not listed here uses the local file public/photos/<id>.jpg
// Only use photos you are allowed to use (Pexels, Unsplash, Pixabay or your own).
const URLS = {
  // "living-1": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
  // "terrace-1": "https://...",
};

// Authoring list: room (category) title + its description + photo ids, in display order.
const GROUPS = [
  {
    title: "Living room",
    description: "Sofa · Air conditioning · Ceiling fan · Smart TV",
    ids: ["living-1", "living-2", "living-3"],
  },
  {
    title: "Terrace and hot tub",
    description: "Private hot tub · Ceiling fan · Sea-facing deck",
    ids: ["terrace-1", "terrace-2", "terrace-3", "terrace-4", "terrace-5", "terrace-6", "terrace-7", "terrace-8"],
  },
  {
    title: "Full kitchen",
    description: "Fridge · Microwave · Cooking basics · Kettle",
    ids: ["kitchen-1", "kitchen-2"],
  },
  {
    title: "Bedroom",
    description:
      "Double bed · Air conditioning · Bed linen · Ceiling fan · Clothes storage · Cot · Hangers · Iron · Room-darkening blinds · Cleaning available during stay · Cleaning products · Long-term stays allowed · Private entrance · Wifi",
    ids: ["bedroom-1", "bedroom-2", "bedroom-3", "bedroom-4", "bedroom-5"],
  },
  {
    title: "Full bathroom",
    description: "Hairdryer · Hot water · Shampoo · Shower gel",
    ids: ["bathroom-1"],
  },
  {
    title: "Gym",
    description: "Air conditioning · Gym · Exercise equipment · Ceiling fan",
    ids: ["gym-1", "gym-2", "gym-3", "gym-4", "gym-5"],
  },
  {
    title: "Exterior",
    description: "",
    ids: ["exterior-1", "exterior-2", "exterior-3", "exterior-4", "exterior-5", "exterior-6"],
  },
  {
    title: "Pool",
    description: "Pool",
    ids: ["pool-1", "pool-2", "pool-3"],
  },
  {
    title: "Additional photos",
    description: "",
    ids: ["extra-1", "extra-2", "extra-3", "extra-4", "extra-5", "extra-6", "extra-7", "extra-8", "extra-9", "extra-10"],
  },
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Flat, ordered list. order is 1-based and is the photo's position everywhere (counter, URL index = order - 1).
export const PHOTOS = GROUPS.flatMap((g) =>
  g.ids.map((id, n) => ({
    id,
    image: URLS[id] ?? `${BASE_URL}${id}.jpg`,
    title: g.title,
    category: g.title,
    description: g.description,
    roomId: slug(g.title),
    roomIndex: n,
    roomCount: g.ids.length,
  }))
).map((p, i) => ({ ...p, order: i + 1 }));

// Local files: one size serves the grid, tour cards and full-size viewer (`width` kept so callers need no change).
// eslint-disable-next-line no-unused-vars
export const photoUrl = (photo, width = 720) => photo.image;
export const photoAlt = (p) => `${p.title}, photo ${p.roomIndex + 1} of ${p.roomCount}`;

// Photo-tour sections (category order = GROUPS order, photo order = PHOTOS order). Derived, not re-typed.
export const ROOMS = GROUPS.map((g) => {
  const id = slug(g.title);
  return { id, title: g.title, description: g.description, photos: PHOTOS.filter((p) => p.roomId === id) };
});

// Home-page 5-photo grid: only ids are listed; title/alt/description come from the photo object.
export const HERO_IDS = [
  "terrace-1", // main - hot tub terrace
  "living-1",  // Living room
  "terrace-2", // Terrace seating
  "bedroom-1", // Bedroom
  "exterior-1", // Building exterior
];
const BY_ID = new Map(PHOTOS.map((p) => [p.id, p]));
export const HERO_PHOTOS = HERO_IDS.map((id) => BY_ID.get(id));
