"""Karta 16:9 ze zdjęcia pionowego: kadr po lewej, rozjaśniona płaszczyzna z tekstem po prawej.

Do zdjęć na jasnym, jednolitym tle - takich jak sesje w białej sali prób.
Zdjęcie idzie na pełną wysokość po lewej i zostaje nietknięte. Na prawo od
niego kadr jest przedłużany kolorem własnej krawędzi, liczonym osobno dla
każdego wiersza, a ten pas jest wygaszany gradientem w jednolite tło.

UWAGA NA ODCIEŃ. "Biała" ściana na zdjęciu prawie nigdy nie jest biała -
w sesji, z której powstała okładka Światowego Dnia Baletu, miała #E7E7EB,
czyli chłodną szarość. Dolanie czystej bieli daje widoczny uskok. Dlatego
skrypt próbkuje kolor przy prawej krawędzi kadru i rozjaśnia go w stronę
bieli tylko częściowo (parametr BIEL), zamiast dokładać #FFFFFF.

Inaczej niż karta-tytulowa.py, która kładzie biały tekst na ciemnym kadrze.
Tamta potrzebuje zdjęcia z ciemnym miejscem pod napisy; ta nie potrzebuje
niczego poza jasnym tłem po stronie, w którą rozciągamy.

Uruchomienie:
  karta-rozciagnieta.py S src out TYTUL TEMAT [STOPKA] [UDZIAL] [GRAD_OD] [X_TEKST] [BIEL]

  S          katalog z podkatalogiem fonts/
  TYTUL      duże czarne litery, łamane automatycznie; krój dobiera rozmiar sam
  TEMAT      jedna linijka pod tytułem, mniejsza, złota; pusty ciąg pomija
  STOPKA     drobny podpis w lewym dolnym rogu kolumny tekstu
  UDZIAL     ułamek szerokości karty zajęty przez zdjęcie (domyślnie 0.50)
  GRAD_DL    długość gradientu na PRAWO od zdjęcia, ułamek szerokości karty
             (domyślnie 0.30). Gradient nigdy nie wchodzi na fotografię -
             zaczyna się na jej krawędzi i wygasza jej przedłużenie
  X_TEKST    lewa krawędź kolumny tekstu, ułamek szerokości (domyślnie 0.53)
  BIEL       jak mocno rozjaśnić próbkowany kolor w stronę bieli, 0-1
             (domyślnie 0.55; 1.0 dałoby czystą biel, czego zwykle nie chcemy)
"""
import sys
from PIL import Image, ImageDraw, ImageFont

S, src, out, TITLE, TEMAT = sys.argv[1:6]
STOPKA = sys.argv[6] if len(sys.argv) > 6 else ""
UDZIAL = float(sys.argv[7]) if len(sys.argv) > 7 else 0.50
GRAD_DL = float(sys.argv[8]) if len(sys.argv) > 8 else 0.30
X_TEKST = float(sys.argv[9]) if len(sys.argv) > 9 else 0.53
BIEL = float(sys.argv[10]) if len(sys.argv) > 10 else 0.55

W, H = 2400, 1350
ZLOTO = (168, 131, 42)
TEKST = (20, 20, 20)
SZARY = (120, 120, 124)


def kroj(plik, rozmiar, waga):
    f = ImageFont.truetype(f"{S}/fonts/{plik}", rozmiar)
    try:
        f.set_variation_by_name(waga)
    except Exception:
        pass
    return f


ser = lambda s, w="SemiBold": kroj("cormorant.ttf", s, w)
sans = lambda s, w="Medium": kroj("jakarta.ttf", s, w)

# Zdjęcie na pełną wysokość, przycięte w poziomie do zadanego udziału.
foto = Image.open(src).convert("RGB")
skala = H / foto.height
foto = foto.resize((round(foto.width * skala), H), Image.LANCZOS)
fw = round(W * UDZIAL)
if foto.width > fw:
    # Przycinamy od prawej - po lewej zwykle jest więcej pustego tła.
    foto = foto.crop((0, 0, fw, H))
fw = foto.width

# Kolor dolewki: średnia z pionowego paska przy prawej krawędzi zdjęcia,
# rozjaśniona w stronę bieli o BIEL. Pasek bierzemy ze środka wysokości,
# żeby nie złapać podłogi ani cienia przy suficie.
pas = foto.crop((fw - round(fw * 0.08), round(H * 0.15), fw, round(H * 0.60)))
px = list(pas.getdata())
sr = tuple(sum(p[i] for p in px) // len(px) for i in range(3))
TLO = tuple(round(c + (255 - c) * BIEL) for c in sr)
print(f"  kolor ściany {sr} -> dolewka {TLO}")

im = Image.new("RGB", (W, H), TLO)
im.paste(foto, (0, 0))

# PRZEDŁUŻENIE KADRU. Fotografia zostaje nietknięta - gradient zaczyna się
# dokładnie tam, gdzie ona się kończy, i biegnie w prawo.
#
# Żeby na styku nie było widać kreski, obszar na prawo od zdjęcia dostaje
# najpierw kolor krawędzi kadru, liczony osobno dla każdego wiersza: ściana
# u góry, listwa przypodłogowa, podłoga na dole. Dzięki temu przy x = fw
# kolor zgadza się co do piksela i kadr po prostu biegnie dalej.
#
# Średnia z trzydziestu kolumn, nie z jednej - pojedyncza kolumna potrafi
# trafić w krawędź listwy na ścianie i rozciągnąć ją w poziomy pasek.
g0, g1 = fw, min(W, fw + round(W * GRAD_DL))
if g0 < W:
    kraw = foto.crop((fw - 30, 0, fw, H)).resize((1, H), Image.BOX)
    im.paste(kraw.resize((W - fw, H), Image.NEAREST), (fw, 0))
nak = Image.new("RGBA", (W, H), TLO + (0,))
d_nak = ImageDraw.Draw(nak)
for x in range(g0, min(g1, W)):
    t = (x - g0) / max(1, g1 - g0)
    a = round(255 * (t * t * (3 - 2 * t)))
    d_nak.line([(x, 0), (x, H)], fill=TLO + (a,))
if g1 < W:
    d_nak.rectangle([g1, 0, W, H], fill=TLO + (255,))
im = Image.alpha_composite(im.convert("RGBA"), nak).convert("RGB")

d = ImageDraw.Draw(im)
X = round(W * X_TEKST)
PRAWY = W - round(W * 0.05)
SZER = PRAWY - X


def zawin(tekst, font):
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


# Tytuł ma być duży. Zaczynamy wysoko i schodzimy, dopóki nie zmieści się
# w trzech linijkach o szerokości kolumny.
rozm = 210
while rozm > 70:
    f_tit = ser(rozm)
    if len(zawin(TITLE, f_tit)) <= 3 and max(
        (d.textlength(l, font=f_tit) for l in zawin(TITLE, f_tit)), default=0
    ) <= SZER:
        break
    rozm -= 5
f_tit = ser(rozm)
linie_tit = zawin(TITLE, f_tit)

r_tem = round(rozm * 0.33)
f_tem = ser(r_tem, "Medium")
linie_tem = zawin(TEMAT, f_tem) if TEMAT else []

krok_tit = round(rozm * 1.06)
krok_tem = round(r_tem * 1.35)
odstep = round(H * 0.055)

blok = len(linie_tit) * krok_tit + (odstep + len(linie_tem) * krok_tem if linie_tem else 0)
y = (H - blok) // 2 - round(H * 0.02)

for l in linie_tit:
    d.text((X, y), l, font=f_tit, fill=TEKST)
    y += krok_tit

if linie_tem:
    y += odstep
    # Krótka złota kreska - ten sam znak, który jest na grafice na posta.
    d.line([(X, y - round(odstep * 0.50)), (X + round(SZER * 0.16), y - round(odstep * 0.50))],
           fill=ZLOTO, width=3)
    for l in linie_tem:
        d.text((X, y), l, font=f_tem, fill=ZLOTO)
        y += krok_tem

if STOPKA:
    d.text((X, H - round(H * 0.085)), " ".join(STOPKA.upper()), font=sans(27, "Medium"), fill=SZARY)

im.save(out, quality=94)
print(f"  ✓ {W}x{H}, zdjęcie 0-{fw}, gradient {g0}-{g1}, tytuł {rozm}px w {len(linie_tit)} lin.")
