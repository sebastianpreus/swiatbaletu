'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('storage-consent')
    if (!accepted) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('storage-consent', Date.now().toString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t-[0.5px] border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)] px-6 py-4">
      <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <p className="text-[12px] text-text-2 leading-[1.6] flex-1">
          Strona korzysta z localStorage do zapamiętania Twoich preferencji (tryb jasny/ciemny, zamknięte okienka).
          Nie zbieramy danych marketingowych ani analitycznych.
        </p>
        <button
          onClick={accept}
          className="text-[11px] tracking-[0.06em] uppercase px-5 py-[7px] bg-gold text-white rounded-[2px] hover:bg-gold-dim transition-colors shrink-0 font-medium"
        >
          Rozumiem
        </button>
      </div>
    </div>
  )
}
