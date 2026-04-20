'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { SETE_ERROS } from '@/types'

export default function ErrorsPanel() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-mono text-muted uppercase tracking-wider mb-3">Os 7 Erros que Matam Qualquer Reels</p>
      {SETE_ERROS.map((erro, i) => (
        <motion.div
          key={erro.numero}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex gap-3 p-3 rounded-lg bg-red-950/10 border border-red-900/20 hover:border-red-800/30 transition-colors"
        >
          <div className="shrink-0 flex items-start gap-2">
            <AlertTriangle size={13} className="text-red-400 mt-0.5" />
            <span className="font-mono text-xs text-red-500">{erro.numero}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary">{erro.titulo}</p>
            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{erro.descricao}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
