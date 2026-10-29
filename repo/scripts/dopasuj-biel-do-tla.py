"""Podciąga biel grafiki do koloru tła portalu (#FAFAF8), bez prześwietlania.

Mapa dwuodcinkowa, osobno dla każdego kanału:
  - do punktu bieli zdjęcia rozciągamy liniowo, żeby tło trafiło w kolor strony,
  - powyżej ściskamy resztę zakresu, zamiast ją obcinać. Dzięki temu tiul
    sukienki nie zlewa się w jedną płaską plamę.
"""
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
W, H = im.size

# Punkt bieli zdjęcia: jasne tło przy prawej krawędzi, z dala od napisów.
pas = im.crop((round(W * 0.88), round(H * 0.04), W, round(H * 0.18)))
px = list(pas.get_flattened_data())
WB = tuple(sum(p[i] for p in px) // len(px) for i in range(3))
CEL = (250, 250, 248)  # tło portalu, --bg z globals.css
print(f"  biel grafiki {WB} -> tło strony {CEL}")

kanaly = []
for k in range(3):
    wb, cel = WB[k], CEL[k]
    lut = []
    for i in range(256):
        if i <= wb:
            v = i * cel / wb
        else:
            # Reszta zakresu ściśnięta w to, co zostało do 255.
            v = cel + (i - wb) * (255 - cel) / max(1, 255 - wb)
        lut.append(max(0, min(255, round(v))))
    kanaly.append(lut)

im = im.point(kanaly[0] + kanaly[1] + kanaly[2])
im.save(out, quality=95)

spr = Image.open(out).convert("RGB").crop((round(W * 0.88), round(H * 0.04), W, round(H * 0.18)))
p2 = list(spr.get_flattened_data())
print(f"  po korekcie tło: {tuple(sum(p[i] for p in p2)//len(p2) for i in range(3))}")
