# Świat Baletu — aplikacja mobilna (BRIEF startowy)

> Ten plik to pakiet startowy dla nowego projektu Claude Code.
> Skopiuj go do folderu nowego projektu (np. `C:\Users\Sebastian\CLAUDE\SwiatBaletuApp\`)
> i użyj jako fundament `CLAUDE.md`. Zawiera pełny kontekst ekosystemu Świat Baletu.

---

## 1. Co budujemy

Aplikacja mobilna **Świat Baletu** na Android i iOS. Towarzyszy portalowi
**https://swiatbaletu.pl** (Next.js + Sanity + Supabase, hosting Vercel).

Główne funkcje (wg priorytetu — patrz roadmapa w sekcji 7):
1. **Repertuar** polskich teatrów operowych/baletowych — przegląd, filtry (miasto, miesiąc, dostępność), szczegóły spektaklu, link do biletów.
2. **Przypomnienia** — użytkownik oznacza spektakle, na które ma bilety; apka przypomina przed terminem (powiadomienia lokalne).
3. **Alerty dostępności** (przyszłość) — powiadomienie push, gdy na wyprzedany spektakl wrócą miejsca.
4. **Nowości z portalu** — zajawki artykułów/wywiadów z linkami do strony.
5. **Quizy** — pytania ze świata baletu (lekki, angażujący content).

## 2. Ekosystem — co już istnieje i gdzie

| Element | Technologia | Rola dla apki |
|---|---|---|
| Portal swiatbaletu.pl | Next.js 16 (repo: `C:\Users\Sebastian\CLAUDE\SwiatBaletu\repo`) | źródło linków, design wzorcowy |
| Baza repertuarów | **Supabase (PostgreSQL)** | apka czyta bezpośrednio (klucz anon) |
| Treści redakcyjne | **Sanity v3** (projectId `nri4izo1`, dataset `production`) | apka czyta artykuły (publiczne API) |
| Scraper repertuarów | Node + GitHub Actions, **co godzinę** (cron `7 5-22 * * *` UTC), 10 teatrów, tryb `--clean-future` | dane w Supabase zawsze świeże; apka NIE scrapuje niczego sama |

**Ważne:** apka jest klientem tych samych danych co portal. Nie duplikujemy backendu.
Zmiany w bazie (nowe tabele, RLS, push serwerowy) robimy w projekcie portalu — nie tutaj.

## 3. Rekomendowany stack

- **Expo (React Native) + TypeScript** — jeden kod na Android/iOS, spójny z web-stackiem.
- **expo-router** (nawigacja), **@supabase/supabase-js** (dane), **expo-notifications** (przypomnienia lokalne; później push przez Expo Push Service).
- **EAS Build** do budowania pod sklepy (iOS bez posiadania Maca — build w chmurze).
- Testy na telefonie w trakcie developmentu: **Expo Go**.
- Stan/cache zapytań: TanStack Query (react-query) — dane repertuarowe świetnie się cache'ują.

## 4. Dane — Supabase (repertuar)

### Połączenie
Zmienne (wartości skopiuj z `repo/.env.local` portalu — poproś użytkownika):
```
EXPO_PUBLIC_SUPABASE_URL=...        # = NEXT_PUBLIC_SUPABASE_URL z portalu
EXPO_PUBLIC_SUPABASE_ANON_KEY=...   # = NEXT_PUBLIC_SUPABASE_ANON_KEY z portalu
```
**ZAKAZ:** `SUPABASE_SERVICE_ROLE_KEY` nigdy nie trafia do aplikacji mobilnej
(klucz omija RLS; w apce byłby do wyciągnięcia z bundle'a).

### Schemat tabel (stan faktyczny, zweryfikowany)

**`teatry`** — 10 teatrów:
- `id` uuid PK, `nazwa` text, `miasto` text, `slug` text unique, `www`, `bilety`
- Miasta: Warszawa, Kraków, Wrocław, Gdańsk, Poznań, Łódź, Bydgoszcz, Szczecin, Bytom, Lublin
- Slugi np.: `teatr-wielki-warszawa`, `opera-baltycka`, `opera-wroclawska`, `teatr-wielki-lodz`, `opera-nova-bydgoszcz`, `teatr-wielki-poznan`, `opera-krakowska`, `opera-na-zamku-szczecin`, `opera-slaska-bytom`, `opera-lubelska`

**`spektakle`** — tytuły (dzieła):
- `id` uuid PK, `tytul` text, `kompozytor`, `choreograf`, `teatr_id` FK→teatry, `opis`, `zdjecie_url`

**`przedstawienia`** — konkretne terminy (~1000+ przyszłych rekordów):
- `id` uuid PK, `spektakl_id` FK→spektakle, `teatr_id` FK→teatry
- `data_czas` **timestamptz** (UTC w bazie; wyświetlaj w `Europe/Warsaw`!)
- `link_bilety` text (bezpośredni link do kasy), `link_szczegoly` text (strona spektaklu w teatrze)
- `dostepnosc` text — CHECK constraint, dozwolone wartości:
  `dostepne` | `malo_miejsc` | `wyprzedane` | `premiera` | `odwolane` | `null`
  (null = brak informacji; traktuj jak "sprawdź na stronie teatru")
- `cena_od` integer (grosze, często null), `notatka` text (u nas: kategoria — `balet`/`opera`/`operetka`/`koncert`/`edukacja`/`musical`/`inne`)

**`obsady`** — kto tańczy (rzadko wypełniane): `przedstawienie_id`, `imie_nazwisko`, `rola`, `sanity_sylwetka_id`

**`meta`** — klucz/wartość; `klucz='last_scrape'` → JSON `{timestamp, events, added}` (pokazuj "ostatnia aktualizacja")

### Wzorzec zapytania (jak robi to portal)
```ts
supabase.from('przedstawienia').select(`
  id, data_czas, link_bilety, link_szczegoly, dostepnosc, cena_od, notatka,
  spektakl:spektakle ( id, tytul, kompozytor, choreograf, zdjecie_url ),
  teatr:teatry!inner ( id, nazwa, miasto, slug )
`)
.gte('data_czas', startISO).lte('data_czas', endISO)
.eq('teatr.miasto', miasto)         // filtr miasta (join !inner)
.order('data_czas', { ascending: true })
```

### Pułapki (nauczone w praktyce — nie powtarzaj błędów)
- **Limit 1000 wierszy**: Supabase domyślnie zwraca max 1000. Przy pełnej liście używaj `.range()` z paginacją.
- **Strefa czasowa**: `data_czas` przychodzi jako UTC (`+00:00`). Zawsze formatuj z `timeZone: 'Europe/Warsaw'`.
- **Sezon**: teatry grają wrzesień–czerwiec. Lipiec/sierpień to normalna przerwa wakacyjna —
  pusty miesiąc letni pokazuj jako "Przerwa wakacyjna", nie jako błąd (portal robi to samo).
- Dane sięgają do ~14 miesięcy w przód (aktualnie do lipca 2027).

## 5. Dane — Sanity (artykuły / nowości)

- projectId: `nri4izo1`, dataset: `production`, API version `2024-01-01`.
- Odczyt publiczny **bez tokenu** (public dataset) przez `@sanity/client` lub czyste HTTP:
  `https://nri4izo1.api.sanity.io/v2024-01-01/data/query/production?query=...`
- **NIE** umieszczaj w apce `SANITY_API_TOKEN` (służy tylko do zapisu, zostaje na backendzie).

### Typ `artykul` (najważniejsze pola)
`tytul`, `slug.current`, `kategoria` (Recenzja/Technika/Historia/Wywiad/Aktualności/Premiera),
`zajawka` (lead), `zdjecie` (miniaturka 16:9 — często baner z wpisanym tytułem),
`zdjecieArtykul` (opcjonalna okładka), `dataPublikacji`, `autor`, `czasCzytania`, `featured` (bool), `tagi[]`

Wywiady = artykuły z `kategoria == "Wywiad"` (osobny typ `wywiad` jest legacy, pusty).

### GROQ na feed nowości
```groq
*[_type == "artykul"] | order(dataPublikacji desc) [0..9] {
  _id, tytul, slug, kategoria, zajawka, czasCzytania, dataPublikacji,
  zdjecie { asset, alt }
}
```
Obrazy: CDN `cdn.sanity.io`, buduj URL przez `@sanity/image-url` (parametry `?w=&h=&fit=crop`).
Link zajawki do portalu: `https://swiatbaletu.pl/artykuly/<slug>`.

## 6. Design system (spójny z portalem)

- **Tła**: jasny `#FAFAF8` (karty `#FFFFFF`), ciemny motyw wspierany.
- **Złote akcenty**: `#A8832A` (jasny motyw), `#C9A84C` (ciemny).
- **Typografia**: nagłówki **Cormorant Garamond** (serif; Google Fonts przez expo-font),
  body **DM Sans**. Napisy-etykiety: uppercase, letter-spacing, małe rozmiary, kolor złoty.
- Bordery subtelne: `rgba(0,0,0,0.08)`, cienkie (0.5–1px), zaokrąglenia ~8px.
- Badge dostępności jak na portalu: dostepne=zielony, malo_miejsc/premiera=bursztyn, wyprzedane=czerwony, odwolane=szary.
- Ton komunikacji: elegancki, ciepły, po polsku. **W treściach używaj krótkich myślników "-" (nie "—").**

## 7. Roadmapa (buduj etapami!)

**MVP (bez kont użytkowników):**
1. Lista repertuaru + filtry (miasto / miesiąc / dostępność) + pull-to-refresh
2. Szczegóły przedstawienia (data, teatr, kategoria, ceny, przyciski: Kup bilet / Strona spektaklu)
3. "Moje spektakle": oznacz ★ → zapis lokalny (AsyncStorage) + **lokalne powiadomienie** przypominające (np. dzień przed i 3h przed; konfigurowalne)
4. Feed nowości z Sanity (zajawki → otwierają portal w przeglądarce/webview)
5. Jasny/ciemny motyw

**v2 (konta + synchronizacja):**
- Supabase Auth (e-mail magic link), tabele `user_favorites` itd. + RLS — **do zrobienia po stronie projektu portalu**
- Synchronizacja ulubionych między urządzeniami

**v3 (push serwerowy):**
- Alert "wróciły miejsca" — porównanie stanów robi scraper po każdym przebiegu (projekt portalu), wysyłka przez Expo Push; apka tylko rejestruje token i subskrypcje
- Quizy (pytania mogą żyć w Sanity jako nowy typ dokumentu — łatwa edycja w Studio)

**Sklepy:** Google Play (konto 25 USD jednorazowo), Apple Developer (99 USD/rok). Development i testy działają bez tego (Expo Go).

## 8. Granica odpowiedzialności projektów

- **Ten projekt (apka)**: UI, nawigacja, odczyt danych, powiadomienia lokalne, stan lokalny.
- **Projekt portalu** (`C:\Users\Sebastian\CLAUDE\SwiatBaletu`): scraper, schemat bazy, nowe tabele/RLS, logika porównywania dostępności, wysyłka push, treści Sanity.
- Jeśli funkcja wymaga zmiany w bazie/backendzie — zanotuj wymaganie i zgłoś użytkownikowi,
  że trzeba je wykonać w projekcie portalu (nie modyfikuj wspólnej bazy "na ślepo" stąd).

## 9. Pierwsze kroki (dla Claude Code w nowym folderze)

1. `npx create-expo-app@latest . --template` (TypeScript, expo-router)
2. Poproś użytkownika o wartości `EXPO_PUBLIC_SUPABASE_URL` i `EXPO_PUBLIC_SUPABASE_ANON_KEY` (z `repo/.env.local` portalu) → zapisz w `.env` (dodaj do `.gitignore`)
3. Zbuduj MVP w kolejności z sekcji 7; ekran repertuaru wzoruj na `https://swiatbaletu.pl/repertuar`
4. Testuj przez Expo Go na telefonie użytkownika (QR kod z `npx expo start`)
5. Nowe repo git (`swiatbaletu-app`), commity po polsku, konwencja `feat:/fix:/content:`
