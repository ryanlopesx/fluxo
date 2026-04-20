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
  tendencia?: number
}

function useCountUp(valor: number, duracao = 1200) {
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

export default function StatsCard({ titulo, valor, icone, cor, descricao, delay = 0, sufixo = '', tendencia }: StatsCardProps) {
  const valorAnimado = useCountUp(valor)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
      className="bg-surface border border-line rounded p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-mono text-ink-3 uppercase tracking-wider">{titulo}</p>
        <div
          style={{ color: cor, backgroundColor: `${cor}12`, borderColor: `${cor}20` }}
          className="w-7 h-7 rounded border flex items-center justify-center shrink-0"
        >
          {icone}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold text-ink leading-none tabular-nums">
          {valorAnimado}{sufixo}
        </span>
        {tendencia !== undefined && tendencia !== 0 && (
          <span className={`text-xs font-mono mb-0.5 ${tendencia > 0 ? 'text-green' : 'text-danger'}`}>
            {tendencia > 0 ? '+' : ''}{tendencia}%
          </span>
        )}
      </div>

      {descricao && (
        <p className="text-xs text-ink-3 mt-2 leading-relaxed">{descricao}</p>
      )}

      <div className="mt-3 h-px bg-line overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: valor > 0 ? '100%' : '0%' }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
          style={{ backgroundColor: cor }}
          className="h-full"
        />
      </div>
    </motion.div>
  )
}
