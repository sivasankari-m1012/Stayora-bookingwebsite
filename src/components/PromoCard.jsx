import { useState } from "react";
import { TagIcon } from "./Icons";

// "Get 10% off your next stay" strip shown above the booking card.
export default function PromoCard() {
  const [claimed, setClaimed] = useState(false);
  return (
    <div className="promo">
      <TagIcon size={32} />
      <p><span>Get 10% off your next stay.</span><a href="#top" onClick={(e) => e.preventDefault()}>Terms apply</a></p>
      <button type="button" disabled={claimed} onClick={() => setClaimed(true)}>{claimed ? "Claimed" : "Claim"}</button>
    </div>
  );
}
