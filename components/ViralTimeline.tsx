'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { SEGMENTOS_TIMELINE } from '@/types'

interface ViralTimelineProps {
  compacta?: boolean
  segmentoAtivo?: number
}

const TOTAL_DURACAO = 40

export default function ViralTimeline({ compacta = false, segmentoAtivo }: ViralTimelineProps) {
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div className={compacta ? 'space-y-1' : 'space-y-3'}>
      {!compacta && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-muted uppercase tracking-wider">Linha do Tempo Viral</p>
          <p className="text-xs text-muted">0 — 40s</p>
        </div>
      )}

      {/* Barra de segmentos */}
      <div className="flex rounded-lg overflow-hidden h-8 relative">
        {SEGMENTOS_TIMELINE.map((seg, i) => {
          const largura = ((seg.fim - seg.inicio) / TOTAL_DURACAO) * 100
          const isAtivo = segmentoAtivo === i || hover === i
          const isRehook = 'isRehook' in seg && seg.isRehook

          return (
            <motion.div
              key={seg.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              style={{ width: `${largura}%`, backgroundColor: isAtivo ? seg.cor : `${seg.cor}22`, borderRight: '1px solid rgba(0,0,0,0.3)' }}
              className={`relative flex items-center justify-center cursor-default transition-colors duration-200 ${isRehook ? 'rehook-pulse' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {!compacta && (
                <span className="text-[10px] font-mono font-medium truncate px-1" style={{ color: isAtivo ? '#fff' : seg.cor }}>
                  {seg.label}
                </span>
              )}

              {/* Tooltip no hover */}
              {hover === i && !compacta && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-elevated border border-border rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none"
                >
                  <p className="text-xs font-medium text-primary">{seg.label}</p>
                  <p className="text-[10px] text-muted">{seg.inicio}s — {seg.fim}s</p>
                  <p className="text-[10px] text-secondary mt-0.5">{seg.descricao}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Timestamps */}
      {!compacta && (
        <div className="flex relative h-4">
          {SEGMENTOS_TIMELINE.map((seg, i) => {
            const posLeft = (seg.inicio / TOTAL_DURACAO) * 100
            return (
              <div
                key={`ts-${i}`}
                style={{ left: `${posLeft}%` }}
                className="absolute top-0 text-[9px] font-mono text-muted"
              >
                {seg.inicio}s
              </div>
            )
          })}
          <div style={{ left: '100%' }} className="absolute top-0 text-[9px] font-mono text-muted -translate-x-full">40s</div>
        </div>
      )}

      {/* Labels expandidos */}
      {!compacta && (
        <div className="grid grid-cols-3 gap-1 pt-1">
          {SEGMENTOS_TIMELINE.map((seg, i) => {
            const isRehook = 'isRehook' in seg && seg.isRehook
            return (
              <div
                key={`label-${i}`}
                className={`text-[10px] rounded px-2 py-1.5 border ${isRehook ? 'border-purple-700/40 bg-purple-950/20' : 'border-border bg-elevated/50'}`}
              >
                <span className="font-mono font-medium" style={{ color: seg.cor }}>{seg.inicio}–{seg.fim}s</span>
                <span className="text-muted ml-1">{seg.label}</span>
                {isRehook && <span className="ml-1 text-purple-400">⚡</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
