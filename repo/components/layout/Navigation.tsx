'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { label: 'Aktualności', href: '/' },
  { label: 'Repertuar', href: '/repertuar' },
  { label: 'Sylwetki', href: '/sylwetki' },
  { label: 'Wywiady', href: '/wywiady' },
  { label: 'Teatry', href: '/teatry' },
  { label: 'Promocje', href: '/promocje' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Zamknij menu po nawigacji
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Zablokuj scroll body gdy menu jest otwarte
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* Desktop nav */}
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

      {/* Mobile hamburger bar */}
      <div className="flex md:hidden items-center justify-between border-b-[0.5px] border-border py-[10px]">
        <span className="text-[11px] tracking-[0.06em] uppercase text-text-2 font-medium">
          {navItems.find(
            (item) =>
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
          )?.label || 'Menu'}
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-sm hover:bg-bg-hover transition-colors"
          aria-label="Menu"
        >
          <span className={`block w-[18px] h-[1.5px] bg-text-2 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-[18px] h-[1.5px] bg-text-2 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-[18px] h-[1.5px] bg-text-2 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Menu */}
          <div className="absolute left-0 right-0 bg-bg-card border-b-[0.5px] border-border z-50 md:hidden shadow-lg">
            <div className="max-w-[1100px] mx-auto px-6 py-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block text-[13px] tracking-[0.04em] uppercase py-[12px] font-medium transition-all duration-200 border-b-[0.5px] border-border last:border-b-0 ${
                      isActive
                        ? 'text-gold'
                        : 'text-text-2 hover:text-gold'
                    }`}
                  >
                    {isActive && <span className="inline-block w-[12px] h-[1.5px] bg-gold mr-2 align-middle" />}
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
