'use client'

import { useState, useEffect } from 'react'

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Don't show if already dismissed or subscribed
    const dismissed = localStorage.getItem('newsletter-popup-dismissed')
    if (dismissed) return

    // Show after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem('newsletter-popup-dismissed', Date.now().toString())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/zapisz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        localStorage.setItem('newsletter-popup-dismissed', Date.now().toString())
        setTimeout(() => setVisible(false), 3000)
      } else {
        setErrorMsg(data.error || 'Wystąpił błąd')
        setStatus('error')
        setTimeout(() => setStatus('idle'), 4000)
      }
    } catch {
      setErrorMsg('Błąd połączenia')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-[640px] w-full flex flex-col sm:flex-row overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10 text-[18px]"
          aria-label="Zamknij"
        >
          &times;
        </button>

        {/* Left - Logo */}
        <div className="sm:w-[220px] shrink-0 flex items-center justify-center p-6 sm:p-8 bg-[#FAFAF8]">
          <img
            src="/swiatbaletu-logo.png"
            alt="Świat Baletu"
            className="w-[140px] sm:w-[170px]"
          />
        </div>

        {/* Right - Newsletter form */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          <h3 className="font-serif text-[22px] text-[#1a1814] mb-2 leading-tight">
            Bądź na bieżąco
          </h3>
          <p className="text-[13px] text-[#6b6457] leading-[1.7] mb-5">
            Premiery, recenzje i kulisy świata baletu prosto na Twój email.
            Dołącz do naszego newslettera.
          </p>

          {status === 'success' ? (
            <div className="text-[14px] text-[#2d7a4a] font-medium py-3">
              Dziękujemy za zapis! Sprawdź swoją skrzynkę.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Twój adres email"
                required
                className="w-full px-4 py-[10px] text-[13px] border border-[#e0ddd5] rounded-[4px] bg-white text-[#1a1814] placeholder:text-[#a09880] focus:outline-none focus:border-[#A8832A] transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-[10px] text-[11px] tracking-[0.08em] uppercase font-medium bg-[#A8832A] text-white rounded-[4px] hover:bg-[#8A6A28] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Zapisuję...' : 'Zapisz się'}
              </button>
              {status === 'error' && (
                <div className="text-[12px] text-[#c0392b]">{errorMsg}</div>
              )}
            </form>
          )}

          <p className="text-[10px] text-[#a09880] mt-3 leading-[1.5]">
            Możesz wypisać się w dowolnym momencie.
          </p>
        </div>
      </div>
    </div>
  )
}
