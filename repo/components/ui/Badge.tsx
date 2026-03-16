interface BadgeProps {
  variant: 'red' | 'amber' | 'green'
  children: React.ReactNode
}

const variantClasses = {
  red: 'bg-badge-red-bg text-badge-red-txt',
  amber: 'bg-badge-amber-bg text-badge-amber-txt',
  green: 'bg-badge-green-bg text-badge-green-txt',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[9px] tracking-[0.08em] uppercase px-[9px] py-[2px] rounded-[10px] mt-[9px] font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
