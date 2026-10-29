// "More stays nearby" cards (8 stays, 5 visible at a time).
// Photos are in public/nearby/1.jpg ... 8.jpg
const img = (i) => `/nearby/${i}.jpg`;

export const NEARBY = [
  { id: 1, title: "Cliff-edge studio with a sunrise view", price: 23600, rating: "4.91", image: img(1) },
  { id: 2, title: "Coconut Grove 1BHK with private pool", price: 42218, rating: "4.95", image: img(2) },
  { id: 3, title: "Palm Court luxury flat with plunge pool, Odayam", price: 44506, rating: "4.94", image: img(3) },
  { id: 4, title: "The Monsoon Studio | 5 mins to Papanasam Beach", price: 22824, rating: "4.96", image: img(4) },
  { id: 5, title: "Casa Marina 1BHK with plunge pool, Varkala", price: 39942, rating: "4.95", image: img(5) },
  { id: 6, title: "Tide & Timber | Jacuzzi | Terrace | Pool", price: 45648, rating: "5.0", image: img(6) },
  { id: 7, title: "Luxury apartment | Private pool | 6 mins from the cliff", price: 48786, rating: "4.93", image: img(7) },
  { id: 8, title: "Kallu Cottage - calm stay near Edava backwaters", price: 22824, rating: "4.92", image: img(8) },
];
