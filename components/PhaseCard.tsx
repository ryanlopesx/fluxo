'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface PhaseCardProps {
  numero: '01' | '02' | '03' | '04'
  nomeFase: string
  duracaoSeg: string
  tipoDetectado?: string
  children: React.ReactNode
  cor: string
  corBg: string
  delay?: number
  destaque?: boolean
}

export default function PhaseCard({
  numero, nomeFase, duracaoSeg, tipoDetectado, children, cor, corBg, delay = 0, destaque = false
}: PhaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      style={{
        borderLeftColor: cor,
        borderLeftWidth: 3,
        background: `linear-gradient(135deg, ${corBg} 0%, rgba(13,17,23,0) 60%)`,
      }}
      className={clsx(
        'rounded-xl border border-border p-4 space-y-3',
        destaque && 'ring-1 ring-purple-700/40'
      )}
    >
      {/* Cabeçalho da fase */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-medium text-2xl leading-none" style={{ color: cor }}>{numero}</span>
          <div>
            <p className="text-sm font-medium text-primary">{nomeFase}</p>
            <p className="text-xs text-muted font-mono">{duracaoSeg}</p>
          </div>
        </div>
        {tipoDetectado && (
          <span
            style={{ color: cor, borderColor: `${cor}40`, backgroundColor: `${cor}10` }}
            className="text-[10px] font-mono px-2 py-0.5 rounded border shrink-0"
          >
            {tipoDetectado}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="text-sm text-secondary leading-relaxed">
        {children}
      </div>
    </motion.div>
  )
}
