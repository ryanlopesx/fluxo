'use client'

import { motion } from 'framer-motion'
import { Scissors, Clock, Music, Trash2 } from 'lucide-react'
import type { PlanoCuts } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CutPlanCardProps {
  plano: PlanoCuts
  delay?: number
  onDelete?: (id: string) => void
  onSelecionar?: (plano: PlanoCuts) => void
}

export default function CutPlanCard({ plano, delay = 0, onDelete, onSelecionar }: CutPlanCardProps) {
  const tempoAgo = formatDistanceToNow(new Date(plano.created_at), { addSuffix: true, locale: ptBR })
  const totalCortes = plano.cuts.length
  const temRehook = plano.cuts.some(c => c.is_rehook)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-border p-4 space-y-3 hover:border-border/80 transition-colors cursor-pointer"
      onClick={() => onSelecionar?.(plano)}
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 50%)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/50 border border-indigo-800/30 flex items-center justify-center">
            <Scissors size={14} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-primary">{plano.title}</h3>
            <p className="text-xs text-muted">{plano.style}</p>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete?.(plano.id) }}
          className="text-muted hover:text-red-400 transition-colors p-1 rounded"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>{plano.video_duration}s</span>
        </div>
        <div className="flex items-center gap-1">
          <Scissors size={11} />
          <span>{totalCortes} cortes</span>
        </div>
        <div className="flex items-center gap-1">
          <Music size={11} />
          <span className="truncate max-w-[100px]">{plano.music_mood}</span>
        </div>
        {temRehook && (
          <span className="text-[10px] font-mono text-purple-400 border border-purple-700/30 px-1.5 py-0.5 rounded">RE-HOOK ✓</span>
        )}
      </div>

      {plano.instructions_general && (
        <p className="text-xs text-secondary leading-relaxed line-clamp-2">{plano.instructions_general}</p>
      )}

      <p className="text-[10px] text-muted">{tempoAgo}</p>
    </motion.div>
  )
}
