-- Blokada duplikatów w tabeli `spektakle`.
--
-- Kontekst: ensureSpektakl() w scrape-repertuar.mjs gubił błąd PGRST116
-- z .maybeSingle() i przy każdym z 18 dziennych przebiegów dokładał kolejny
-- wiersz o tym samym (tytul, teatr_id). Do 31.08.2026 urosło 2485 nadmiarowych
-- wierszy na 3004. Kod jest naprawiony, a dane wyczyszczone przez
-- scripts/dedupe-spektakle.mjs, ale sam kod to za słabe zabezpieczenie -
-- ten indeks czyni ponowne wystąpienie problemu niemożliwym.
--
-- Uruchomić raz, w Supabase SQL Editor.
-- Warunek wstępny: zero duplikatów (dedupe-spektakle.mjs musi przejść wcześniej).

-- Kontrola przed założeniem indeksu - musi zwrócić zero wierszy.
SELECT teatr_id, tytul, count(*)
FROM spektakle
GROUP BY teatr_id, tytul
HAVING count(*) > 1;

-- Właściwe zabezpieczenie.
CREATE UNIQUE INDEX IF NOT EXISTS spektakle_teatr_tytul_uniq
  ON spektakle (teatr_id, tytul);

-- Od tej pory powtórzony INSERT kończy się błędem 23505 zamiast cichego
-- dorzucenia duplikatu. ensureSpektakl() i tak najpierw szuka istniejącego
-- wiersza, więc normalna praca scrapera tego nie dotknie.
