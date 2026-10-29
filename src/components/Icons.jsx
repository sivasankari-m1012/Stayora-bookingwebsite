// Small inline-SVG icon set (32x32 grid, 2px stroke) so nothing depends on emoji or text glyphs.
const Svg = ({ size = 16, fill = "none", children, ...rest }) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

export const ShareIcon = (p) => (
  <Svg {...p}><path d="M27 18v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9M16 3v23M7 12l9-9 9 9" /></Svg>
);
export const HeartIcon = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M16 28C7 22 2 16.5 2 11a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 5.5-5 11-14 17z" />
  </Svg>
);
export const DoorIcon = (p) => (
  <Svg {...p}><path d="M5 29V3h22v26M2 29h28M21 16h.01" /></Svg>
);
export const KeyIcon = (p) => (
  <Svg {...p}><circle cx="10" cy="22" r="6" /><path d="M14.5 17.5L28 4M22 10l4 4" /></Svg>
);
export const StarIcon = (p) => (
  <Svg {...p} fill="currentColor" strokeWidth="1">
    <path d="M16 2.5l4.2 9 9.8 1.2-7.2 6.8 1.9 9.7L16 24.2 7.3 29.2l1.9-9.7L2 12.7l9.8-1.2z" />
  </Svg>
);
export const GlobeIcon = (p) => (
  <Svg {...p}><circle cx="16" cy="16" r="13" /><path d="M3 16h26M16 3c4 4 5 9 5 13s-1 9-5 13c-4-4-5-9-5-13s1-9 5-13z" /></Svg>
);
export const ChevronIcon = ({ dir = "right", ...p }) => (
  <Svg {...p} style={{ transform: `rotate(${{ right: 0, left: 180, down: 90, up: 270 }[dir]}deg)` }}>
    <path d="M12 4l12 12-12 12" />
  </Svg>
);
export const FacebookIcon = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M18 30V18h4l1-5h-5v-3c0-1.5.5-2.5 2.5-2.5H23V3.5C22.5 3.4 21 3 19.5 3 16 3 13.5 5 13.5 9v4H10v5h3.5v12z" />
  </Svg>
);
export const XIcon = (p) => (
  <Svg {...p}><path d="M5 4l22 24M27 4L5 28" /></Svg>
);
export const InstagramIcon = (p) => (
  <Svg {...p}><rect x="4" y="4" width="24" height="24" rx="7" /><circle cx="16" cy="16" r="5.5" /><path d="M23.5 8.5h.01" /></Svg>
);

// Decorative laurel branch (left side); mirror it with `flip` for the right side.
export const LaurelIcon = ({ flip, size = 32 }) => (
  <svg viewBox="0 0 24 40" width={size * 0.6} height={size} fill="currentColor" stroke="currentColor" aria-hidden="true" focusable="false"
       style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M19 3C7 11 6 28 17 37" fill="none" strokeWidth="1.6" strokeLinecap="round" />
    {[[11.5, 9.5, -35], [8.3, 15, -15], [7.4, 21, 5], [8.6, 27, 25], [12.2, 32.5, 45]].map(([x, y, r]) => (
      <g key={y}>
        <ellipse cx={x - 2.2} cy={y} rx="3" ry="1.4" transform={`rotate(${r} ${x - 2.2} ${y})`} stroke="none" />
        <ellipse cx={x + 2.4} cy={y - 1.6} rx="3" ry="1.4" transform={`rotate(${r - 70} ${x + 2.4} ${y - 1.6})`} stroke="none" />
      </g>
    ))}
  </svg>
);
export const PoolIcon = (p) => (
  <Svg {...p}><path d="M10 20V6a3 3 0 0 1 6 0M22 20V6a3 3 0 0 0-6 0M10 11h12M10 16h12M2 25c3-3 5 3 7 0s5 3 7 0 5 3 7 0 4 2 7 0" /></Svg>
);
export const FanIcon = (p) => (
  <Svg {...p}>
    <circle cx="16" cy="16" r="2.5" />
    <path d="M16 13.5C16 8 14 4 11.5 4S8 8 12 11.5M18.5 16c5.5 0 9.5-2 9.5-4.5S24 8 20.5 12M16 18.5c0 5.5 2 9.5 4.5 9.5s3.5-4 -.5-7.5M13.5 16C8 16 4 18 4 20.5S8 24 11.5 20" />
  </Svg>
);
export const TagIcon = ({ size = 32 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
    <path d="M3 5a2 2 0 0 1 2-2h10.5a2 2 0 0 1 1.4.6l11.5 11.5a2 2 0 0 1 0 2.8l-10.5 10.5a2 2 0 0 1-2.8 0L2.6 16.9A2 2 0 0 1 2 15.5z" fill="#2f9e44" />
    <circle cx="10" cy="10" r="2.5" fill="#fff" />
  </svg>
);

export const FlagIcon = (p) => (
  <Svg {...p} fill="currentColor" strokeWidth="1.5"><path d="M6 3v27M6 5h19l-4 6 4 6H6" /></Svg>
);

export const KitchenIcon = (p) => (
  <Svg {...p}><path d="M5 3v8a3 3 0 0 0 6 0V3M8 3v26M24 29V3c-3 2-4 7-4 11h4" /></Svg>
);
export const WifiIcon = (p) => (
  <Svg {...p}><path d="M2 12a20 20 0 0 1 28 0M7 17a13 13 0 0 1 18 0M12 22a6 6 0 0 1 8 0M16 27h.01" strokeWidth="3" /></Svg>
);
export const WorkspaceIcon = (p) => (
  <Svg {...p}><path d="M3 18h26M6 18v10M26 18v10M9 18v-5h14v5M11 13V6h10v7M13 28h6" /></Svg>
);
export const CarIcon = (p) => (
  <Svg {...p}><path d="M4 22l2.5-9A3 3 0 0 1 9.4 11h13.2a3 3 0 0 1 2.9 2l2.5 9v6h-4v-3H8v3H4zM4 22h24M9 17h.01M23 17h.01" /></Svg>
);
export const HotTubIcon = (p) => (
  <Svg {...p}><path d="M3 14h26l-2 12a3 3 0 0 1-3 2H8a3 3 0 0 1-3-2zM9 9c0-2 2-2 2-4M16 9c0-2 2-2 2-4M22 9c0-2 2-2 2-4" /></Svg>
);
export const PawIcon = (p) => (
  <Svg {...p}>
    <path d="M16 28c-5 0-8-2.5-8-5.500 0-4 5-7.500 8-7.500s8 3.500 8 7.500c0 3-3 5.500-8 5.500z" />
    <circle cx="6" cy="13" r="2.5" /><circle cx="12" cy="7" r="2.5" /><circle cx="20" cy="7" r="2.5" /><circle cx="26" cy="13" r="2.5" />
  </Svg>
);
export const CameraIcon = (p) => (
  <Svg {...p}><path d="M3 7h18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3zM23 12l6-3v10l-6-3M9 20v8M5 28h8" /></Svg>
);
export const AlarmOffIcon = (p) => (
  <Svg {...p}><circle cx="16" cy="16" r="12" /><circle cx="16" cy="16" r="4" /><path d="M4 4l24 24" /></Svg>
);

export const SprayIcon = (p) => (
  <Svg {...p}><path d="M9 14h9v14a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1zM11 14v-4h5v4M16 10h6l2-3M24 11h.01M26 8h.01M26 14h.01" /></Svg>
);
export const CheckCircleIcon = (p) => (
  <Svg {...p}><circle cx="16" cy="16" r="13" /><path d="M9.500 16.5l4.5 4.5 8.500-9.500" /></Svg>
);
export const KeyMagIcon = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="10" r="2.5" /><path d="M17.500 18L28 29M24 25l-3 3" /></Svg>
);
export const ChatIcon = (p) => (
  <Svg {...p}><path d="M6 4h20a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H18l-4 6v-6H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" /></Svg>
);
export const MapIcon = (p) => (
  <Svg {...p}><path d="M2 7l9-3 10 3 9-3v21l-9 3-10-3-9 3zM11 4v21M21 7v21" /></Svg>
);
export const PriceTagIcon = (p) => (
  <Svg {...p}><path d="M3 5a2 2 0 0 1 2-2h10.500a2 2 0 0 1 1.400.6l11.5 11.5a2 2 0 0 1 0 2.800l-10.500 10.500a2 2 0 0 1-2.800 0L2.600 16.900A2 2 0 0 1 2 15.5zM10 10h.01" strokeWidth="3" /></Svg>
);

// Host-section icons
export const BalloonIcon = (p) => (
  <Svg {...p}><path d="M16 2c-5.5 0-9 4.2-9 9.5 0 5.6 4.1 10.3 9 11.5 4.9-1.2 9-5.9 9-11.5C25 6.2 21.5 2 16 2zM14.5 24.5L16 23l1.5 1.5c-.4 1.2-.4 2.4 0 4.5" /></Svg>
);
export const GradCapIcon = (p) => (
  <Svg {...p}><path d="M16 5L2 12l14 7 14-7-14-7zM7 15.5V23c0 1.7 4 4 9 4s9-2.3 9-4v-7.5M30 12v9" /></Svg>
);
export const ShieldIcon = (p) => (
  <Svg {...p}><path d="M16 2.5L4.5 6.5v9c0 7.2 4.7 12.5 11.5 15 6.8-2.5 11.5-7.8 11.5-15v-9L16 2.5zM16 2.5v28" /></Svg>
);
export const CalendarXIcon = (p) => (
  <Svg {...p}><path d="M6 6h20a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM4 13h24M10 3v6M22 3v6M12.5 17.5l7 7M19.5 17.5l-7 7" /></Svg>
);

export const GridIcon = (p) => (
  <Svg {...p}><path d="M4 4h8v8H4zM20 4h8v8h-8zM4 20h8v8H4zM20 20h8v8h-8z" /></Svg>
);
export const CloseIcon = (p) => (
  <Svg {...p}><path d="M6 6l20 20M26 6L6 26" /></Svg>
);
export const ExpandIcon = (p) => (
  <Svg {...p}><path d="M4 12V4h8M20 4h8v8M28 20v8h-8M12 28H4v-8" /></Svg>
);
