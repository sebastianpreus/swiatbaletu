'use client'

import { useRouter } from 'next/navigation'

interface FilterSelectProps {
  label: string
  paramName: string
  options: { value: string; label: string }[]
  currentValue: string
  baseParams: Record<string, string | undefined>
}

export default function FilterSelect({ label, paramName, options, currentValue, baseParams }: FilterSelectProps) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    const p = new URLSearchParams()
    const merged = { ...baseParams, [paramName]: val || undefined }
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== '') p.set(k, v)
    }
    const qs = p.toString()
    router.push(`/repertuar${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] tracking-[0.06em] uppercase text-text-2 font-medium">{label}:</span>
      <select
        value={currentValue}
        onChange={handleChange}
        className="text-[12px] text-text-1 bg-bg-card border-[0.5px] border-border rounded-[2px] px-3 py-[5px] cursor-pointer hover:border-gold transition-all outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
