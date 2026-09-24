"""Karta tytułowa: zdjęcie 16:9 + nadtytuł, tytuł i podtytuł.

Tekst siedzi w dolnej połowie kadru, na miękkiej ciemnej poświacie, żeby był
czytelny także wtedy, gdy hero na stronie głównej przeskaluje grafikę.
Kroje: Cormorant Garamond i Plus Jakarta Sans - te same, które ładuje portal.
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S, src, out, EYEBROW, TITLE, SUB = sys.argv[1:7]
# Środek bloku tekstu w pionie, jako ułamek wysokości.
CY = float(sys.argv[7]) if len(sys.argv) > 7 else 0.63

im = Image.open(src).convert("RGB")
W, H = im.size
X = int(W * 0.047)

ser = lambda s: ImageFont.truetype(f"{S}/fonts/cormorant.ttf", s)
sans = lambda s: ImageFont.truetype(f"{S}/fonts/jakarta.ttf", s)
f_eye = sans(int(W * 0.0135))
f_tit = ser(int(H * 0.175))
f_sub = sans(int(H * 0.047))

pom = ImageDraw.Draw(Image.new("RGB", (1, 1)))
h_eye = pom.textbbox((0, 0), EYEBROW, font=f_eye)[3]
h_tit = pom.textbbox((0, 0), TITLE, font=f_tit)[3]
h_sub = pom.textbbox((0, 0), SUB, font=f_sub)[3]
odstep1, odstep2 = int(H * 0.055), int(H * 0.030)
h_blok = h_eye + odstep1 + h_tit + odstep2 + h_sub
y0 = int(H * CY) - h_blok // 2
szer_blok = max(pom.textbbox((0, 0), t, font=f)[2] for t, f in
                ((EYEBROW, f_eye), (TITLE, f_tit), (SUB, f_sub)))

# Ciemna poświata pod tekstem: elipsa wtopiona w tło, plus delikatne
# przyciemnienie od dołu i od lewej, żeby przejście było niewidoczne.
mask = Image.new("L", (W, H), 0)
md = ImageDraw.Draw(mask)
md.ellipse([X - int(W * 0.10), y0 - int(H * 0.22),
            X + szer_blok + int(W * 0.14), y0 + h_blok + int(H * 0.22)], fill=175)
mask = mask.filter(ImageFilter.GaussianBlur(int(W * 0.055)))
px = mask.load()
for y in range(H):
    v_dol = max(0.0, (y / H - 0.30) / 0.70) ** 1.5
    for x in range(0, W, 4):
        v_lewo = max(0.0, 1 - x / (W * 0.62)) ** 1.5
        a = int(min(205, px[x, y] + 70 * v_dol * v_lewo))
        for xx in range(x, min(x + 4, W)):
            px[xx, y] = a
im = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), im, mask)

d = ImageDraw.Draw(im)
GOLD, IVORY, WHITE = (201, 168, 76), (240, 236, 227), (255, 255, 255)
y = y0
d.text((X, y), " ".join(EYEBROW.upper()), font=f_eye, fill=GOLD)
d.line([(X, y + h_eye + int(H * 0.022)), (X + int(W * 0.062), y + h_eye + int(H * 0.022))],
       fill=GOLD, width=2)
y += h_eye + odstep1
d.text((X - int(W * 0.004), y), TITLE, font=f_tit, fill=WHITE)
y = d.textbbox((X - int(W * 0.004), y), TITLE, font=f_tit)[3] + odstep2
d.text((X, y), SUB, font=f_sub, fill=IVORY)

im.save(out, "JPEG", quality=92, optimize=True)
print(f"  ✓ {W}x{H}, blok tekstu: y {y0}-{y0+h_blok} z {H}")
