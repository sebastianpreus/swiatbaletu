import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  linkText?: string
  linkHref?: string
}

export default function SectionHeader({ title, linkText, linkHref }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-baseline mb-[18px]">
      <h2 className="font-serif text-[23px] font-normal text-text-1">{title}</h2>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="text-[11px] text-gold-dim tracking-[0.05em] hover:text-gold transition-colors"
        >
          {linkText}
        </Link>
      )}
    </div>
  )
}
