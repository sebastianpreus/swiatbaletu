import { supabase } from '../supabase'

export async function getPrzedstawienia(miasto?: string) {
  let query = supabase
    .from('przedstawienia')
    .select(`
      id,
      data_czas,
      link_bilety,
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
      teatr:teatry (
        id,
        nazwa,
        miasto,
        slug
      )
    `)
    .gte('data_czas', new Date().toISOString())
    .order('data_czas', { ascending: true })

  if (miasto) {
    query = query.eq('teatry.miasto', miasto)
  }

  const { data, error } = await query

  if (error) {
    console.error('Błąd pobierania przedstawień:', error)
    return []
  }

  return data
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
