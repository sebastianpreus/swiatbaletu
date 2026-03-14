# Świat Baletu — Plan projektu dla Claude Code

## Cel
Portal o balecie i operze: artykuły, wywiady, repertuar teatrów, sylwetki artystów, ticker z aktualnościami, promocje i bilety. Elegancki design (jasny/ciemny motyw), złote akcenty, typografia Cormorant Garamond.

---

## Stack technologiczny

- **Framework**: Next.js 14 (App Router)
- **CMS**: Sanity v3 (treści redakcyjne)
- **Baza danych**: Supabase (PostgreSQL — repertuar, teatry, bilety)
- **Zdjęcia**: Sanity CDN (wbudowane)
- **Stylowanie**: Tailwind CSS
- **Hosting**: Vercel
- **Autentykacja do panelu**: NextAuth.js

---

## Lokalizacja repozytorium

Struktura na poziomie głównym projektu:

```
/
├── CLAUDE.md               # ← ten plik — instrukcje dla Claude Code
├── docs/
│   └── mockup.html         # ← wzorzec wizualny strony głównej (HTML demo)
└── repo/                   # ← cały kod Next.js tutaj
    ├── app/
    ├── components/
    ├── sanity/
    ├── lib/
    └── ...
```

Inicjując projekt Next.js:

```bash
mkdir repo && cd repo
npx create-next-app@latest . --typescript --tailwind --app
```

## Wzorzec wizualny

Plik `docs/mockup.html` zawiera gotowy HTML/CSS demo strony głównej portalu.
**Używaj go jako referencji wizualnej przy budowie komponentów** — nie konwertuj go bezpośrednio.
Buduj komponenty od zera zgodnie z architekturą Next.js, odwzorowując wygląd z mockupu.

Kluczowe decyzje designu z mockupu:
- Tło strony: `#FAFAF8`, karty: `#FFFFFF`
- Złote akcenty: `#A8832A` (jasny motyw), `#C9A84C` (ciemny motyw)
- Nagłówki: Cormorant Garamond (serif), body: DM Sans (sans-serif)
- Bordery: `0.5px solid rgba(0,0,0,0.08)` — bardzo subtelne
- Przełącznik jasny/ciemny przez CSS variables (`data-theme` na `<body>`)

---

## Struktura folderów

```
repo/
├── app/                          # Next.js App Router
│   ├── (portal)/                 # Strony publiczne
│   │   ├── page.tsx              # Strona główna
│   │   ├── artykuly/
│   │   │   ├── page.tsx          # Lista artykułów
│   │   │   └── [slug]/page.tsx   # Pojedynczy artykuł
│   │   ├── repertuar/
│   │   │   └── page.tsx
│   │   ├── sylwetki/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── wywiady/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── teatry/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── promocje/
│   │       └── page.tsx
│   ├── studio/                   # Panel Sanity (ukryty za loginem)
│   │   └── [[...tool]]/page.tsx
│   └── api/
│       ├── repertuar/route.ts
│       ├── ticker/route.ts
│       └── revalidate/route.ts   # Webhook Sanity → rewalidacja
│
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx
│   │   ├── Navigation.tsx
│   │   ├── Ticker.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── PromoBanner.tsx
│   │   ├── RepertoirePreview.tsx
│   │   ├── ArticlesGrid.tsx
│   │   └── ProfilesRow.tsx
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── ReadBtn.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── SectionHeader.tsx
│   │   └── AvatarCircle.tsx
│   └── portable-text/
│       └── PortableTextComponents.tsx  # Renderer treści Sanity
│
├── sanity/
│   ├── schemaTypes/              # SCHEMATY — patrz sekcja poniżej
│   │   ├── index.ts
│   │   ├── artykul.ts
│   │   ├── sylwetka.ts
│   │   ├── wywiad.ts
│   │   ├── teatr.ts
│   │   ├── ticker.ts
│   │   └── promocja.ts
│   ├── lib/
│   │   ├── client.ts             # Sanity client
│   │   ├── queries.ts            # GROQ queries
│   │   └── image.ts              # urlFor() helper
│   └── sanity.config.ts
│
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── queries/
│       ├── repertuar.ts
│       └── teatry.ts
│
├── types/
│   └── index.ts                  # TypeScript typy
│
├── styles/
│   └── globals.css               # Zmienne CSS, typografia
│
└── public/
    └── fonts/                    # Cormorant Garamond (opcjonalnie lokalnie)
```

---

## Schematy Sanity — wszystkie typy danych

### 1. Artykuł (`artykul.ts`)
```typescript
{
  name: 'artykul',
  title: 'Artykuł',
  type: 'document',
  fields: [
    { name: 'tytul',        type: 'string',   title: 'Tytuł' },
    { name: 'slug',         type: 'slug',     title: 'Slug URL',  options: { source: 'tytul' } },
    { name: 'kategoria',    type: 'string',   title: 'Kategoria',
      options: { list: ['Recenzja', 'Technika', 'Historia', 'Wywiad', 'Aktualności', 'Premiera'] } },
    { name: 'zajawka',      type: 'text',     title: 'Zajawka (lead)',  rows: 3 },
    { name: 'zdjecie',      type: 'image',    title: 'Zdjęcie główne',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Opis alternatywny' }] },
    { name: 'trescGlowna',  type: 'array',    title: 'Treść',
      of: [{ type: 'block' }, { type: 'image' }] },
    { name: 'autor',        type: 'string',   title: 'Autor' },
    { name: 'dataPublikacji', type: 'datetime', title: 'Data publikacji' },
    { name: 'featured',     type: 'boolean',  title: 'Na stronie głównej?' },
    { name: 'czasCzytania', type: 'number',   title: 'Czas czytania (minuty)' },
    { name: 'tagi',         type: 'array',    of: [{ type: 'string' }], title: 'Tagi' },
  ]
}
```

### 2. Sylwetka artysty (`sylwetka.ts`)
```typescript
{
  name: 'sylwetka',
  title: 'Sylwetka artysty',
  type: 'document',
  fields: [
    { name: 'imieNazwisko',  type: 'string',   title: 'Imię i nazwisko' },
    { name: 'slug',          type: 'slug',     options: { source: 'imieNazwisko' } },
    { name: 'rola',          type: 'string',   title: 'Rola/Funkcja',
      options: { list: ['Tancerz/ka', 'Primabalerina', 'Choreograf', 'Dyrygent', 'Dyrektor artystyczny', 'Kompozytor', 'Legenda'] } },
    { name: 'zdjecie',       type: 'image',    title: 'Zdjęcie', options: { hotspot: true } },
    { name: 'teatrGlowny',   type: 'string',   title: 'Teatr / Zespół' },
    { name: 'narodowosc',    type: 'string',   title: 'Narodowość' },
    { name: 'dataUrodzenia', type: 'date',     title: 'Data urodzenia' },
    { name: 'dataSmierci',   type: 'date',     title: 'Data śmierci (jeśli dotyczy)' },
    { name: 'bio',           type: 'array',    of: [{ type: 'block' }], title: 'Biografia' },
    { name: 'najwazniejszeRole', type: 'array', of: [{ type: 'string' }], title: 'Najważniejsze role' },
    { name: 'aktywny',       type: 'boolean',  title: 'Aktywny artysta?', initialValue: true },
    { name: 'polskiArtysta', type: 'boolean',  title: 'Polski artysta?', initialValue: false },
    { name: 'wyroznienie',   type: 'boolean',  title: 'Wyróżniony na stronie głównej?' },
  ]
}
```

### 3. Wywiad (`wywiad.ts`)
```typescript
{
  name: 'wywiad',
  title: 'Wywiad',
  type: 'document',
  fields: [
    { name: 'tytul',        type: 'string',   title: 'Tytuł wywiadu' },
    { name: 'slug',         type: 'slug',     options: { source: 'tytul' } },
    { name: 'rozmowca',     type: 'reference', to: [{ type: 'sylwetka' }], title: 'Rozmówca' },
    { name: 'funkcjaRozmowcy', type: 'string', title: 'Funkcja w momencie wywiadu' },
    { name: 'zajawka',      type: 'text',     title: 'Lead', rows: 3 },
    { name: 'zdjecie',      type: 'image',    title: 'Zdjęcie', options: { hotspot: true } },
    { name: 'tresc',        type: 'array',    of: [{ type: 'block' }], title: 'Treść wywiadu' },
    { name: 'dataPublikacji', type: 'datetime', title: 'Data publikacji' },
    { name: 'wywiadTygodnia', type: 'boolean', title: 'Wywiad tygodnia?' },
  ]
}
```

### 4. Teatr (`teatr.ts`)
```typescript
{
  name: 'teatr',
  title: 'Teatr',
  type: 'document',
  fields: [
    { name: 'nazwa',        type: 'string',   title: 'Nazwa teatru' },
    { name: 'slug',         type: 'slug',     options: { source: 'nazwa' } },
    { name: 'miasto',       type: 'string',   title: 'Miasto',
      options: { list: ['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Łódź', 'Inne'] } },
    { name: 'adres',        type: 'string',   title: 'Adres' },
    { name: 'rokZalozenia', type: 'number',   title: 'Rok założenia' },
    { name: 'dyrektorArtystyczny', type: 'string', title: 'Dyrektor artystyczny' },
    { name: 'liczbaMiejsc', type: 'number',   title: 'Liczba miejsc (sala główna)' },
    { name: 'logo',         type: 'image',    title: 'Logo' },
    { name: 'zdjecie',      type: 'image',    title: 'Zdjęcie budynku', options: { hotspot: true } },
    { name: 'opis',         type: 'array',    of: [{ type: 'block' }], title: 'Opis' },
    { name: 'stronaWww',    type: 'url',      title: 'Strona WWW' },
    { name: 'linkBilety',   type: 'url',      title: 'Link do kasy biletowej' },
  ]
}
```

### 5. Ticker — pasek "Na żywo" (`ticker.ts`)
```typescript
{
  name: 'ticker',
  title: 'Ticker (pasek na żywo)',
  type: 'document',
  fields: [
    { name: 'tresc',        type: 'string',   title: 'Treść komunikatu',
      description: 'Maks. 120 znaków' },
    { name: 'link',         type: 'url',      title: 'Link (opcjonalnie)' },
    { name: 'aktywny',      type: 'boolean',  title: 'Aktywny?', initialValue: true },
    { name: 'kolejnosc',    type: 'number',   title: 'Kolejność wyświetlania' },
    { name: 'dataWygasniecia', type: 'datetime', title: 'Data wygaśnięcia (opcjonalnie)',
      description: 'Zostaw puste jeśli komunikat jest bezterminowy' },
    { name: 'typ',          type: 'string',   title: 'Typ',
      options: { list: ['info', 'premiera', 'transmisja', 'promocja', 'pilne'] } },
  ],
  orderings: [{ title: 'Kolejność', by: [{ field: 'kolejnosc', direction: 'asc' }] }]
}
```

### 6. Promocja (`promocja.ts`)
```typescript
{
  name: 'promocja',
  title: 'Promocja / Oferta specjalna',
  type: 'document',
  fields: [
    { name: 'tytul',        type: 'string',   title: 'Tytuł promocji' },
    { name: 'etykieta',     type: 'string',   title: 'Etykieta (np. "🔥 Tylko do niedzieli")' },
    { name: 'opis',         type: 'text',     title: 'Opis', rows: 2 },
    { name: 'kod',          type: 'string',   title: 'Kod rabatowy (opcjonalnie)' },
    { name: 'linkDoOferty', type: 'url',      title: 'Link do oferty / kasy biletowej' },
    { name: 'aktywna',      type: 'boolean',  title: 'Aktywna?', initialValue: true },
    { name: 'naStrGlownej', type: 'boolean',  title: 'Pokaż na stronie głównej?' },
    { name: 'dataOd',       type: 'datetime', title: 'Ważna od' },
    { name: 'dataDo',       type: 'datetime', title: 'Ważna do' },
    { name: 'teatr',        type: 'reference', to: [{ type: 'teatr' }], title: 'Powiązany teatr' },
  ]
}
```

---

## Tabele Supabase (PostgreSQL)

### Tabela `spektakle` — repertuar
```sql
CREATE TABLE spektakle (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tytul       text NOT NULL,
  kompozytor  text,
  choreograf  text,
  teatr_id    uuid REFERENCES teatry(id),
  opis        text,
  zdjecie_url text,          -- URL z Sanity lub Cloudflare
  created_at  timestamptz DEFAULT now()
);
```

### Tabela `teatry`
```sql
CREATE TABLE teatry (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa    text NOT NULL,
  miasto   text NOT NULL,
  slug     text UNIQUE,
  www      text,
  bilety   text            -- link do kasy biletowej
);
```

### Tabela `przedstawienia` — konkretne daty spektakli
```sql
CREATE TABLE przedstawienia (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spektakl_id  uuid REFERENCES spektakle(id) ON DELETE CASCADE,
  teatr_id     uuid REFERENCES teatry(id),
  data_czas    timestamptz NOT NULL,
  link_bilety  text,
  dostepnosc   text CHECK (dostepnosc IN ('dostepne', 'malo_miejsc', 'wyprzedane', 'premiera')),
  cena_od      integer,     -- cena w groszach
  notatka      text         -- np. "obsada premierowa", "gościnnie: X"
);
```

### Tabela `obsady` — kto tańczy w czym
```sql
CREATE TABLE obsady (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  przedstawienie_id uuid REFERENCES przedstawienia(id) ON DELETE CASCADE,
  imie_nazwisko     text NOT NULL,
  rola              text NOT NULL,    -- "Odette/Odile", "Książę Zygfryd"
  sanity_sylwetka_id text             -- ID dokumentu w Sanity (opcjonalne powiązanie)
);
```

---

## Queries GROQ (Sanity)

Plik `sanity/lib/queries.ts`:

```typescript
// Artykuły na stronę główną
export const FEATURED_ARTICLES_QUERY = `
  *[_type == "artykul" && featured == true] | order(dataPublikacji desc) [0..2] {
    _id, tytul, slug, kategoria, zajawka, czasCzytania,
    zdjecie { asset->{ url }, alt },
    dataPublikacji, autor
  }
`

// Wywiad tygodnia
export const WYWIAD_TYGODNIA_QUERY = `
  *[_type == "wywiad" && wywiadTygodnia == true] | order(dataPublikacji desc) [0] {
    _id, tytul, slug, zajawka, dataPublikacji,
    zdjecie { asset->{ url }, alt },
    rozmowca->{ imieNazwisko, rola, teatrGlowny }
  }
`

// Ticker — tylko aktywne, posortowane, niewygas³e
export const TICKER_QUERY = `
  *[_type == "ticker" && aktywny == true && (
    !defined(dataWygasniecia) || dataWygasniecia > now()
  )] | order(kolejnosc asc) {
    _id, tresc, link, typ
  }
`

// Sylwetki wyróżnione
export const FEATURED_PROFILES_QUERY = `
  *[_type == "sylwetka" && wyroznienie == true] | order(imieNazwisko asc) [0..7] {
    _id, imieNazwisko, slug, rola, teatrGlowny, aktywny,
    zdjecie { asset->{ url }, alt }
  }
`

// Promocje aktywne na stronie głównej
export const ACTIVE_PROMOS_QUERY = `
  *[_type == "promocja" && aktywna == true && naStrGlownej == true && (
    !defined(dataDo) || dataDo > now()
  )] | order(_createdAt desc) [0..2] {
    _id, tytul, etykieta, opis, kod, linkDoOferty,
    teatr->{ nazwa, miasto }
  }
`
```

---

## Zmienne środowiskowe — plik `.env.local`

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=twoj_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=twoj_token_z_sanity_manage

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj_anon_key
SUPABASE_SERVICE_ROLE_KEY=twoj_service_key

# NextAuth (do panelu /studio)
NEXTAUTH_SECRET=wygeneruj_losowy_string
NEXTAUTH_URL=http://localhost:3000
```

---

## Kolejność budowy — fazy

### Faza 1 — Fundamenty (tydzień 1)
1. Projekt już zainicjowany — `docs/mockup.html` i `CLAUDE.md` są w repo
2. `cd repo && npx create-next-app@latest . --typescript --tailwind --app`
3. Instalacja Sanity: `npx sanity@latest init`
4. Stworzenie wszystkich 6 schematów Sanity
5. Połączenie z Supabase — tabele + seed data (kilka teatrów, kilka spektakli)
6. Deploy na Vercel + podpięcie domeny

### Faza 2 — Strona główna (tydzień 2)
1. Komponenty layout: TopBar, Navigation, Ticker, Footer
2. ThemeToggle (jasny/ciemny) z CSS variables
3. HeroSection (wywiad tygodnia z Sanity)
4. PromoBanner (z Sanity)
5. RepertoirePreview (z Supabase)
6. ArticlesGrid (z Sanity)
7. ProfilesRow (z Sanity)

### Faza 3 — Podstrony (tydzień 3)
1. `/artykuly` — lista + pojedynczy artykuł z PortableText
2. `/repertuar` — pełna lista z filtrowaniem po mieście
3. `/sylwetki` — grid + profil artysty
4. `/wywiady` — lista + pojedynczy wywiad
5. `/teatry` — lista + strona teatru z repertuarem
6. `/promocje` — lista aktywnych ofert

### Faza 4 — Panel i szczegóły (tydzień 4)
1. Panel Sanity pod `/studio` (gotowy out-of-the-box)
2. Rewalidacja strony po publikacji w Sanity (webhook)
3. SEO: meta tagi, OpenGraph, sitemap.xml
4. Responsywność mobilna
5. Testy i optymalizacja

---

## Instrukcje startowe dla Claude Code

> **Dla Claude Code:** Po wczytaniu tego pliku wykonaj poniższe kroki samodzielnie, bez pytania o potwierdzenie każdego z nich. Raportuj postępy po każdym ukończonym kroku.

### Krok 1 — Zapoznaj się z projektem

Przeczytaj ten plik (`CLAUDE.md`) w całości. Zapoznaj się z wzorcem wizualnym w `docs/mockup.html` — otwórz go i przeanalizuj strukturę, komponenty, kolory i typografię. Będzie to Twoja referencja przy budowie każdego komponentu.

### Krok 2 — Przygotuj repozytorium GitHub

Repozytorium ma się nazywać `swiatbaletu`. Wykonaj:

```bash
git init
git add CLAUDE.md docs/
git commit -m "init: CLAUDE.md i mockup wizualny"
```

Następnie utwórz repozytorium na GitHub i wypchnij:

```bash
gh repo create swiatbaletu --public --push --source=.
```

(jeśli `gh` nie jest dostępne, użyj `git remote add origin` z adresem repo i `git push -u origin main`)

### Krok 3 — Zainicjuj projekt Next.js w folderze repo/

```bash
mkdir repo && cd repo
npx create-next-app@latest . --typescript --tailwind --app --no-git
```

Flaga `--no-git` jest ważna — git już istnieje poziom wyżej.

### Krok 4 — Zainstaluj Sanity

```bash
npx sanity@latest init --env
```

Podczas inicjalizacji:
- Dataset: `production`
- Projekt: `swiatbaletu`
- Szablon: `clean`

### Krok 5 — Stwórz wszystkie schematy Sanity

Na podstawie sekcji "Schematy Sanity" w tym pliku stwórz pliki:
`repo/sanity/schemaTypes/artykul.ts`, `sylwetka.ts`, `wywiad.ts`, `teatr.ts`, `ticker.ts`, `promocja.ts`
oraz zaktualizuj `repo/sanity/schemaTypes/index.ts` żeby eksportował wszystkie typy.

### Krok 6 — Skonfiguruj klientów (Sanity + Supabase)

Stwórz pliki:
- `repo/sanity/lib/client.ts` — klient Sanity z zmiennymi środowiskowymi
- `repo/sanity/lib/image.ts` — helper `urlFor()`
- `repo/sanity/lib/queries.ts` — wszystkie GROQ queries z sekcji w tym pliku
- `repo/lib/supabase.ts` — klient Supabase

### Krok 7 — Stwórz plik zmiennych środowiskowych

Stwórz `repo/.env.local` z placeholderami ze sekcji "Zmienne środowiskowe" w tym pliku.
Stwórz też `repo/.env.example` — identyczny plik ale z opisami, do commitowania.
Dodaj `repo/.env.local` do `repo/.gitignore`.

### Krok 8 — Initial commit całości

```bash
cd ..   # wróć do głównego folderu
git add repo/
git commit -m "feat: inicjalizacja Next.js, schematy Sanity, konfiguracja klientów"
git push
```

### Krok 9 — Raport

Po zakończeniu podaj:
- Link do repozytorium na GitHub
- Listę stworzonych plików
- Czy są jakieś kroki które wymagają ręcznej interwencji (np. wpisanie kluczy API)

---

## Notatki architektoniczne

**Sanity vs Supabase — podział odpowiedzialności:**
- Sanity: wszystko co redaktor pisze i edytuje (artykuły, sylwetki, wywiady, ticker, promocje)
- Supabase: wszystko co ma strukturę danych i relacje (repertuar, teatry, daty, obsady, bilety)

**Renderowanie:**
- Strona główna: SSR (server-side rendering) — świeże dane przy każdym żądaniu
- Artykuły, sylwetki: ISR (incremental static regeneration) — cache 60 min, revalidacja przez webhook Sanity
- Repertuar: SSR z cache 15 min — dane zmieniają się rzadziej

**SEO:**
- Każda strona ma własne metadata (tytuł, opis, OpenGraph)
- `/sitemap.xml` generowany dynamicznie z Sanity + Supabase
- Structured data (JSON-LD) dla spektakli i artykułów

---

*Plan wygenerowany: 14 marca 2026 — Świat Baletu v1.0*
