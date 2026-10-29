// Small house icon shown next to "Anywhere" in the search bar.
// Drawn as inline SVG (roof, walls, door, window, plant), so no external image or asset is needed.
function HomeIcon({ size = 32 }) {
  return (
    <svg
      className="home-icon"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ground shadow */}
      <ellipse cx="24" cy="43" rx="17" ry="2.2" fill="#000" opacity="0.08" />

      {/* front wall */}
      <rect x="7" y="22" width="27" height="20" fill="#f4f4f4" />

      {/* side wall */}
      <polygon points="34,17 42,14 42,42 34,42" fill="#d2d2d2" />

      {/* slanted roof */}
      <polygon points="4,24 36,11 43,13 42,15 36,17 4,30" fill="#4b4b4b" />

      {/* door */}
      <rect x="12" y="29" width="8" height="13" rx="0.8" fill="#0e7c86" />
      <circle cx="18.2" cy="35.5" r="0.7" fill="#fff" />

      {/* round window */}
      <circle cx="28" cy="29" r="2.6" fill="#fff" stroke="#9a9a9a" strokeWidth="1" />

      {/* plant */}
      <circle cx="41" cy="10" r="3.4" fill="#63b94a" />
      <circle cx="44" cy="14" r="2.8" fill="#7fce5e" />
      <circle cx="39" cy="14" r="2.4" fill="#4fa63a" />
    </svg>
  );
}

export default HomeIcon;