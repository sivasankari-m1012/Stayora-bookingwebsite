"""Downloads real, free-to-use room photos into public/ using the names the app expects.
Works with Pixabay (recommended, key is instant) or Pexels (new keys currently paused).
Both licences allow free personal and commercial use; credits are saved to PHOTO_CREDITS.md.

Setup (one time):
  1. Pixabay: sign up free at https://pixabay.com, open https://pixabay.com/api/docs/ and copy your key.
  2. pip install pillow
Run (from the project root):
  Windows PowerShell:  $env:PIXABAY_API_KEY="your_key"; python tools/fetch_photos.py
  macOS / Linux:       PIXABAY_API_KEY=your_key python3 tools/fetch_photos.py
"""
import io, json, os, sys, urllib.parse, urllib.request
from PIL import Image, ImageOps

PIXABAY = os.environ.get("PIXABAY_API_KEY")
PEXELS = os.environ.get("PEXELS_API_KEY")
if not (PIXABAY or PEXELS):
    sys.exit("Set PIXABAY_API_KEY first (free key: https://pixabay.com/api/docs/)")

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_photos import PHOTO_PLAN  # reuse the same list of file ids

QUERIES = {
    "living": ["modern living room interior", "cozy apartment living room"],
    "terrace": ["hot tub terrace", "balcony sea view apartment", "outdoor jacuzzi", "terrace lounge tropical"],
    "kitchen": ["modern kitchen interior", "apartment kitchen"],
    "bedroom": ["hotel bedroom interior", "cozy bedroom double bed"],
    "bathroom": ["modern bathroom interior"],
    "gym": ["home gym interior", "fitness room equipment"],
    "exterior": ["apartment building exterior", "resort building tropical"],
    "pool": ["resort swimming pool", "villa pool"],
    "extra": ["apartment dining area", "hotel lobby", "balcony plants", "resort garden", "interior hallway", "reading nook interior"],
}
NEARBY_Q = ["villa private pool", "studio apartment interior", "luxury apartment", "boutique hotel room",
            "beach house", "cottage garden", "tropical villa", "balcony apartment view"]

cache, used, credits = {}, set(), []

def search(q):
    if q in cache:
        return cache[q]
    if PIXABAY:
        url = "https://pixabay.com/api/?" + urllib.parse.urlencode({
            "key": PIXABAY, "q": q, "image_type": "photo", "orientation": "horizontal",
            "safesearch": "true", "per_page": 50, "min_width": 1000})
        hits = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "stayora-demo"}), timeout=30))["hits"]
        cache[q] = [{"id": h["id"], "url": h["largeImageURL"], "who": h["user"], "page": h["pageURL"]} for h in hits]
    else:
        url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "per_page": 40, "orientation": "landscape"})
        req = urllib.request.Request(url, headers={"Authorization": PEXELS, "User-Agent": "stayora-demo"})
        cache[q] = [{"id": h["id"], "url": h["src"]["large2x"], "who": h["photographer"], "page": h["url"]}
                    for h in json.load(urllib.request.urlopen(req, timeout=30))["photos"]]
    return cache[q]

def pick(queries, n):
    """Return the n-th unused photo, cycling through the queries."""
    q = queries[n % len(queries)]
    for p in search(q):
        if p["id"] not in used:
            used.add(p["id"]); return p
    raise RuntimeError("ran out of photos for " + q)

def save(photo, rel, size=None):
    data = urllib.request.urlopen(urllib.request.Request(photo["url"], headers={"User-Agent": "stayora-demo"}), timeout=60).read()
    img = Image.open(io.BytesIO(data)).convert("RGB")
    img = ImageOps.fit(img, size, Image.LANCZOS) if size else ImageOps.contain(img, (1600, 1200), Image.LANCZOS)
    path = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "JPEG", quality=82, optimize=True)
    credits.append(f"{rel}: {photo['who']} - {photo['page']}")
    print("saved", rel)

counters = {}
for fid, _, _ in PHOTO_PLAN:
    group = fid.rsplit("-", 1)[0]
    i = counters.get(group, 0); counters[group] = i + 1
    save(pick(QUERIES[group], i), f"photos/{fid}.jpg")
for i, q in enumerate(NEARBY_Q, 1):
    save(pick([q], 0), f"nearby/{i}.jpg", (600, 600))
save(pick(["cozy bedroom double bed"], 0), "sleep/bedroom.jpg", (800, 600))
save(pick(["modern living room sofa"], 0), "sleep/living-room.jpg", (800, 600))

with open(os.path.join(ROOT, "..", "PHOTO_CREDITS.md"), "w", encoding="utf-8") as f:
    f.write("# Photo credits (free licence)\n\n" + "\n".join("- " + c for c in credits) + "\n")
print("Done. Credits written to PHOTO_CREDITS.md")
