"""Karta 16:9 ze zdjęcia pionowego: kadr po lewej, biała płaszczyzna z tekstem po prawej.

Do zdjęć na jasnym, jednolitym tle - takich jak sesje w białej sali prób.
Zdjęcie idzie na pełną wysokość po lewej, a kadr jest przedłużany w prawo
białym gradientem, który zahacza o samo zdjęcie, więc szew jest niewidoczny.
Tekst siedzi w białej części, w kolorach portalu.

Inaczej niż karta-tytulowa.py, która kładzie biały tekst na ciemnym kadrze.
Tamta potrzebuje zdjęcia z ciemnym miejscem pod napisy; ta nie potrzebuje
niczego poza jasnym tłem po stronie, w którą rozciągamy.

Uruchomienie:
  karta-rozciagnieta.py S src out NADTYTUL TYTUL PODTYTUL [STOPKA] [SZEROKOSC_FOTO] [START_GRADIENTU]

  S                 katalog z podkatalogiem fonts/
  SZEROKOSC_FOTO    ułamek szerokości kadru zajęty przez zdjęcie (domyślnie 0.46)
  START_GRADIENTU   gdzie zaczyna się biel, jako ułamek szerokości zdjęcia
                    (domyślnie 0.80 - biel wgryza się w ostatnie 20% fotografii)
"""
import sys
from PIL import Image, ImageDraw, ImageFont

S, src, out, EYEBROW, TITLE, SUB = sys.argv[1:7]
STOPKA = sys.argv[7] if len(sys.argv) > 7 else ""
UDZIAL = float(sys.argv[8]) if len(sys.argv) > 8 else 0.46
START = float(sys.argv[9]) if len(sys.argv) > 9 else 0.80

W, H = 2400, 1350
# Kolory portalu: tło kart, złoto jasnego motywu, tekst główny i drugorzędny.
BIALY = (255, 255, 255)
ZLOTO = (168, 131, 42)
TEKST = (26, 26, 26)
SZARY = (90, 90, 90)


def kroj(plik, rozmiar, waga):
    f = ImageFont.truetype(f"{S}/fonts/{plik}", rozmiar)
    try:
        f.set_variation_by_name(waga)
    except Exception:
        pass
    return f


ser = lambda s, w="SemiBold": kroj("cormorant.ttf", s, w)
sans = lambda s, w="Medium": kroj("jakarta.ttf", s, w)

im = Image.new("RGB", (W, H), BIALY)

# Zdjęcie na pełną wysokość, przycięte w poziomie do zadanego udziału.
foto = Image.open(src).convert("RGB")
skala = H / foto.height
foto = foto.resize((round(foto.width * skala), H), Image.LANCZOS)
fw = round(W * UDZIAL)
if foto.width > fw:
    # Przycinamy od prawej - po lewej zwykle jest więcej pustego tła.
    foto = foto.crop((0, 0, fw, H))
im.paste(foto, (0, 0))
fw = foto.width

# Gradient: od START*fw (jeszcze na zdjęciu) do prawej krawędzi zdjęcia
# biel narasta z 0 do pełnego krycia, dalej jest już czysta biel.
g0 = round(fw * START)
nak = Image.new("RGBA", (W, H), (255, 255, 255, 0))
pik = nak.load()
for x in range(g0, fw):
    a = round(255 * (x - g0) / max(1, fw - g0))
    for y in range(H):
        pik[x, y] = (255, 255, 255, a)
im = Image.alpha_composite(im.convert("RGBA"), nak).convert("RGB")

d = ImageDraw.Draw(im)
X = fw + round(W * 0.055)          # lewa krawędź kolumny tekstu
PRAWY = W - round(W * 0.05)        # margines z prawej
SZER = PRAWY - X


def zawin(tekst, font):
    """Łamanie po słowach do szerokości kolumny."""
    slowa, linie, biez = tekst.split(), [], ""
    for s in slowa:
        prob = f"{biez} {s}".strip()
        if d.textlength(prob, font=font) <= SZER or not biez:
            biez = prob
        else:
            linie.append(biez)
            biez = s
    if biez:
        linie.append(biez)
    return linie


f_eye = sans(31, "SemiBold")
f_tit = ser(104)
f_sub = ser(46, "Medium")
f_sto = sans(26, "Medium")

# Tytuł bywa długi - zmniejszamy krój, dopóki nie zmieści się w trzech linijkach.
rozm = 104
while rozm > 58:
    f_tit = ser(rozm)
    if len(zawin(TITLE, f_tit)) <= 3:
        break
    rozm -= 4
linie_tit = zawin(TITLE, f_tit)
linie_sub = zawin(SUB, f_sub) if SUB else []

eye_txt = " ".join(EYEBROW.upper()) if EYEBROW else ""
h_eye = (d.textbbox((0, 0), eye_txt, font=f_eye)[3] + round(H * 0.035)) if EYEBROW else 0
h_tit = sum(round(rozm * 1.16) for _ in linie_tit)
h_sub = (round(H * 0.030) + sum(round(46 * 1.45) for _ in linie_sub)) if linie_sub else 0
blok = h_eye + h_tit + h_sub
y = (H - blok) // 2

if EYEBROW:
    d.text((X, y), eye_txt, font=f_eye, fill=ZLOTO)
    y += h_eye

for l in linie_tit:
    d.text((X, y), l, font=f_tit, fill=TEKST)
    y += round(rozm * 1.16)

if linie_sub:
    y += round(H * 0.030)
    # Złota kreska oddzielająca tytuł od podtytułu - jak w mockupie portalu.
    d.line([(X, y - round(H * 0.012)), (X + round(SZER * 0.18), y - round(H * 0.012))],
           fill=ZLOTO, width=2)
    y += round(H * 0.012)
    for l in linie_sub:
        d.text((X, y), l, font=f_sub, fill=SZARY)
        y += round(46 * 1.45)

if STOPKA:
    d.text((X, H - round(H * 0.085)), " ".join(STOPKA.upper()), font=f_sto, fill=SZARY)

im.save(out, quality=94)
print(f"  ✓ {W}x{H}, zdjęcie 0-{fw}, tytuł {rozm}px w {len(linie_tit)} lin.")
