import Link from 'next/link'

export default function Footer() {
  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <footer className="py-5 pb-7 flex flex-col md:flex-row justify-between items-center gap-3 border-t-[0.5px] border-border text-center">
        <div className="text-[11px] text-text-2">
          &copy; {new Date().getFullYear()} Świat Baletu &middot; Wszelkie prawa zastrzeżone
        </div>
        <div className="flex gap-5">
          {['O nas', 'Kontakt', 'Newsletter', 'Reklama'].map((label) => (
            <Link
              key={label}
              href="#"
              className="text-[11px] text-text-2 hover:text-gold transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
