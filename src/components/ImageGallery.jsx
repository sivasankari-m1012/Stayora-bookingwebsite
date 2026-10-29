import { HERO_PHOTOS, PHOTOS, photoUrl, photoAlt } from "../data/photos";
import useModalParams from "../hooks/useModalParams";
import PhotoTour from "./PhotoTour";
import PhotoViewer from "./PhotoViewer";
import { GridIcon } from "./Icons";
import "../photo-tour.css";

const TOUR = "PHOTO_TOUR_SCROLLABLE";

// Grid slot classes, in HERO_PHOTOS order: big left image, then the four tiles.
const SLOTS = ["main-image", "gallery-image", "gallery-image top-right", "gallery-image", "gallery-image last-image"];

function ImageGallery() {
  // The URL is the state:
  //   ?modal=PHOTO_TOUR_SCROLLABLE&photo=<id>   -> tour, scrolled to that photo
  //   ?modal=PHOTO_TOUR_SCROLLABLE&modalItem=3  -> single-photo viewer (index into PHOTOS)
  const [{ modal, item, photo }, navigate] = useModalParams();

  const tourOpen = modal === TOUR;
  const viewerOpen = tourOpen && Number.isInteger(item) && item >= 0 && item < PHOTOS.length;

  const openTour = (photoId) => navigate(`modal=${TOUR}${photoId ? `&photo=${photoId}` : ""}`);

  // Same DOM serves desktop grid and the mobile swipe carousel (CSS only) -> identical photos & order.
  return (
    <>
      <section className="image-gallery" aria-label="Property photos">
        {HERO_PHOTOS.map((p, i) => (
          <div key={p.id} className={SLOTS[i]}>
            <img src={photoUrl(p)} alt="" loading={i === 0 ? "eager" : "lazy"} />
            {/* one real <button> per tile: keyboard + screen-reader accessible, no nested interactives */}
            <button type="button" className="hero-hit" aria-label={`Open photo tour: ${photoAlt(p)}`} onClick={() => openTour(p.id)} />
            {i === HERO_PHOTOS.length - 1 && (
              <button className="show-photos" onClick={() => openTour()}>
                <GridIcon size={16} />
                Show all photos
              </button>
            )}
          </div>
        ))}
      </section>

      {tourOpen && <PhotoTour navigate={navigate} focusPhoto={photo} />}
      {viewerOpen && <PhotoViewer index={item} navigate={navigate} />}
    </>
  );
}

export default ImageGallery;
