/**
 * Seed script for Supabase — creates tables and inserts repertoire data
 * Run: node repo/scripts/seed-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── 1. Create tables via SQL ──────────────────────────────────────────────

const createTablesSql = `
-- Teatry
CREATE TABLE IF NOT EXISTS teatry (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa    text NOT NULL,
  miasto   text NOT NULL,
  slug     text UNIQUE,
  www      text,
  bilety   text
);

-- Spektakle
CREATE TABLE IF NOT EXISTS spektakle (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tytul       text NOT NULL,
  kompozytor  text,
  choreograf  text,
  teatr_id    uuid REFERENCES teatry(id),
  opis        text,
  zdjecie_url text,
  created_at  timestamptz DEFAULT now()
);

-- Przedstawienia
CREATE TABLE IF NOT EXISTS przedstawienia (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spektakl_id  uuid REFERENCES spektakle(id) ON DELETE CASCADE,
  teatr_id     uuid REFERENCES teatry(id),
  data_czas    timestamptz NOT NULL,
  link_bilety  text,
  dostepnosc   text CHECK (dostepnosc IN ('dostepne', 'malo_miejsc', 'wyprzedane', 'premiera')),
  cena_od      integer,
  notatka      text
);

-- Obsady
CREATE TABLE IF NOT EXISTS obsady (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  przedstawienie_id uuid REFERENCES przedstawienia(id) ON DELETE CASCADE,
  imie_nazwisko     text NOT NULL,
  rola              text NOT NULL,
  sanity_sylwetka_id text
);
`

console.log('Note: Tables must be created via Supabase SQL Editor. Proceeding to insert data...')

// ── 2. Seed Teatry ────────────────────────────────────────────────────────

const teatry = [
  { nazwa: 'Teatr Wielki — Opera Narodowa', miasto: 'Warszawa', slug: 'teatr-wielki-warszawa', www: 'https://teatrwielki.pl', bilety: 'https://teatrwielki.pl/bilety' },
  { nazwa: 'Opera Krakowska', miasto: 'Kraków', slug: 'opera-krakowska', www: 'https://opera.krakow.pl', bilety: 'https://opera.krakow.pl/bilety' },
  { nazwa: 'Opera Wrocławska', miasto: 'Wrocław', slug: 'opera-wroclawska', www: 'https://opera.wroclaw.pl', bilety: 'https://opera.wroclaw.pl/bilety' },
  { nazwa: 'Opera Bałtycka', miasto: 'Gdańsk', slug: 'opera-baltycka', www: 'https://operabaltycka.pl', bilety: 'https://operabaltycka.pl/bilety' },
  { nazwa: 'Teatr Wielki w Łodzi', miasto: 'Łódź', slug: 'teatr-wielki-lodz', www: 'https://operalodz.com', bilety: 'https://operalodz.com/bilety' },
  { nazwa: 'Teatr Wielki w Poznaniu', miasto: 'Poznań', slug: 'teatr-wielki-poznan', www: 'https://opera.poznan.pl', bilety: 'https://opera.poznan.pl/bilety' },
]

console.log('Inserting teatry...')
const { data: insertedTeatry, error: teatryErr } = await supabase
  .from('teatry')
  .upsert(teatry, { onConflict: 'slug' })
  .select()

if (teatryErr) {
  console.error('Error inserting teatry:', teatryErr.message)
  console.log('Tables might not exist yet. Please run the SQL from CLAUDE.md in Supabase SQL Editor first.')
  process.exit(1)
}

console.log(`Inserted ${insertedTeatry.length} teatry`)

// Build slug→id map
const teatrMap = {}
for (const t of insertedTeatry) {
  teatrMap[t.slug] = t.id
}

// ── 3. Seed Spektakle ─────────────────────────────────────────────────────

const spektakle = [
  { tytul: 'Jezioro Łabędzie', kompozytor: 'Piotr Czajkowski', choreograf: 'Marius Petipa / Lew Iwanow', teatr_id: teatrMap['teatr-wielki-warszawa'] },
  { tytul: 'Spartakus', kompozytor: 'Aram Chaczaturian', choreograf: 'Jurij Grigorowicz', teatr_id: teatrMap['opera-krakowska'] },
  { tytul: 'Giselle', kompozytor: 'Adolphe Adam', choreograf: 'Jean Coralli / Jules Perrot', teatr_id: teatrMap['opera-wroclawska'] },
  { tytul: 'Wieczór Béjarta — Bolero', kompozytor: 'Maurice Ravel', choreograf: 'Maurice Béjart', teatr_id: teatrMap['opera-baltycka'] },
  { tytul: 'Dziadek do orzechów', kompozytor: 'Piotr Czajkowski', choreograf: 'Lew Iwanow', teatr_id: teatrMap['teatr-wielki-lodz'] },
  { tytul: 'Romeo i Julia', kompozytor: 'Siergiej Prokofiew', choreograf: 'Kenneth MacMillan', teatr_id: teatrMap['teatr-wielki-poznan'] },
  { tytul: 'Don Kichot', kompozytor: 'Ludwig Minkus', choreograf: 'Marius Petipa', teatr_id: teatrMap['teatr-wielki-warszawa'] },
  { tytul: 'La Bayadère', kompozytor: 'Ludwig Minkus', choreograf: 'Marius Petipa', teatr_id: teatrMap['opera-krakowska'] },
  { tytul: 'Kopciuszek', kompozytor: 'Siergiej Prokofiew', choreograf: 'Frederick Ashton', teatr_id: teatrMap['opera-wroclawska'] },
  { tytul: 'Coppélia', kompozytor: 'Léo Delibes', choreograf: 'Arthur Saint-Léon', teatr_id: teatrMap['opera-baltycka'] },
]

console.log('Inserting spektakle...')
const { data: insertedSpektakle, error: spektakleErr } = await supabase
  .from('spektakle')
  .insert(spektakle)
  .select()

if (spektakleErr) {
  console.error('Error inserting spektakle:', spektakleErr.message)
  process.exit(1)
}

console.log(`Inserted ${insertedSpektakle.length} spektakle`)

// Build title→id map
const spektaklMap = {}
for (const s of insertedSpektakle) {
  spektaklMap[s.tytul] = s.id
}

// ── 4. Seed Przedstawienia ────────────────────────────────────────────────

const now = new Date()
const day = (offset) => {
  const d = new Date(now)
  d.setDate(d.getDate() + offset)
  d.setHours(19, 0, 0, 0)
  return d.toISOString()
}

const przedstawienia = [
  // Jezioro Łabędzie — Warszawa
  { spektakl_id: spektaklMap['Jezioro Łabędzie'], teatr_id: teatrMap['teatr-wielki-warszawa'], data_czas: day(3), dostepnosc: 'malo_miejsc', cena_od: 8000, notatka: 'Obsada premierowa' },
  { spektakl_id: spektaklMap['Jezioro Łabędzie'], teatr_id: teatrMap['teatr-wielki-warszawa'], data_czas: day(4), dostepnosc: 'dostepne', cena_od: 7000 },
  { spektakl_id: spektaklMap['Jezioro Łabędzie'], teatr_id: teatrMap['teatr-wielki-warszawa'], data_czas: day(5), dostepnosc: 'dostepne', cena_od: 7000 },
  // Spartakus — Kraków PREMIERA
  { spektakl_id: spektaklMap['Spartakus'], teatr_id: teatrMap['opera-krakowska'], data_czas: day(7), dostepnosc: 'premiera', cena_od: 9000, notatka: 'Premiera sezonu!' },
  { spektakl_id: spektaklMap['Spartakus'], teatr_id: teatrMap['opera-krakowska'], data_czas: day(8), dostepnosc: 'dostepne', cena_od: 7500 },
  { spektakl_id: spektaklMap['Spartakus'], teatr_id: teatrMap['opera-krakowska'], data_czas: day(9), dostepnosc: 'dostepne', cena_od: 7500 },
  // Giselle — Wrocław
  { spektakl_id: spektaklMap['Giselle'], teatr_id: teatrMap['opera-wroclawska'], data_czas: day(8), dostepnosc: 'dostepne', cena_od: 6000 },
  { spektakl_id: spektaklMap['Giselle'], teatr_id: teatrMap['opera-wroclawska'], data_czas: day(9), dostepnosc: 'dostepne', cena_od: 6000 },
  { spektakl_id: spektaklMap['Giselle'], teatr_id: teatrMap['opera-wroclawska'], data_czas: day(10), dostepnosc: 'malo_miejsc', cena_od: 6500 },
  // Wieczór Béjarta — Gdańsk
  { spektakl_id: spektaklMap['Wieczór Béjarta — Bolero'], teatr_id: teatrMap['opera-baltycka'], data_czas: day(10), dostepnosc: 'dostepne', cena_od: 5500 },
  // Dziadek do orzechów — Łódź
  { spektakl_id: spektaklMap['Dziadek do orzechów'], teatr_id: teatrMap['teatr-wielki-lodz'], data_czas: day(14), dostepnosc: 'dostepne', cena_od: 5000 },
  { spektakl_id: spektaklMap['Dziadek do orzechów'], teatr_id: teatrMap['teatr-wielki-lodz'], data_czas: day(15), dostepnosc: 'dostepne', cena_od: 5000 },
  // Romeo i Julia — Poznań
  { spektakl_id: spektaklMap['Romeo i Julia'], teatr_id: teatrMap['teatr-wielki-poznan'], data_czas: day(12), dostepnosc: 'dostepne', cena_od: 6500 },
  { spektakl_id: spektaklMap['Romeo i Julia'], teatr_id: teatrMap['teatr-wielki-poznan'], data_czas: day(13), dostepnosc: 'dostepne', cena_od: 6500 },
  // Don Kichot — Warszawa
  { spektakl_id: spektaklMap['Don Kichot'], teatr_id: teatrMap['teatr-wielki-warszawa'], data_czas: day(17), dostepnosc: 'dostepne', cena_od: 7500 },
  { spektakl_id: spektaklMap['Don Kichot'], teatr_id: teatrMap['teatr-wielki-warszawa'], data_czas: day(18), dostepnosc: 'dostepne', cena_od: 7500 },
  // La Bayadère — Kraków
  { spektakl_id: spektaklMap['La Bayadère'], teatr_id: teatrMap['opera-krakowska'], data_czas: day(20), dostepnosc: 'dostepne', cena_od: 8000 },
  // Kopciuszek — Wrocław
  { spektakl_id: spektaklMap['Kopciuszek'], teatr_id: teatrMap['opera-wroclawska'], data_czas: day(21), dostepnosc: 'dostepne', cena_od: 5500 },
  { spektakl_id: spektaklMap['Kopciuszek'], teatr_id: teatrMap['opera-wroclawska'], data_czas: day(22), dostepnosc: 'dostepne', cena_od: 5500 },
  // Coppélia — Gdańsk
  { spektakl_id: spektaklMap['Coppélia'], teatr_id: teatrMap['opera-baltycka'], data_czas: day(25), dostepnosc: 'dostepne', cena_od: 5000 },
]

console.log('Inserting przedstawienia...')
const { data: insertedPrzedstawienia, error: przedstawieniaErr } = await supabase
  .from('przedstawienia')
  .insert(przedstawienia)
  .select()

if (przedstawieniaErr) {
  console.error('Error inserting przedstawienia:', przedstawieniaErr.message)
  process.exit(1)
}

console.log(`Inserted ${insertedPrzedstawienia.length} przedstawienia`)

// ── 5. Seed Obsady ────────────────────────────────────────────────────────

const obsady = [
  // Jezioro Łabędzie — first show
  { przedstawienie_id: insertedPrzedstawienia[0].id, imie_nazwisko: 'Yuka Ebihara', rola: 'Odette / Odile' },
  { przedstawienie_id: insertedPrzedstawienia[0].id, imie_nazwisko: 'Dawid Trzensimiech', rola: 'Książę Zygfryd' },
  // Spartakus premiera
  { przedstawienie_id: insertedPrzedstawienia[3].id, imie_nazwisko: 'Maksym Wojtiul', rola: 'Spartakus' },
  { przedstawienie_id: insertedPrzedstawienia[3].id, imie_nazwisko: 'Anna Hop', rola: 'Frygia' },
  // Giselle
  { przedstawienie_id: insertedPrzedstawienia[6].id, imie_nazwisko: 'Marta Fiedler', rola: 'Giselle' },
  { przedstawienie_id: insertedPrzedstawienia[6].id, imie_nazwisko: 'Robert Bondara', rola: 'Albrecht' },
]

console.log('Inserting obsady...')
const { data: insertedObsady, error: obsadyErr } = await supabase
  .from('obsady')
  .insert(obsady)
  .select()

if (obsadyErr) {
  console.error('Error inserting obsady:', obsadyErr.message)
} else {
  console.log(`Inserted ${insertedObsady.length} obsady`)
}

console.log('\nDone! Supabase seeded with repertoire data.')
