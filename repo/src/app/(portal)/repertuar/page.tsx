import Link from 'next/link'
import { getPrzedstawienia, getRepertuarMeta } from '../../../../lib/queries/repertuar'
import Badge from '../../../../components/ui/Badge'
import FilterSelect from '../../../../components/ui/FilterSelect'

export const metadata = {
  title: 'Repertuar — Świat Baletu',
  description: 'Pełny repertuar baletowy polskich teatrów operowych.',
}

// Force dynamic rendering (data changes frequently)
export const dynamic = 'force-dynamic'

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
    case 'odwolane': return 'Odwołane'
    case 'info': return 'Info'
    default: return 'Bilety dostępne'
  }
}

function dostepnoscVariant(d: string): 'red' | 'amber' | 'green' | 'gray' {
  switch (d) {
    case 'malo_miejsc': return 'amber'
    case 'wyprzedane': return 'red'
    case 'premiera': return 'amber'
    case 'odwolane': return 'gray'
    case 'info': return 'amber'
    default: return 'green'
  }
}

function formatMonthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
}

const MIASTA = ['Wszystkie', 'Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Łódź', 'Bydgoszcz']

const DOSTEPNOSCI = [
  { value: '', label: 'Wszystkie' },
  { value: 'dostepne', label: 'Dostępne' },
  { value: 'wyprzedane', label: 'Wyprzedane' },
  { value: 'odwolane', label: 'Odwołane' },
]

export default async function RepertuarPage({
  searchParams,
}: {
  searchParams: Promise<{ miasto?: string; miesiac?: string; status?: string }>
}) {
  const params = await searchParams
  const { miasto, miesiac, status } = params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let przedstawienia: any[] = []
  let months: string[] = []

  try {
    przedstawienia = (await getPrzedstawienia({
      miasto: miasto === 'Wszystkie' ? undefined : miasto,
      miesiac: miesiac || undefined,
      dostepnosc: status || undefined,
    })) ?? []
  } catch {
    // Supabase not configured
  }

  let lastUpdate = ''
  try {
    const meta = await getRepertuarMeta()
    if (meta.lastUpdate) {
      lastUpdate = new Date(meta.lastUpdate).toLocaleDateString('pl-PL', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Europe/Warsaw',
      })
    }
    months = meta.months
  } catch {
    // ignore
  }

  // Build filter URL helper
  function filterUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { miasto, miesiac, status, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== 'Wszystkie' && v !== '') p.set(k, v)
    }
    const qs = p.toString()
    return `/repertuar${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-2">Repertuar</h1>
      <p className="text-[13px] text-text-2 mb-6">
        Najbliższe spektakle baletowe w polskich teatrach.{' '}
        <span className="text-text-2/60">(ostatnia aktualizacja: {lastUpdate})</span>
      </p>

      {/* City filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MIASTA.map((m) => {
          const isActive = (!miasto && m === 'Wszystkie') || miasto === m
          return (
            <Link
              key={m}
              href={filterUrl({ miasto: m === 'Wszystkie' ? undefined : m })}
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

      {/* Month + Availability filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <FilterSelect
          label="Miesiąc"
          paramName="miesiac"
          currentValue={miesiac || ''}
          baseParams={{ miasto, status }}
          options={[
            { value: '', label: 'Wszystkie' },
            ...months.map((ym) => ({ value: ym, label: formatMonthLabel(ym) })),
          ]}
        />
        <FilterSelect
          label="Dostępność"
          paramName="status"
          currentValue={status || ''}
          baseParams={{ miasto, miesiac }}
          options={DOSTEPNOSCI}
        />
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
                {p.dostepnosc !== 'wyprzedane' && p.dostepnosc !== 'odwolane' && p.link_bilety && (
                  <a
                    href={p.link_bilety}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] tracking-[0.07em] uppercase bg-gold text-white rounded-[2px] px-3 py-[5px] hover:bg-gold-dim transition-all"
                  >
                    {p.dostepnosc === 'info' ? 'Info' : 'Kup bilet'}
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
