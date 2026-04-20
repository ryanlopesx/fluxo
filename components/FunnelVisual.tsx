'use client'

import { motion } from 'framer-motion'

interface FunnelVisualProps {
  tofu: number
  mofu: number
  bofu: number
  total: number
}

export default function FunnelVisual({ tofu, mofu, bofu, total }: FunnelVisualProps) {
  const pTofu = total > 0 ? Math.round((tofu / total) * 100) : 33
  const pMofu = total > 0 ? Math.round((mofu / total) * 100) : 33
  const pBofu = total > 0 ? Math.round((bofu / total) * 100) : 34

  const camadas = [
    { label: 'TOFU', valor: tofu, perc: pTofu, cor: '#4B8FE8', largura: '100%', desc: 'Alcance' },
    { label: 'MOFU', valor: mofu, perc: pMofu, cor: '#D98C00', largura: '76%',  desc: 'Conexão' },
    { label: 'BOFU', valor: bofu, perc: pBofu, cor: '#1DB954', largura: '52%',  desc: 'Conversão' },
  ]

  return (
    <div className="flex flex-col items-center gap-1">
      {camadas.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, scaleX: 0.85 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          style={{ width: c.largura }}
          className="relative"
        >
          <div
            style={{ borderColor: `${c.cor}25`, borderLeftColor: c.cor, borderLeftWidth: 2 }}
            className="border rounded p-2.5 flex items-center justify-between bg-surface"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.cor }} />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ color: c.cor }}>{c.label}</span>
              <span className="text-[9px] text-ink-3">{c.desc}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink tabular-nums">{c.valor}</span>
              <span className="text-[10px] font-mono text-ink-3 bg-raised border border-line px-1.5 py-0.5 rounded">{c.perc}%</span>
            </div>
          </div>
          {i < 2 && (
            <div className="flex justify-center mt-0.5">
              <svg width="10" height="5" viewBox="0 0 10 5">
                <path d="M0 0 L5 5 L10 0" fill={`${c.cor}30`} />
              </svg>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
