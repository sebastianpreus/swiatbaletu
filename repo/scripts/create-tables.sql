-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/bbbserwmhjynrfrpcwso/sql)

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
