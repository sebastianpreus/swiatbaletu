import { supabase } from '../supabase'

export async function getTeatry() {
  const { data, error } = await supabase
    .from('teatry')
    .select('*')
    .order('nazwa', { ascending: true })

  if (error) {
    console.error('Błąd pobierania teatrów:', error)
    return []
  }

  return data
}

export async function getTeatrBySlug(slug: string) {
  const { data, error } = await supabase
    .from('teatry')
    .select(`
      *,
      spektakle (
        id,
        tytul,
        kompozytor,
        choreograf,
        przedstawienia (
          id,
          data_czas,
          link_bilety,
          dostepnosc,
          cena_od,
          notatka
        )
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Błąd pobierania teatru:', error)
    return null
  }

  return data
}
