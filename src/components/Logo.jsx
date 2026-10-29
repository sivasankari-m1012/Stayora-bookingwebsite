// Stayora wordmark: a roof-and-sun mark plus text, drawn as inline SVG (no external image).
export default function Logo() {
  return (
    <svg className="logo-svg" viewBox="0 0 132 34" role="img" aria-label="Stayora home" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="16" fill="#0e7c86" />
      <path d="M8 18.5 17 10l9 8.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 18v7h11v-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="21.5" r="1.6" fill="#ffd166" />
      <text x="42" y="24" fontFamily="Inter, Arial, sans-serif" fontSize="21" fontWeight="700" letterSpacing="-0.5" fill="#0e7c86">stayora</text>
    </svg>
  );
}
