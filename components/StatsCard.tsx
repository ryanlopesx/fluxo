'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface StatsCardProps {
  titulo: string
  valor: number
  icone: React.ReactNode
  cor: string
  descricao?: string
  delay?: number
  sufixo?: string
}

function useCountUp(valor: number, duracao = 1000) {
  const [atual, setAtual] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const inicio = performance.now()
    const animar = (agora: number) => {
      const progresso = Math.min((agora - inicio) / duracao, 1)
      const eased = 1 - Math.pow(1 - progresso, 3)
      setAtual(Math.round(eased * valor))
      if (progresso < 1) rafRef.current = requestAnimationFrame(animar)
    }
    rafRef.current = requestAnimationFrame(animar)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [valor, duracao])

  return atual
}

export default function StatsCard({ titulo, valor, icone, cor, descricao, delay = 0, sufixo = '' }: StatsCardProps) {
  const valorAnimado = useCountUp(valor)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-surface border border-line rounded-lg p-5 relative overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: cor, opacity: 0.6 }} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-ink-3 uppercase tracking-wider">{titulo}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ color: cor, backgroundColor: `${cor}15`, border: `1px solid ${cor}25` }}
        >
          {icone}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-ink leading-none tabular-nums tracking-tight">
          {valorAnimado}{sufixo}
        </span>
      </div>

      {descricao && (
        <p className="text-[11px] text-ink-3 mt-2">{descricao}</p>
      )}
    </motion.div>
  )
}
