import SectionHeader from '../ui/SectionHeader'
import Badge from '../ui/Badge'
import { getPrzedstawienia } from '../../lib/queries/repertuar'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}

function dostepnoscLabel(d: string) {
  switch (d) {
    case 'malo_miejsc': return 'Prawie wyprzedane'
    case 'wyprzedane': return 'Wyprzedane'
    case 'premiera': return 'Premiera sezonu'
    default: return 'Bilety dostępne'
  }
}

function dostepnoscVariant(d: string): 'red' | 'amber' | 'green' {
  switch (d) {
    case 'malo_miejsc': return 'red'
    case 'wyprzedane': return 'red'
    case 'premiera': return 'amber'
    default: return 'green'
  }
}

export default async function RepertoirePreview() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let przedstawienia: any[] = []

  try {
    przedstawienia = (await getPrzedstawienia())?.slice(0, 4) ?? []
  } catch {
    // Supabase not configured yet
  }

  if (przedstawienia.length === 0) {
    return null
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <section className="py-7 border-b-[0.5px] border-border">
        <SectionHeader
          title="Repertuar — najbliższe tygodnie"
          linkText="Pełny repertuar →"
          linkHref="/repertuar"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          {przedstawienia.map((p) => (
            <div
              key={p.id}
              className="bg-bg-card border-[0.5px] border-border rounded-lg px-[18px] py-4 cursor-pointer transition-all hover:border-gold-dim hover:shadow-[var(--shadow-card)]"
            >
              <div className="text-[10px] text-gold-dim tracking-[0.08em] uppercase font-medium mb-[6px]">
                {formatDate(p.data_czas)} · {p.teatr?.miasto}
              </div>
              <div className="font-serif text-[17px] font-normal text-text-1 mb-1">
                {p.spektakl?.tytul}
                {p.dostepnosc === 'premiera' && ' ✦ PREMIERA'}
              </div>
              <div className="text-[11px] text-text-2">
                {p.teatr?.nazwa}
                {p.spektakl?.kompozytor && ` · ${p.spektakl.kompozytor}`}
              </div>
              <Badge variant={dostepnoscVariant(p.dostepnosc)}>
                {dostepnoscLabel(p.dostepnosc)}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
