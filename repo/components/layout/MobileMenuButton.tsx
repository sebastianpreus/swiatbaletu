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
]

export default function MobileMenuButton() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Zamknij menu po nawigacji
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Zablokuj scroll body gdy menu jest otwarte
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-sm hover:bg-bg-hover transition-colors"
        aria-label="Menu"
      >
        <span className={`block w-[18px] h-[1.5px] bg-text-2 transition-all duration-300 ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
        <span className={`block w-[18px] h-[1.5px] bg-text-2 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-[18px] h-[1.5px] bg-text-2 transition-all duration-300 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
      </button>

      {/* Dropdown overlay + menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 right-0 top-[60px] bg-bg-card border-b-[0.5px] border-border z-50 shadow-lg">
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
