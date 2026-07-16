import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/* ----------------------------- Button ----------------------------- */
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_16px_-6px_rgba(121,22,255,0.6)] hover:from-brand-400 hover:to-brand-500 active:translate-y-px',
  secondary:
    'bg-white/[0.06] text-zinc-100 border border-white/10 hover:bg-white/10 hover:border-white/20 active:translate-y-px',
  danger:
    'bg-red-600/90 text-white hover:bg-red-500 active:translate-y-px shadow-[0_6px_16px_-6px_rgba(220,38,38,0.5)]',
  ghost: 'text-zinc-300 hover:bg-white/5 hover:text-zinc-100',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/* ----------------------------- Inputs ----------------------------- */
const fieldClass =
  'w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-brand-500/70 focus:bg-black/30 focus:ring-2 focus:ring-brand-500/25'

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      {children}
      {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldClass} {...props} />
}

export function Select({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClass} cursor-pointer ${className}`} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={fieldClass} rows={3} {...props} />
}

/* ----------------------------- Card ------------------------------- */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-surface-2 p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  )
}

/* ----------------------------- Badge ------------------------------ */
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'green' | 'red' | 'amber' | 'brand'
}) {
  const tones = {
    neutral: 'bg-white/10 text-zinc-300 ring-white/10',
    green: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20',
    red: 'bg-red-500/15 text-red-300 ring-red-500/20',
    amber: 'bg-amber-500/15 text-amber-300 ring-amber-500/20',
    brand: 'bg-brand-500/15 text-brand-300 ring-brand-500/25',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/* ----------------------------- Modal ------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className={`animate-pop mt-10 mb-10 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-2xl border border-white/10 bg-surface-2 shadow-pop`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/* --------------------------- Empty state -------------------------- */
export function EmptyState({
  title,
  subtitle,
  icon = '📦',
}: {
  title: string
  subtitle?: string
  icon?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-zinc-500">{subtitle}</p>}
    </div>
  )
}

/* ----------------------------- Spinner ---------------------------- */
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-brand-500" />
    </div>
  )
}
