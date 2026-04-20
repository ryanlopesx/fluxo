import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { EstagioFunil } from '@/types'

type BadgeVariante = 'tofu' | 'mofu' | 'bofu' | 'brand' | 'muted' | 'success' | 'warning' | 'danger' | 'rehook'

interface BadgeProps {
  variante?: BadgeVariante
  children: React.ReactNode
  className?: string
  tamanho?: 'sm' | 'md'
  ponto?: boolean
}

const estilos: Record<BadgeVariante, string> = {
  tofu:    'bg-tofu/10 text-tofu border border-tofu/20',
  mofu:    'bg-mofu/10 text-mofu border border-mofu/20',
  bofu:    'bg-green/10 text-green border border-green/20',
  brand:   'bg-green/10 text-green border border-green/20',
  muted:   'bg-raised text-ink-2 border border-line',
  success: 'bg-green/10 text-green border border-green/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger:  'bg-danger/10 text-danger border border-danger/20',
  rehook:  'bg-rehook/10 text-rehook border border-rehook/20',
}

export default function Badge({ variante = 'muted', children, className, tamanho = 'md', ponto = false }: BadgeProps) {
  return (
    <span className={twMerge(clsx(
      'inline-flex items-center gap-1.5 font-medium rounded font-mono',
      tamanho === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
      estilos[variante],
      className
    ))}>
      {ponto && <span className="w-1 h-1 rounded-full bg-current shrink-0" />}
      {children}
    </span>
  )
}

export function badgePorEstagio(estagio: EstagioFunil): BadgeVariante {
  return estagio as BadgeVariante
}
