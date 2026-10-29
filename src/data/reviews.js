// Review data. Names/dates for reviews 3-4 are placeholders: replace them with the real ones.
export const TOTAL_REVIEWS = 19;
export const RATING = 4.95;

// How many reviews gave each star rating (5 -> 1)
export const DISTRIBUTION = { 5: 18, 4: 1, 3: 0, 2: 0, 1: 0 };

// [label, score, icon key]
export const CATEGORIES = [
  ["Cleanliness", 5.0, "clean"], ["Accuracy", 5.0, "accuracy"], ["Check-in", 5.0, "key"],
  ["Communication", 5.0, "chat"], ["Location", 4.8, "map"], ["Value", 4.8, "tag"],
];

// Topic chips under the breakdown: [emoji, label, mentions]
export const TOPICS = [
  ["\u{1F6CF}\uFE0F", "Comfort", 6], ["\u2705", "Accuracy", 5], ["\u{1F6C1}", "Hot tub", 5],
  ["\u{1F3F7}\uFE0F", "Condition", 4], ["\u{1F381}", "Hospitality", 8], ["\u{1F9F4}", "Cleanliness", 4],
  ["\u{1F9FA}", "Amenities", 2], ["\u{1F5BC}\uFE0F", "Decor", 2], ["\u{1F6CB}\uFE0F", "Indoor spaces", 2],
  ["\u{1F4CD}", "Location", 2],
];

// Newest first. `tenure` = reviewer's time on Stayora, `ago` = when they reviewed.
// `avatar`: optional photo URL (letter circle in `tone` is used when null).
// Demo reviews: invented names and text for this sample listing.
export const REVIEWS = [
  { id: 1, name: "Karthik", tone: "warm", avatar: null, tenure: "2 months on Stayora", ago: "1 week ago", text: "Quiet, tidy and the team replied within minutes every time. The terrace at sunset was the best part of the trip." },
  { id: 2, name: "Meera", tone: "sage", avatar: null, tenure: "3 years on Stayora", ago: "2 weeks ago", text: "Everything matched the photos. The flat was spotless, the bed was comfortable and check-in was painless. We would happily book it again for a longer stay." },
  { id: 3, name: "Nikhil", tone: "rose", avatar: null, tenure: "8 months on Stayora", ago: "May 2026", text: "Helpful hosts, easy directions to the cliff path." },
  { id: 4, name: "Divya", tone: "lilac", avatar: null, tenure: "4 years on Stayora", ago: "May 2026", text: "A relaxing few days in Varkala. The apartment felt fresh and well looked after, and the hot tub on the terrace was the highlight. Cafes and the beach are a short walk away, so we barely needed a taxi." },
  { id: 5, name: "Rohan S", tone: "sky", avatar: null, tenure: "3 years on Stayora", ago: "May 2026", text: "Smooth booking, friendly staff and a lovely view. Will be back and have already told friends about it." },
  { id: 6, name: "Fatima", tone: "warm", avatar: null, tenure: "5 years on Stayora", ago: "May 2026", text: "Lovely place, exactly as described." },
];
