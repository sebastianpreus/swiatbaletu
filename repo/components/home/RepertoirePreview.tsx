import Link from 'next/link'
import SectionHeader from '../ui/SectionHeader'
import Badge from '../ui/Badge'
import { supabase } from '../../lib/supabase'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })
}

function dostepnoscVariant(d: string): 'red' | 'amber' | 'green' | 'gray' {
  switch (d) {
    case 'malo_miejsc': return 'amber'
    case 'wyprzedane': return 'red'
    case 'odwolane': return 'gray'
    default: return 'green'
  }
}

function dostepnoscLabel(d: string) {
  switch (d) {
    case 'malo_miejsc': return 'Ostatnie'
    case 'wyprzedane': return 'Wyprzedane'
    case 'odwolane': return 'Odwołane'
    default: return 'Bilety'
  }
}

function getWarsawDayBoundsUTC() {
  // Oblicz dzisiejszą datę w Warsaw i zwróć granice dnia w UTC
  const now = new Date()
  const warsawStr = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' })
  const warsawNow = new Date(warsawStr)

  // Offset Warsaw vs UTC w milisekundach
  const utcMs = now.getTime()
  const warsawMs = warsawNow.getTime()
  const offsetMs = utcMs - warsawMs

  // Początek i koniec dnia w Warsaw
  const startWarsaw = new Date(warsawNow.getFullYear(), warsawNow.getMonth(), warsawNow.getDate(), 0, 0, 0)
  const endWarsaw = new Date(warsawNow.getFullYear(), warsawNow.getMonth(), warsawNow.getDate(), 23, 59, 59)

  // Przelicz na UTC
  return {
    start: new Date(startWarsaw.getTime() + offsetMs).toISOString(),
    end: new Date(endWarsaw.getTime() + offsetMs).toISOString(),
  }
}

async function getTodayShows() {
  const { start, end } = getWarsawDayBoundsUTC()

  const { data } = await supabase
    .from('przedstawienia')
    .select(`
      id, data_czas, dostepnosc, link_bilety, link_szczegoly,
      spektakl:spektakle ( tytul, kompozytor ),
      teatr:teatry ( nazwa, miasto )
    `)
    .gte('data_czas', start)
    .lte('data_czas', end)
    .order('data_czas', { ascending: true })

  return data || []
}

async function getNextShows() {
  const { data } = await supabase
    .from('przedstawienia')
    .select(`
      id, data_czas, dostepnosc, link_bilety, link_szczegoly,
      spektakl:spektakle ( tytul, kompozytor ),
      teatr:teatry ( nazwa, miasto )
    `)
    .gte('data_czas', new Date().toISOString())
    .order('data_czas', { ascending: true })
    .limit(6)

  return data || []
}

export default async function RepertoirePreview() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let shows: any[] = []
  let isToday = true

  try {
    shows = await getTodayShows()
    if (shows.length === 0) {
      shows = await getNextShows()
      isToday = false
    }
  } catch {
    return null
  }

  if (shows.length === 0) return null

  const title = isToday ? 'Dziś na scenach' : 'Najbliższe spektakle'

  // Format date for "nearest" view
  function formatNearDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Warsaw' })
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <section className="py-7 border-b-[0.5px] border-border">
        <SectionHeader
          title={title}
          linkText="Pełny repertuar →"
          linkHref="/repertuar"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[10px]">
          {shows.slice(0, 16).map((p) => {
            const link = p.link_szczegoly || p.link_bilety || '/repertuar'
            const isPast = p.dostepnosc === 'wyprzedane' || p.dostepnosc === 'odwolane'
            return (
              <Link
                key={p.id}
                href={link}
                target={link.startsWith('http') ? '_blank' : undefined}
                rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`bg-bg-card border-[0.5px] border-border rounded-md px-3 py-[10px] transition-all hover:border-gold-dim hover:shadow-[var(--shadow-card)] block ${isPast ? 'opacity-60' : ''}`}
              >
                <div className="text-[9px] text-gold-dim tracking-[0.08em] uppercase font-medium mb-[4px]">
                  {isToday ? formatTime(p.data_czas) : formatNearDate(p.data_czas)} · {p.teatr?.miasto}
                </div>
                <div className="font-serif text-[14px] leading-[1.2] font-normal text-text-1 mb-[3px] line-clamp-2">
                  {p.spektakl?.tytul}
                </div>
                <div className="text-[10px] text-text-2 line-clamp-1 mb-[4px]">
                  {p.teatr?.nazwa}
                </div>
                {p.dostepnosc && (
                  <Badge variant={dostepnoscVariant(p.dostepnosc)}>
                    {dostepnoscLabel(p.dostepnosc)}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
