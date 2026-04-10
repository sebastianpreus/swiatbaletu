import Link from 'next/link'
import NewsletterForm from './NewsletterForm'

export default function Footer() {
  return (
    <div className="max-w-[1100px] mx-auto px-6">
      {/* Newsletter section */}
      <div className="py-8 border-t-[0.5px] border-border">
        <div className="max-w-full sm:max-w-[420px]">
          <NewsletterForm />
        </div>
      </div>

      {/* Bottom bar */}
      <footer className="py-5 pb-7 flex flex-col md:flex-row justify-between items-center gap-3 border-t-[0.5px] border-border text-center">
        <div className="text-[11px] text-text-2">
          &copy; {new Date().getFullYear()} Świat Baletu &middot; Wszelkie prawa zastrzeżone
        </div>
        <div className="flex gap-5">
          {[
            { label: 'O nas', href: '/o-nas' },
            { label: 'Kontakt', href: '/o-nas#kontakt' },
            { label: 'Reklama', href: '/o-nas#kontakt' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
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
