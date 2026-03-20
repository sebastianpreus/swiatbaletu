import { supabase } from '../supabase'

function getWarsawDayBoundsUTC() {
  const now = new Date()
  const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' })
  const warsawNow = new Date(warsawStr)

  const utcMs = now.getTime()
  const warsawMs = warsawNow.getTime()
  const offsetMs = utcMs - warsawMs

  const startWarsaw = new Date(warsawNow.getFullYear(), warsawNow.getMonth(), warsawNow.getDate(), 0, 0, 0)
  const endWarsaw = new Date(warsawNow.getFullYear(), warsawNow.getMonth(), warsawNow.getDate(), 23, 59, 59)

  return {
    start: new Date(startWarsaw.getTime() + offsetMs).toISOString(),
    end: new Date(endWarsaw.getTime() + offsetMs).toISOString(),
  }
}

export async function getPrzedstawienia(filters?: {
  miasto?: string
  miesiac?: string  // format: "2026-03"
  dostepnosc?: string  // "dostepne" | "wyprzedane" | "malo_miejsc" | "odwolane"
}) {
  const miasto = filters?.miasto
  const teatrJoin = miasto ? 'teatr:teatry!inner' : 'teatr:teatry'

  let query = supabase
    .from('przedstawienia')
    .select(`
      id,
      data_czas,
      link_bilety,
      link_szczegoly,
      dostepnosc,
      cena_od,
      notatka,
      spektakl:spektakle (
        id,
        tytul,
        kompozytor,
        choreograf,
        zdjecie_url
      ),
      ${teatrJoin} (
        id,
        nazwa,
        miasto,
        slug
      )
    `)
    .order('data_czas', { ascending: true })

  // Month filter or default to today onwards
  const { start: todayStart } = getWarsawDayBoundsUTC()

  if (filters?.miesiac) {
    const [y, m] = filters.miesiac.split('-').map(Number)
    // Current month? Start from today (beginning of day). Future month? From 1st.
    const warsawNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }))
    const isCurrentMonth = y === warsawNow.getFullYear() && m === warsawNow.getMonth() + 1
    const start = isCurrentMonth ? todayStart : new Date(y, m - 1, 1).toISOString()
    const end = new Date(y, m, 0, 23, 59, 59).toISOString()
    query = query.gte('data_czas', start).lte('data_czas', end)
  } else {
    query = query.gte('data_czas', todayStart)
  }

  if (miasto) {
    query = query.eq('teatr.miasto', miasto)
  }

  if (filters?.dostepnosc) {
    if (filters.dostepnosc === 'dostepne') {
      query = query.in('dostepnosc', ['dostepne', 'premiera', 'malo_miejsc'])
    } else {
      query = query.eq('dostepnosc', filters.dostepnosc)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Błąd pobierania przedstawień:', error)
    return []
  }

  return data
}

export async function getRepertuarMeta() {
  // Get available months
  const { start: todayStart } = getWarsawDayBoundsUTC()
  const { data: rows } = await supabase
    .from('przedstawienia')
    .select('data_czas')
    .gte('data_czas', todayStart)
    .order('data_czas', { ascending: true })

  const uniqueMonths = new Set<string>()
  for (const row of rows || []) {
    const d = new Date(row.data_czas)
    uniqueMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  // Get last scrape timestamp from meta table
  let lastUpdate: string | null = null
  const { data: metaRow } = await supabase
    .from('meta')
    .select('wartosc')
    .eq('klucz', 'last_scrape')
    .maybeSingle()

  if (metaRow?.wartosc) {
    try {
      const parsed = JSON.parse(metaRow.wartosc)
      lastUpdate = parsed.timestamp
    } catch {
      lastUpdate = metaRow.wartosc // plain ISO string fallback
    }
  }

  return {
    months: Array.from(uniqueMonths).sort(),
    lastUpdate,
  }
}

export async function getSpektaklById(id: string) {
  const { data, error } = await supabase
    .from('spektakle')
    .select(`
      *,
      przedstawienia (
        id,
        data_czas,
        link_bilety,
        dostepnosc,
        cena_od,
        notatka,
        teatr:teatry (
          id,
          nazwa,
          miasto,
          slug
        ),
        obsady (
          id,
          imie_nazwisko,
          rola,
          sanity_sylwetka_id
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Błąd pobierania spektaklu:', error)
    return null
  }

  return data
}
