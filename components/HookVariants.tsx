'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Copy, Check, Zap } from 'lucide-react'

interface HookVariantsProps {
  hookPrincipal: string
  hookAlt1: string
  hookAlt2: string
}

const variantes = [
  { letra: 'A', label: 'Gancho Principal', cor: '#60A5FA', bgCor: 'rgba(96, 165, 250, 0.08)', borderCor: 'rgba(96, 165, 250, 0.25)' },
  { letra: 'B', label: 'Variação B', cor: '#FBBF24', bgCor: 'rgba(251, 191, 36, 0.08)', borderCor: 'rgba(251, 191, 36, 0.25)' },
  { letra: 'C', label: 'Variação C', cor: '#34D399', bgCor: 'rgba(52, 211, 153, 0.08)', borderCor: 'rgba(52, 211, 153, 0.25)' },
]

function BotaoCopiar({ texto, cor }: { texto: string; cor: string }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      animate={copiado ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
      onClick={copiar}
      style={{ color: cor }}
      className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
    >
      {copiado ? <Check size={13} /> : <Copy size={13} />}
    </motion.button>
  )
}

export default function HookVariants({ hookPrincipal, hookAlt1, hookAlt2 }: HookVariantsProps) {
  const ganchos = [hookPrincipal, hookAlt1, hookAlt2]

  return (
    <div className="space-y-3">
      {variantes.map((v, i) => (
        <motion.div
          key={v.letra}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            borderColor: v.borderCor,
            background: `linear-gradient(135deg, ${v.bgCor} 0%, transparent 60%)`,
          }}
          className="rounded-lg border p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div
                style={{ backgroundColor: v.bgCor, borderColor: v.borderCor, color: v.cor }}
                className="w-6 h-6 rounded-md border flex items-center justify-center text-[11px] font-mono font-bold shrink-0 mt-0.5"
              >
                {v.letra}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: v.cor }}>
                  {v.label}
                </p>
                <p className="text-sm text-primary leading-snug">
                  &ldquo;{ganchos[i]}&rdquo;
                </p>
              </div>
            </div>
            <BotaoCopiar texto={ganchos[i]} cor={v.cor} />
          </div>
        </motion.div>
      ))}

      {/* Instrução do sistema de teste */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-2 p-3 rounded-lg bg-elevated/50 border border-border"
      >
        <Zap size={14} className="text-mofu shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-secondary">Sistema de Teste de Ganchos</p>
          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
            Grave os 3 ganchos com o mesmo meio e final. Use a função{' '}
            <span className="text-mofu font-medium">Reels Teste</span> do Instagram para postar sem aparecer para seguidores.
            Publique o vencedor após 24-48h e apague os outros.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
