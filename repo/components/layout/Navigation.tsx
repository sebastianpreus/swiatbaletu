'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Aktualności', href: '/' },
  { label: 'Artykuły', href: '/artykuly' },
  { label: 'Repertuar', href: '/repertuar' },
  { label: 'Sylwetki', href: '/sylwetki' },
  { label: 'Wywiady', href: '/wywiady' },
  { label: 'Teatry', href: '/teatry' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* Desktop only — mobile uses hamburger in TopBar */}
      <nav className="hidden md:flex border-b-[0.5px] border-border">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[11px] tracking-[0.06em] uppercase py-[11px] px-[15px] whitespace-nowrap font-medium transition-all duration-200 border-b-2 ${
                isActive
                  ? 'text-gold border-gold'
                  : 'text-text-2 border-transparent hover:text-gold'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
