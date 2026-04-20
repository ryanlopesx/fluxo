import { clsx } from 'clsx'
import type { EstagioFunil } from '@/types'
import { ESTAGIO_LABELS, ESTAGIO_DESCRICAO } from '@/types'
import { TrendingUp, Target, ShoppingCart } from 'lucide-react'

const icones: Record<EstagioFunil, React.ReactNode> = {
  tofu: <TrendingUp size={10} />,
  mofu: <Target size={10} />,
  bofu: <ShoppingCart size={10} />,
}

const estilos: Record<EstagioFunil, string> = {
  tofu: 'bg-tofu/10 text-tofu border border-tofu/20',
  mofu: 'bg-mofu/10 text-mofu border border-mofu/20',
  bofu: 'bg-bofu/10 text-bofu border border-bofu/20',
}

interface FunnelBadgeProps {
  estagio: EstagioFunil
  mostrarDescricao?: boolean
  tamanho?: 'sm' | 'md' | 'lg'
}

export default function FunnelBadge({ estagio, mostrarDescricao = false, tamanho = 'md' }: FunnelBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded font-mono uppercase tracking-wider font-medium',
      estilos[estagio],
      tamanho === 'sm' && 'px-1.5 py-0.5 text-[9px]',
      tamanho === 'md' && 'px-2 py-0.5 text-[10px]',
      tamanho === 'lg' && 'px-2.5 py-1 text-xs',
    )}>
      {icones[estagio]}
      {ESTAGIO_LABELS[estagio]}
      {mostrarDescricao && (
        <span className="text-ink-3 font-normal normal-case tracking-normal ml-1">
          — {ESTAGIO_DESCRICAO[estagio]}
        </span>
      )}
    </span>
  )
}
