import { FEATURED, TOTAL_AMENITIES } from "../data/amenities";
import useModalParams from "../hooks/useModalParams";
import AmenitiesModal from "./AmenitiesModal";
import { AlarmOffIcon, CameraIcon, CarIcon, HotTubIcon, KitchenIcon, PawIcon, PoolIcon, WifiIcon, WorkspaceIcon } from "./Icons";
import "../amenities.css";

const ICONS = {
  kitchen: KitchenIcon, wifi: WifiIcon, workspace: WorkspaceIcon, parking: CarIcon, pool: PoolIcon,
  hottub: HotTubIcon, paw: PawIcon, camera: CameraIcon, alarm: AlarmOffIcon,
};

function Amenities() {
  // URL-driven like the photo tour: ?modal=AMENITIES
  const [{ modal }, navigate] = useModalParams();

  return (
    <section className="amenities" aria-labelledby="amen-h">
      <h2 id="amen-h">What this place offers</h2>

      <ul className="amenities-grid">
        {FEATURED.map(({ icon, label, off }) => {
          const Icon = ICONS[icon];
          return (
            <li className={`amenity${off ? " off" : ""}`} key={label}>
              <Icon size={24} />
              <span>{label}</span>
              {off && <span className="sr-only"> (not available)</span>}
            </li>
          );
        })}
      </ul>

      <button className="show-amenities" onClick={() => navigate("modal=AMENITIES")}>
        Show all {TOTAL_AMENITIES} amenities
      </button>

      {modal === "AMENITIES" && <AmenitiesModal onClose={() => navigate("")} />}
    </section>
  );
}

export default Amenities;
