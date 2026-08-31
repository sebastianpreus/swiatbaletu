-- Blokada duplikatów w tabeli `spektakle`.
--
-- Kontekst: dwa niezależne mechanizmy tworzyły duplikaty.
--   1. ensureSpektakl() gubił błąd PGRST116 z .maybeSingle() i przy każdym
--      z 18 dziennych przebiegów dokładał kolejny identyczny wiersz -
--      do 31.08.2026 urosło 2485 nadmiarowych wierszy na 3004.
--   2. Teatry publikują ten sam tytuł niekonsekwentnie ("AMERYKANIN W PARYŻU"
--      vs "Amerykanin w Paryżu"), a porównanie dosłowne robiło z tego dwa
--      spektakle - 12 takich par.
--
-- Kod jest naprawiony (scrape-repertuar.mjs), dane wyczyszczone
-- (dedupe-spektakle.mjs), ale sam kod to za słabe zabezpieczenie.
-- Ten indeks czyni nawrót niemożliwym.
--
-- Uruchomić raz, w Supabase SQL Editor.

-- Normalizacja MUSI odpowiadać normTytul() w scrape-repertuar.mjs
-- i dedupe-spektakle.mjs:
--   t.toLowerCase().replace(/[„”"'’]/g, '').replace(/\s+/g, ' ').trim()

-- Kontrola przed założeniem indeksu - musi zwrócić zero wierszy.
SELECT teatr_id,
       btrim(regexp_replace(regexp_replace(lower(tytul), '[„”"''’]', '', 'g'), '\s+', ' ', 'g')) AS tytul_norm,
       count(*)
FROM spektakle
GROUP BY 1, 2
HAVING count(*) > 1;

-- Właściwe zabezpieczenie. lower(), regexp_replace() i btrim() są IMMUTABLE,
-- więc nadają się na indeks funkcyjny.
CREATE UNIQUE INDEX IF NOT EXISTS spektakle_teatr_tytul_norm_uniq
  ON spektakle (
    teatr_id,
    btrim(regexp_replace(regexp_replace(lower(tytul), '[„”"''’]', '', 'g'), '\s+', ' ', 'g'))
  );

-- Od tej pory powtórzony INSERT kończy się błędem 23505 zamiast cichego
-- dorzucenia duplikatu. ensureSpektakl() i tak najpierw sprawdza mapę
-- istniejących spektakli teatru, więc normalna praca scrapera tego nie dotknie.
