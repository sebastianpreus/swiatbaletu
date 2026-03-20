-- Tabela subskrybentów newslettera
-- Uruchom ten SQL w Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS subscribers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text NOT NULL UNIQUE,
  imie             text,
  aktywny          boolean DEFAULT true,
  token_wypisania  text,
  data_zapisu      timestamptz DEFAULT now(),
  data_wypisania   timestamptz,
  data_reaktywacji timestamptz
);

-- Indeks na email (szybkie wyszukiwanie)
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Indeks na aktywnych (do wysyłki)
CREATE INDEX IF NOT EXISTS idx_subscribers_aktywni ON subscribers(aktywny) WHERE aktywny = true;

-- RLS (Row Level Security) — wyłącz dla service role, włącz dla anon
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Pozwól anonowym użytkownikom tylko na INSERT (zapis na newsletter)
CREATE POLICY "Zapis na newsletter" ON subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Service role ma pełny dostęp (do wysyłki, wypisywania itp.)
CREATE POLICY "Service role full access" ON subscribers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
