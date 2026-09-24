import sys
from PIL import Image, ImageDraw, ImageFont

S, src, out, EYEBROW, TITLE, SUB = sys.argv[1:7]

im = Image.open(src).convert("RGB")
W, H = im.size

# Delikatne przyciemnienie: głównie od góry (tam kadr i tak jest czarny),
# lekko od lewej. Ma tylko zabezpieczyć czytelność, nie gasić zdjęcia.
mask = Image.new("L", (W, H))
px = mask.load()
for y in range(H):
    v_top = max(0.0, 1 - y / (H * 0.52)) ** 1.3
    for x in range(0, W, 4):
        v_left = max(0.0, 1 - x / (W * 0.50)) ** 1.6
        v = min(1.0, v_top * 0.72 + v_left * 0.42)
        a = int(180 * v)
        for xx in range(x, min(x + 4, W)):
            px[xx, y] = a
im = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), im, mask)

d = ImageDraw.Draw(im)
ser = lambda s: ImageFont.truetype(f"{S}/fonts/cormorant.ttf", s)
sans = lambda s: ImageFont.truetype(f"{S}/fonts/jakarta.ttf", s)
GOLD, IVORY, WHITE = (201, 168, 76), (238, 234, 224), (255, 255, 255)
X = int(W * 0.047)

f_eye = sans(int(W * 0.0115))
d.text((X, int(H * 0.072)), " ".join(EYEBROW.upper()), font=f_eye, fill=GOLD)
d.line([(X, int(H * 0.113)), (X + int(W * 0.055), int(H * 0.113))], fill=GOLD, width=2)

f_tit = ser(int(H * 0.135))
ty = int(H * 0.135)
d.text((X - int(W * 0.003), ty), TITLE, font=f_tit, fill=WHITE)
bb = d.textbbox((X - int(W * 0.003), ty), TITLE, font=f_tit)

f_sub = sans(int(H * 0.036))
d.text((X, bb[3] + int(H * 0.028)), SUB, font=f_sub, fill=IVORY)

im.save(out, "JPEG", quality=92, optimize=True)
print(f"  ✓ {W}x{H}")
