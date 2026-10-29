// Amenities data. Add / remove amenities here only.
// The modal groups them by category; the page shows only the FEATURED list.
export const AMENITY_CATEGORIES = [
  {
    title: "Bathroom",
    items: [
      { icon: "💨", label: "Hairdryer" },
      { icon: "🚿", label: "Hot water" },
      { icon: "🧴", label: "Shampoo" },
      { icon: "🧼", label: "Shower gel" },
    ],
  },
  {
    title: "Bedroom and laundry",
    items: [
      { icon: "🛏️", label: "Bed linen" },
      { icon: "👶", label: "Cot" },
      { icon: "👕", label: "Clothes storage" },
      { icon: "🧷", label: "Hangers" },
      { icon: "♨️", label: "Iron" },
      { icon: "🌑", label: "Room-darkening blinds" },
    ],
  },
  {
    title: "Entertainment",
    items: [{ icon: "📺", label: "TV" }],
  },
  {
    title: "Heating and cooling",
    items: [
      { icon: "❄️", label: "Air conditioning" },
      { icon: "🌀", label: "Ceiling fan" },
    ],
  },
  {
    title: "Internet and office",
    items: [
      { icon: "📶", label: "Wifi" },
      { icon: "💻", label: "Dedicated workspace" },
    ],
  },
  {
    title: "Kitchen and dining",
    items: [
      { icon: "🍳", label: "Kitchen" },
      { icon: "🧊", label: "Fridge" },
      { icon: "❄️", label: "Freezer" },
      { icon: "🔥", label: "Cooker" },
      { icon: "📡", label: "Microwave" },
      { icon: "🫖", label: "Kettle" },
      { icon: "🍞", label: "Toaster" },
      { icon: "🥤", label: "Blender" },
      { icon: "🧂", label: "Cooking basics" },
      { icon: "🍽️", label: "Crockery and cutlery" },
      { icon: "🍷", label: "Wine glasses" },
      { icon: "☕", label: "Coffee" },
    ],
  },
  {
    title: "Parking and facilities",
    items: [
      { icon: "🚗", label: "Free parking" },
      { icon: "🏊", label: "Pool" },
      { icon: "🛁", label: "Private jacuzzi" },
      { icon: "🏋️", label: "Gym" },
      { icon: "🚴", label: "Exercise equipment" },
      { icon: "🚪", label: "Private entrance" },
    ],
  },
  {
    title: "Services",
    items: [
      { icon: "🧹", label: "Cleaning available during stay" },
      { icon: "🧽", label: "Cleaning products" },
      { icon: "📅", label: "Long-term stays allowed" },
    ],
  },
];

// The 10 shown on the page (order matters). `off` = listed as not available, rendered struck through.
export const FEATURED = [
  { icon: "kitchen", label: "Kitchen" },
  { icon: "wifi", label: "Wifi" },
  { icon: "workspace", label: "Dedicated workspace" },
  { icon: "parking", label: "Free parking on premises" },
  { icon: "pool", label: "Pool" },
  { icon: "hottub", label: "Hot tub" },
  { icon: "paw", label: "Pets allowed" },
  { icon: "camera", label: "Exterior security cameras on property" },
  { icon: "alarm", label: "Carbon monoxide alarm", off: true },
  { icon: "alarm", label: "Smoke alarm", off: true },
];

// Count the real listing shows on its "Show all" button (the modal lists the subset we have data for).
export const TOTAL_AMENITIES = 50;
