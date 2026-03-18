import Link from 'next/link'
import { getPrzedstawienia } from '../../../../lib/queries/repertuar'
import Badge from '../../../../components/ui/Badge'

export const metadata = {
  title: 'Repertuar — Świat Baletu',
  description: 'Pełny repertuar baletowy polskich teatrów operowych.',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pl-PL', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Europe/Warsaw',
  })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })
}

function dostepnoscLabel(d: string) {
  switch (d) {
    case 'malo_miejsc': return 'Ostatnie bilety'
    case 'wyprzedane': return 'Bilety wyprzedane'
    case 'premiera': return 'Premiera'
    default: return 'Bilety dostępne'
  }
}

function dostepnoscVariant(d: string): 'red' | 'amber' | 'green' {
  switch (d) {
    case 'malo_miejsc': return 'amber'
    case 'wyprzedane': return 'red'
    case 'premiera': return 'amber'
    default: return 'green'
  }
}

const MIASTA = ['Wszystkie', 'Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Łódź', 'Bydgoszcz']

export default async function RepertuarPage({
  searchParams,
}: {
  searchParams: Promise<{ miasto?: string }>
}) {
  const { miasto } = await searchParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let przedstawienia: any[] = []

  try {
    przedstawienia = (await getPrzedstawienia(miasto === 'Wszystkie' ? undefined : miasto)) ?? []
  } catch {
    // Supabase not configured
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-2">Repertuar</h1>
      <p className="text-[13px] text-text-2 mb-6">Najbliższe spektakle baletowe w polskich teatrach.</p>

      {/* City filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {MIASTA.map((m) => {
          const isActive = (!miasto && m === 'Wszystkie') || miasto === m
          return (
            <Link
              key={m}
              href={m === 'Wszystkie' ? '/repertuar' : `/repertuar?miasto=${encodeURIComponent(m)}`}
              className={`text-[11px] tracking-[0.06em] uppercase px-4 py-[6px] rounded-[2px] border-[0.5px] transition-all ${
                isActive
                  ? 'bg-gold text-white border-gold'
                  : 'text-text-2 border-border hover:border-gold-dim hover:text-gold'
              }`}
            >
              {m}
            </Link>
          )
        })}
      </div>

      {przedstawienia.length === 0 ? (
        <p className="text-[14px] text-text-2 italic">Brak spektakli do wyświetlenia.</p>
      ) : (
        <div className="space-y-3">
          {przedstawienia.map((p) => (
            <div
              key={p.id}
              className="bg-bg-card border-[0.5px] border-border rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all hover:border-gold-dim hover:shadow-[var(--shadow-card)]"
            >
              {p.spektakl?.zdjecie_url && (
                <div className="w-[72px] h-[72px] rounded-[6px] overflow-hidden shrink-0 border-[0.5px] border-border hidden sm:block">
                  <img
                    src={p.spektakl.zdjecie_url}
                    alt={p.spektakl.tytul}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="text-[10px] text-gold-dim tracking-[0.08em] uppercase font-medium mb-1">
                  {formatDate(p.data_czas)} · {formatTime(p.data_czas)}
                </div>
                <div className="font-serif text-[19px] font-normal text-text-1 mb-1">
                  {p.spektakl?.tytul}
                  {p.dostepnosc === 'premiera' && ' ✦ PREMIERA'}
                </div>
                <div className="text-[12px] text-text-2">
                  {p.teatr?.nazwa} · {p.teatr?.miasto}
                  {p.spektakl?.kompozytor && ` · ${p.spektakl.kompozytor}`}
                </div>
                {p.notatka && (
                  <div className="text-[11px] text-gold-dim italic mt-1">{p.notatka}</div>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap justify-end">
                {p.cena_od && (
                  <div className="text-[12px] text-text-2">
                    od <span className="text-text-1 font-medium">{(p.cena_od / 100).toFixed(0)} zł</span>
                  </div>
                )}
                {p.dostepnosc && (
                  <Badge variant={dostepnoscVariant(p.dostepnosc)}>
                    {dostepnoscLabel(p.dostepnosc)}
                  </Badge>
                )}
                {p.dostepnosc !== 'wyprzedane' && p.link_bilety && (
                  <a
                    href={p.link_bilety}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] tracking-[0.07em] uppercase bg-gold text-white rounded-[2px] px-3 py-[5px] hover:bg-gold-dim transition-all"
                  >
                    Kup bilet
                  </a>
                )}
                {p.link_szczegoly && (
                  <a
                    href={p.link_szczegoly}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] tracking-[0.07em] uppercase text-text-2 border-[0.5px] border-border rounded-[2px] px-3 py-[5px] hover:text-gold hover:border-gold transition-all"
                  >
                    Czytaj więcej
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
