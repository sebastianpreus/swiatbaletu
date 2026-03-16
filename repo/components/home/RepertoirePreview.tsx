import SectionHeader from '../ui/SectionHeader'
import Badge from '../ui/Badge'

// Demo data - will be replaced by Supabase data
const demoRepertoire = [
  { id: '1', date: '14–16 Mar · Warszawa', title: 'Łabędzie Jezioro', sub: 'Teatr Wielki · P. Czajkowski', badge: 'Prawie wyprzedane', badgeVariant: 'red' as const },
  { id: '2', date: '20–22 Mar · Kraków', title: 'Spartakus ✦ PREMIERA', sub: 'Opera Krakowska · A. Chaczaturian', badge: 'Premiera sezonu', badgeVariant: 'amber' as const },
  { id: '3', date: '21–23 Mar · Wrocław', title: 'Giselle', sub: 'Opera Wrocławska · A. Adam', badge: 'Bilety dostępne', badgeVariant: 'green' as const },
  { id: '4', date: '22 Mar · Gdańsk', title: 'Wieczór Bejarta', sub: 'Opera Bałtycka · Bolero + Symfonia D', badge: 'Bilety dostępne', badgeVariant: 'green' as const },
]

export default function RepertoirePreview() {
  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <section className="py-7 border-b-[0.5px] border-border">
        <SectionHeader
          title="Repertuar — najbliższe tygodnie"
          linkText="Pełny repertuar →"
          linkHref="/repertuar"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          {demoRepertoire.map((item) => (
            <div
              key={item.id}
              className="bg-bg-card border-[0.5px] border-border rounded-lg px-[18px] py-4 cursor-pointer transition-all hover:border-gold-dim hover:shadow-[var(--shadow-card)]"
            >
              <div className="text-[10px] text-gold-dim tracking-[0.08em] uppercase font-medium mb-[6px]">
                {item.date}
              </div>
              <div className="font-serif text-[17px] font-normal text-text-1 mb-1">
                {item.title}
              </div>
              <div className="text-[11px] text-text-2">{item.sub}</div>
              <Badge variant={item.badgeVariant}>{item.badge}</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
