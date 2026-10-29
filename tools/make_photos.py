"""Generates the original illustrated placeholder photos for the Stayora demo.
Run: python3 tools/make_photos.py   (needs Pillow). Replace the JPGs in public/photos with real photos any time;
file names are listed in src/data/photos.js."""
import random, os, math
from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 800
OUT = os.path.join(os.path.dirname(__file__), "..", "public")

PALETTES = [
    dict(wall=(236, 226, 211), floor=(176, 140, 104), accent=(31, 122, 128), soft=(246, 241, 232), dark=(52, 62, 66), sky=(170, 214, 232)),
    dict(wall=(222, 232, 226), floor=(160, 128, 98), accent=(214, 120, 72), soft=(240, 245, 241), dark=(44, 58, 54), sky=(188, 222, 236)),
    dict(wall=(241, 232, 224), floor=(139, 110, 86), accent=(88, 128, 96), soft=(250, 244, 238), dark=(60, 52, 48), sky=(200, 226, 240)),
    dict(wall=(228, 232, 240), floor=(184, 156, 124), accent=(196, 88, 98), soft=(244, 246, 250), dark=(48, 54, 70), sky=(176, 208, 236)),
    dict(wall=(245, 236, 214), floor=(150, 120, 90), accent=(40, 98, 140), soft=(252, 247, 232), dark=(58, 52, 44), sky=(190, 220, 238)),
]

def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)

def grad(img, top, bottom, box):
    x0, y0, x1, y1 = box
    d = ImageDraw.Draw(img)
    for y in range(y0, y1):
        t = (y - y0) / max(1, y1 - y0 - 1)
        d.line([(x0, y), (x1, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))

def window(d, img, x, y, w, h, p, rng):
    d.rectangle([x - 8, y - 8, x + w + 8, y + h + 8], fill=shade(p["wall"], .8))
    grad(img, p["sky"], (235, 244, 248), (x, y, x + w, y + h))
    d.ellipse([x + w * .6, y + h * .15, x + w * .6 + 46, y + h * .15 + 46], fill=(255, 244, 205))
    for i in range(3):  # palm / tree silhouettes
        cx = x + rng.randint(10, w - 10)
        d.rectangle([cx - 3, y + h * .55, cx + 3, y + h], fill=(70, 96, 70))
        d.ellipse([cx - 34, y + h * .35, cx + 34, y + h * .6], fill=(86, 128, 84))
    d.line([(x + w / 2, y), (x + w / 2, y + h)], fill=shade(p["wall"], .8), width=6)
    d.line([(x, y + h / 2), (x + w, y + h / 2)], fill=shade(p["wall"], .8), width=6)

def base_room(img, p, floor_y=520):
    d = ImageDraw.Draw(img)
    grad(img, shade(p["wall"], 1.03), shade(p["wall"], .93), (0, 0, W, floor_y))
    grad(img, p["floor"], shade(p["floor"], .78), (0, floor_y, W, H))
    d.rectangle([0, floor_y - 10, W, floor_y], fill=shade(p["wall"], .85))
    return d

def plant(d, x, y, s, rng):
    d.polygon([(x - 26 * s, y), (x + 26 * s, y), (x + 18 * s, y + 52 * s), (x - 18 * s, y + 52 * s)], fill=(190, 120, 86))
    for a in range(-60, 61, 30):
        r = math.radians(a - 90)
        d.ellipse([x + math.cos(r) * 46 * s - 22 * s, y + math.sin(r) * 62 * s - 40 * s,
                   x + math.cos(r) * 46 * s + 22 * s, y + math.sin(r) * 62 * s + 30 * s], fill=(70 + rng.randint(0, 30), 130 + rng.randint(0, 30), 80))

def lamp(d, x, y, p):
    d.rectangle([x - 3, y, x + 3, y + 190], fill=p["dark"])
    d.polygon([(x - 42, y), (x + 42, y), (x + 26, y - 56), (x - 26, y - 56)], fill=(250, 232, 190))
    d.ellipse([x - 28, y + 186, x + 28, y + 202], fill=p["dark"])

def scene_living(img, p, rng, variant=0):
    d = base_room(img, p)
    window(d, img, 760 if variant % 2 == 0 else 140, 120, 300, 280, p, rng)
    d.rounded_rectangle([200, 330, 700, 600] if variant % 2 == 0 else [520, 330, 1020, 600], 36, fill=p["accent"])
    sx = 200 if variant % 2 == 0 else 520
    d.rounded_rectangle([sx - 30, 400, sx + 40, 610], 24, fill=shade(p["accent"], .85))
    d.rounded_rectangle([sx + 460, 400, sx + 530, 610], 24, fill=shade(p["accent"], .85))
    for i in range(3):
        d.rounded_rectangle([sx + 60 + i * 140, 360, sx + 180 + i * 140, 470], 18, fill=shade(p["accent"], 1.18))
    d.rounded_rectangle([sx + 90, 650, sx + 430, 710], 12, fill=shade(p["floor"], .65))
    d.ellipse([sx + 40, 690, sx + 480, 760], fill=p["soft"])
    plant(d, 1080 if variant % 2 == 0 else 90, 430, 1.2, rng)
    lamp(d, 110 if variant % 2 == 0 else 1100, 330, p)
    if variant == 2:
        d.rectangle([420, 150, 780, 300], fill=p["dark"]); d.rectangle([430, 160, 770, 290], fill=(36, 44, 52))

def scene_tub(img, p, rng, variant=0):
    d = ImageDraw.Draw(img)
    grad(img, p["sky"], (240, 246, 248), (0, 0, W, 360))
    d.polygon([(0, 360), (300, 300), (600, 345), (900, 290), (W, 340), (W, 380), (0, 380)], fill=(122, 160, 126))
    grad(img, (166, 122, 86), (120, 86, 60), (0, 380, W, H))
    for x in range(-100, W, 110):
        d.line([(x, 380), (x - 120 + variant * 20, H)], fill=(104, 74, 52), width=3)
    cx, cy = 600 + (variant - 1) * 80, 560
    d.ellipse([cx - 330, cy - 120, cx + 330, cy + 150], fill=(70, 70, 76))
    d.ellipse([cx - 300, cy - 100, cx + 300, cy + 120], fill=(246, 246, 244))
    grad(img, (110, 200, 214), (60, 150, 176), (cx - 270, cy - 80, cx + 270, cy + 90))
    d.ellipse([cx - 270, cy - 80, cx + 270, cy + 90], outline=(235, 250, 252), width=4)
    d2 = ImageDraw.Draw(img)
    for i in range(46):
        bx, by = cx + rng.randint(-220, 220), cy + rng.randint(-50, 60)
        d2.ellipse([bx - 6, by - 6, bx + 6, by + 6], outline=(240, 252, 255), width=2)
    for i in range(3):
        px = [90, 1090, 980][i]
        plant(d, px, 330 + i * 40, 1.5, rng)
    d.rectangle([60, 640, 280, 690], fill=p["accent"]); d.rectangle([70, 690, 90, 740], fill=p["dark"]); d.rectangle([250, 690, 270, 740], fill=p["dark"])
    for i in range(5):
        x = 40 + i * 240
        d.ellipse([x, 70, x + 28, 98], fill=(255, 226, 150)); d.line([(x + 14, 0), (x + 14, 70)], fill=p["dark"], width=2)

def scene_kitchen(img, p, rng, variant=0):
    d = base_room(img, p, 560)
    d.rectangle([0, 80, W, 300], fill=shade(p["wall"], 1.0))
    for i in range(10):
        x = i * 120
        d.rectangle([x, 70, x + 116, 230], fill=p["accent"], outline=shade(p["accent"], .8), width=3)
        d.rectangle([x + 46, 210, x + 70, 216], fill=p["soft"])
    d.rectangle([0, 340, W, 380], fill=p["soft"])
    for i in range(10):
        x = i * 120
        d.rectangle([x, 380, x + 116, 640], fill=shade(p["accent"], .92), outline=shade(p["accent"], .75), width=3)
        d.rectangle([x + 40, 400, x + 76, 408], fill=p["soft"])
    d.rectangle([340, 250, 620, 340], fill=p["dark"]); d.rectangle([360, 340, 600, 345], fill=(200, 200, 200))
    for i in range(4):
        d.ellipse([380 + i * 60, 320, 420 + i * 60, 336], fill=(60, 60, 64))
    d.rectangle([880, 60, 1100, 640], fill=(222, 226, 230), outline=(180, 184, 190), width=4)
    d.line([(880, 280), (1100, 280)], fill=(170, 176, 182), width=4)
    d.rectangle([1070, 140, 1080, 230], fill=(150, 156, 162)); d.rectangle([1070, 330, 1080, 450], fill=(150, 156, 162))
    d.ellipse([140, 300, 190, 340], fill=(220, 90, 70)); d.rectangle([220, 306, 290, 340], fill=(250, 240, 200))

def scene_bedroom(img, p, rng, variant=0):
    d = base_room(img, p, 540)
    d.rectangle([260, 120, 940, 380], fill=shade(p["accent"], .8))
    for i in range(8):
        d.rectangle([260 + i * 85, 120, 260 + i * 85 + 8, 380], fill=shade(p["accent"], .72))
    d.rounded_rectangle([220, 330, 980, 640], 30, fill=p["soft"])
    d.rounded_rectangle([220, 450, 980, 660], 24, fill=shade(p["accent"], 1.1))
    d.rectangle([220, 450, 980, 480], fill=shade(p["accent"], .9))
    for i in range(2):
        d.rounded_rectangle([290 + i * 330, 350, 600 + i * 330 - 70, 440], 22, fill=(255, 255, 255), outline=(222, 222, 222), width=2)
    d.rounded_rectangle([240, 620, 960, 700], 10, fill=shade(p["floor"], .6))
    for x in (90, 1050):
        d.rounded_rectangle([x - 55, 440, x + 55, 600], 10, fill=shade(p["floor"], .7))
        d.rectangle([x - 40, 470, x + 40, 476], fill=shade(p["floor"], .5))
        lamp(d, x, 250, p) if False else (d.polygon([(x - 36, 400), (x + 36, 400), (x + 22, 340), (x - 22, 340)], fill=(250, 232, 190)))
    window(d, img, 30 if variant % 2 else 900, 130, 180, 230, p, rng) if variant == 1 else None

def scene_bath(img, p, rng, variant=0):
    d = ImageDraw.Draw(img)
    grad(img, (232, 238, 238), (208, 218, 220), (0, 0, W, 600))
    for x in range(0, W, 100): d.line([(x, 0), (x, 600)], fill=(200, 210, 212), width=2)
    for y in range(0, 600, 100): d.line([(0, y), (W, y)], fill=(200, 210, 212), width=2)
    grad(img, (190, 178, 160), (150, 138, 120), (0, 600, W, H))
    d.rectangle([760, 60, 1120, 600], outline=(150, 190, 204), width=8, fill=(214, 238, 246))
    d.line([(940, 60), (940, 600)], fill=(150, 190, 204), width=6)
    d.ellipse([870, 90, 940, 120], fill=(120, 126, 132)); d.rectangle([900, 120, 910, 160], fill=(120, 126, 132))
    d.rounded_rectangle([140, 400, 560, 470], 14, fill=(250, 250, 250), outline=(205, 205, 205), width=3)
    d.rectangle([180, 470, 520, 600], fill=shade(p["floor"], .9))
    d.ellipse([260, 370, 440, 410], fill=(240, 246, 248)); d.rectangle([340, 330, 360, 372], fill=(150, 156, 162))
    d.rounded_rectangle([160, 110, 540, 300], 12, fill=(250, 250, 250), outline=p["dark"], width=8)
    d.rounded_rectangle([60, 520, 120, 700], 10, fill=p["accent"])
    for i in range(3): d.rectangle([40, 560 + i * 4, 140, 566 + i * 4], fill=(250, 250, 250))

def scene_gym(img, p, rng, variant=0):
    d = base_room(img, p, 540)
    d.rectangle([0, 0, W, 540], fill=shade(p["wall"], .98))
    for i in range(4): d.rectangle([60 + i * 280, 90, 300 + i * 280 - 60, 360], fill=(215, 232, 240), outline=(170, 180, 186), width=4)
    d.rectangle([0, 540, W, H], fill=(52, 56, 60))
    for x in range(0, W, 150): d.line([(x, 540), (x - 80, H)], fill=(70, 74, 78), width=2)
    d.polygon([(220, 560), (760, 560), (820, 400), (720, 330), (330, 330)], fill=(36, 40, 44))
    d.rectangle([700, 180, 724, 520], fill=(90, 96, 102)); d.rectangle([640, 170, 800, 200], fill=(70, 74, 80))
    d.rectangle([380, 560, 720, 590], fill=(26, 30, 34))
    d.rectangle([880, 340, 1120, 360], fill=(80, 84, 88)); d.rectangle([880, 360, 1120, 372], fill=(110, 114, 120))
    for i in range(5):
        d.ellipse([890 + i * 46, 300 + (i % 2) * 6, 940 + i * 46, 350 + (i % 2) * 6], fill=p["accent"] if i % 2 else p["dark"])
    d.rectangle([880, 372, 1120, 640], fill=(70, 74, 80))
    d.ellipse([140, 680, 260, 720], fill=p["accent"]); d.ellipse([940, 690, 1020, 720], fill=p["accent"])

def scene_exterior(img, p, rng, variant=0):
    d = ImageDraw.Draw(img)
    grad(img, p["sky"], (246, 244, 236), (0, 0, W, 560))
    d.ellipse([920, 70, 1010, 160], fill=(255, 244, 205))
    d.ellipse([140, 120, 360, 180], fill=(255, 255, 255)); d.ellipse([260, 100, 460, 170], fill=(255, 255, 255))
    bx0 = 180 + variant * 25; bx1 = 1020 - variant * 25
    d.rectangle([bx0, 210, bx1, 600], fill=p["soft"])
    d.rectangle([bx0, 190, bx1, 220], fill=p["accent"])
    for r in range(3):
        for c in range(6):
            x = bx0 + 40 + c * ((bx1 - bx0 - 60) // 6); y = 250 + r * 115
            d.rectangle([x, y, x + 74, y + 80], fill=(110, 170, 196), outline=p["dark"], width=4)
            d.rectangle([x - 10, y + 80, x + 84, y + 94], fill=shade(p["accent"], .9))
    d.rectangle([560, 520, 640, 600], fill=p["dark"]); d.rectangle([548, 510, 652, 522], fill=p["accent"])
    grad(img, (110, 160, 100), (74, 124, 76), (0, 600, W, H))
    d.polygon([(480, 800), (720, 800), (650, 600), (550, 600)], fill=(214, 202, 182))
    for x in (90, 1110, 330, 880):
        d.rectangle([x - 8, 360, x + 8, 640], fill=(110, 84, 60))
        for a in range(-70, 71, 35):
            r = math.radians(a - 90)
            d.line([(x, 360), (x + math.cos(r) * 110, 360 + math.sin(r) * 80 + 40)], fill=(60, 120, 66), width=14)

def scene_pool(img, p, rng, variant=0):
    d = ImageDraw.Draw(img)
    grad(img, p["sky"], (240, 246, 248), (0, 0, W, 300))
    d.rectangle([0, 220, W, 320], fill=shade(p["soft"], .98))
    for i in range(7): d.rectangle([40 + i * 170, 240, 130 + i * 170, 310], fill=(110, 170, 196), outline=p["dark"], width=3)
    grad(img, (226, 214, 190), (200, 184, 156), (0, 320, W, H))
    d.rounded_rectangle([130, 400, 1070, 700], 40, fill=(250, 250, 250))
    grad(img, (96, 206, 220), (28, 130, 170), (160, 430, 1040, 680))
    for i in range(14):
        y = 450 + i * 16; d.arc([180 + (i % 3) * 60, y, 560 + (i % 3) * 60, y + 20], 0, 180, fill=(190, 240, 248), width=2)
        d.arc([600 - (i % 4) * 30, y + 8, 980 - (i % 4) * 30, y + 28], 0, 180, fill=(190, 240, 248), width=2)
    for x in (70, 1060):
        d.rounded_rectangle([x, 560, x + 90, 600], 8, fill=p["accent"]); d.rectangle([x + 6, 600, x + 14, 640], fill=p["dark"]); d.rectangle([x + 76, 600, x + 84, 640], fill=p["dark"])
    d.line([(600, 320), (600, 410)], fill=p["dark"], width=4); d.polygon([(500, 330), (700, 330), (600, 290)], fill=p["accent"])
    plant(d, 1100, 360, 1.3, rng); plant(d, 90, 380, 1.3, rng)

def scene_misc(img, p, rng, variant=0):
    kinds = [scene_living, scene_tub, scene_exterior, scene_pool, scene_bedroom, scene_kitchen, scene_gym, scene_bath]
    return kinds[variant % len(kinds)](img, p, rng, variant // len(kinds))

SCENES = dict(living=scene_living, tub=scene_tub, kitchen=scene_kitchen, bedroom=scene_bedroom, bath=scene_bath,
              gym=scene_gym, exterior=scene_exterior, pool=scene_pool, misc=scene_misc)

def make(path, kind, seed, variant=0, size=(W, H)):
    rng = random.Random(seed)
    p = PALETTES[seed % len(PALETTES)]
    img = Image.new("RGB", (W, H), p["wall"])
    SCENES[kind](img, p, rng, variant)
    # soft vignette + light film grain so it reads as a photograph, not clip-art
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).ellipse([-W * .25, -H * .35, W * 1.25, H * 1.35], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(140))
    dark = Image.new("RGB", (W, H), (0, 0, 0))
    img = Image.composite(img, Image.blend(img, dark, .35), vig)
    noise = Image.effect_noise((W, H), 9).convert("RGB")
    img = Image.blend(img, noise, .03).filter(ImageFilter.GaussianBlur(.7))
    if size != (W, H): img = img.resize(size, Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "JPEG", quality=78, optimize=True)

# (file id, scene, variant) in the same order as GROUPS in src/data/photos.js
PHOTO_PLAN = (
    [("living-%d" % i, "living", i - 1) for i in (1, 2, 3)] +
    [("terrace-%d" % i, "tub" if i % 2 else "misc", (i // 2) if i % 2 else i + 1) for i in range(1, 9)] +
    [("kitchen-%d" % i, "kitchen", i) for i in (1, 2)] +
    [("bedroom-%d" % i, "bedroom", i % 2) for i in range(1, 6)] +
    [("bathroom-1", "bath", 0)] +
    [("gym-%d" % i, "gym", i) for i in range(1, 6)] +
    [("exterior-%d" % i, "exterior", i) for i in range(1, 7)] +
    [("pool-%d" % i, "pool", i) for i in (1, 2, 3)] +
    [("extra-%d" % i, "misc", i) for i in range(1, 11)]
)

if __name__ == "__main__":
    for n, (fid, kind, var) in enumerate(PHOTO_PLAN):
        make(os.path.join(OUT, "photos", fid + ".jpg"), kind, 101 + n * 7, var)
    nearby = ["tub", "pool", "exterior", "living", "bedroom", "tub", "pool", "exterior"]
    for i, k in enumerate(nearby, 1):
        make(os.path.join(OUT, "nearby", f"{i}.jpg"), k, 400 + i * 13, i % 3, size=(600, 600))
    make(os.path.join(OUT, "sleep", "bedroom.jpg"), "bedroom", 811, 1, size=(800, 600))
    make(os.path.join(OUT, "sleep", "living-room.jpg"), "living", 823, 0, size=(800, 600))
    print("photos:", len(PHOTO_PLAN))
