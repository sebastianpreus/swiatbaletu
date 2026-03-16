import Link from 'next/link'
import ThemeToggle from '../ui/ThemeToggle'

export default function TopBar() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <div className="flex justify-between items-center py-[14px] pb-3 border-b-[0.5px] border-border">
        <Link href="/" className="font-serif text-[28px] tracking-[0.08em] text-gold font-normal">
          ŚWIAT<em className="italic font-light"> Baletu</em>
        </Link>
        <div className="flex items-center gap-5">
          <div className="text-right leading-relaxed hidden md:block">
            <div className="text-[11px] text-gold-dim font-medium capitalize">{dateStr}</div>
            <div className="text-[11px] text-text-2">Sezon 2025/2026</div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
