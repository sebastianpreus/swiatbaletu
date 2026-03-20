'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

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
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Wystąpił błąd')
      }
    } catch {
      setStatus('error')
      setMessage('Błąd połączenia. Spróbuj ponownie.')
    }

    // Reset po 5 sekundach
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  return (
    <div className="w-full">
      <div className="font-serif text-[16px] text-text-1 mb-2">
        Newsletter
      </div>
      <p className="text-[11px] text-text-2 mb-3 leading-relaxed">
        Bądź na bieżąco — premiery, recenzje i kulisy świata baletu prosto na Twój email.
      </p>

      {status === 'success' ? (
        <div className="text-[12px] text-[#2d7a4a] bg-badge-green-bg px-3 py-2 rounded-sm">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Twój adres email"
            required
            className="flex-1 min-w-0 px-3 py-[7px] text-[12px] bg-bg-page border-[0.5px] border-border rounded-sm
                       text-text-1 placeholder:text-text-3 outline-none
                       focus:border-gold transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-[7px] text-[11px] font-medium tracking-wider uppercase
                       bg-gold text-white rounded-sm hover:bg-gold-dim transition-colors
                       disabled:opacity-50 disabled:cursor-wait whitespace-nowrap"
          >
            {status === 'loading' ? '...' : 'Zapisz się'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <div className="text-[11px] text-badge-red-txt mt-2">
          {message}
        </div>
      )}
    </div>
  )
}
