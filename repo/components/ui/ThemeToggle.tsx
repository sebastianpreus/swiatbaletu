'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.body.setAttribute('data-theme', saved)
    }
  }, [])

  function toggle(t: 'light' | 'dark') {
    setTheme(t)
    document.body.setAttribute('data-theme', t)
    localStorage.setItem('theme', t)
  }

  return (
    <div className="flex rounded-[20px] border-[0.5px] border-border-mid bg-bg-section p-[3px] gap-[2px] shrink-0">
      <button
        onClick={() => toggle('light')}
        className={`text-[10px] tracking-[0.06em] uppercase px-[10px] md:px-[13px] py-[5px] rounded-[16px] border-none cursor-pointer font-sans font-medium transition-all duration-200 ${
          theme === 'light'
            ? 'bg-gold text-white'
            : 'bg-transparent text-text-2'
        }`}
      >
        <span className="hidden sm:inline">&#9788; Jasny</span>
        <span className="sm:hidden">&#9788;</span>
      </button>
      <button
        onClick={() => toggle('dark')}
        className={`text-[10px] tracking-[0.06em] uppercase px-[10px] md:px-[13px] py-[5px] rounded-[16px] border-none cursor-pointer font-sans font-medium transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-gold text-white'
            : 'bg-transparent text-text-2'
        }`}
      >
        <span className="hidden sm:inline">&#9790; Ciemny</span>
        <span className="sm:hidden">&#9790;</span>
      </button>
    </div>
  )
}
