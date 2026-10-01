"""Karta 3:4 na Instagram: zdjęcie u góry, tekst na ciemnym polu pod spodem.

Zdjęcia z operalodz.com mają maks. 1120x800, więc kadrowanie do pionu 3:4
wymagałoby mocnego powiększenia i zmiękczyłoby obraz. Zamiast tego zdjęcie
idzie w natywnej szerokości, a pion dopełnia ciemne pole na tekst.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

S, SRC, OUT = sys.argv[1:4]
NAD, TYT, POD, KREDYT = sys.argv[4:8]

W, H = 1080, 1440
TLO = (10, 10, 13)
GOLD, IVORY, WHITE, SZARY = (201, 168, 76), (238, 234, 225), (255, 255, 255), (150, 150, 158)

karta = Image.new("RGB", (W, H), TLO)
foto = Image.open(SRC).convert("RGB")
fw, fh = foto.size
foto = foto.resize((W, round(fh * W / fw)), Image.LANCZOS)
karta.paste(foto, (0, 0))
fh2 = foto.size[1]

# Zejście zdjęcia w tło, żeby krawędź nie cięła kadru linią.
d = ImageDraw.Draw(karta, "RGBA")
for i in range(140):
    y = fh2 - 140 + i
    d.line([(0, y), (W, y)], fill=TLO + (int(255 * (i / 140) ** 1.4),))

ser = lambda s: ImageFont.truetype(f"{S}/fonts/cormorant.ttf", s)
sans = lambda s: ImageFont.truetype(f"{S}/fonts/jakarta.ttf", s)
X = 74
d = ImageDraw.Draw(karta)

# Pusty nadtytuł pomija też złotą kreskę pod nim.
if NAD.strip():
    y = fh2 + 40
    d.text((X, y), " ".join(NAD.upper()), font=sans(25), fill=GOLD)
    d.line([(X, y + 48), (X + 78, y + 48)], fill=GOLD, width=2)
    y += 96
else:
    y = fh2 + 78
f_tyt = ser(172)
d.text((X - 6, y), TYT, font=f_tyt, fill=WHITE)
y = d.textbbox((X - 6, y), TYT, font=f_tyt)[3] + 26

f_pod = sans(40)
for linia in POD.split("|"):
    d.text((X, y), linia.strip(), font=f_pod, fill=IVORY)
    y += 56

d.text((X, H - 62), KREDYT, font=sans(21), fill=SZARY)
karta.save(OUT, "JPEG", quality=93, optimize=True)
print(f"  ✓ {OUT.split('/')[-1]}  {W}x{H}  (zdjęcie {W}x{fh2})")
