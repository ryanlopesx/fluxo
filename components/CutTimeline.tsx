'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Corte } from '@/types'
import { Copy, Check } from 'lucide-react'

interface CutTimelineProps {
  cortes: Corte[]
  duracaoTotal: number
}

const CORES_FASE: Record<number, string> = {
  1: '#3B82F6',
  2: '#F59E0B',
  3: '#10B981',
  4: '#8B5CF6',
}

const NOMES_FASE: Record<number, string> = {
  1: 'Gancho',
  2: 'Contexto',
  3: 'Resolução',
  4: 'Desfecho',
}

function CopyButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false)
  const copiar = async () => {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }
  return (
    <button onClick={copiar} className="p-1 rounded hover:bg-white/5 text-muted hover:text-secondary transition-colors">
      {copiado ? <Check size={11} className="text-bofu" /> : <Copy size={11} />}
    </button>
  )
}

export default function CutTimeline({ cortes, duracaoTotal }: CutTimelineProps) {
  const [selecionado, setSelecionado] = useState<number | null>(null)
  const duracao = duracaoTotal || 40

  return (
    <div className="space-y-4">
      {/* Barra visual */}
      <div>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mb-2">Linha do Tempo de Cortes</p>
        <div className="flex rounded-lg overflow-hidden h-10 border border-border">
          {cortes.map((corte, i) => {
            const largura = ((corte.end - corte.start) / duracao) * 100
            const cor = corte.is_rehook ? '#8B5CF6' : CORES_FASE[corte.phase] || '#6366F1'
            const ativo = selecionado === i

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                style={{
                  width: `${largura}%`,
                  backgroundColor: ativo ? cor : `${cor}30`,
                  borderRight: '1px solid rgba(0,0,0,0.3)',
                  boxShadow: corte.is_rehook ? `0 0 12px ${cor}60` : 'none',
                }}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${corte.is_rehook ? 'rehook-pulse' : ''}`}
                onClick={() => setSelecionado(selecionado === i ? null : i)}
                title={`${corte.start}s — ${corte.end}s: ${corte.label}`}
              >
                <span className="text-[9px] font-mono truncate px-0.5" style={{ color: ativo ? '#fff' : cor }}>
                  {corte.index}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Timestamps */}
        <div className="flex justify-between mt-1">
          <span className="text-[9px] font-mono text-muted">0s</span>
          <span className="text-[9px] font-mono text-muted">{duracao}s</span>
        </div>
      </div>

      {/* Cards dos cortes */}
      <div className="space-y-2">
        {cortes.map((corte, i) => {
          const cor = corte.is_rehook ? '#8B5CF6' : CORES_FASE[corte.phase] || '#6366F1'
          const ativo = selecionado === i

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ borderLeftColor: cor, borderLeftWidth: 3, background: ativo ? `${cor}08` : undefined, outline: ativo ? `1px solid ${cor}40` : 'none' }}
              className="rounded-lg border border-border p-3 cursor-pointer transition-all duration-150 hover:border-border/80"
              onClick={() => setSelecionado(selecionado === i ? null : i)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium" style={{ color: cor }}>{String(corte.index).padStart(2, '0')}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">{corte.label}</span>
                      {corte.is_rehook && (
                        <span className="text-[10px] font-mono text-purple-300 border border-purple-700/40 px-1 py-0.5 rounded">⚡ RE-HOOK</span>
                      )}
                      <span className="text-[10px] text-muted font-mono border border-border px-1 py-0.5 rounded">{NOMES_FASE[corte.phase]}</span>
                    </div>
                    <p className="text-[10px] text-muted font-mono">{corte.start}s — {corte.end}s · {corte.type}</p>
                  </div>
                </div>
                <CopyButton texto={`[${corte.start}s-${corte.end}s] ${corte.description}\nCâmera: ${corte.camera} / ${corte.movement}\nTransição: ${corte.transition_to_next}`} />
              </div>

              {ativo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs text-secondary"
                >
                  <p><span className="text-muted">Ação:</span> {corte.description}</p>
                  <p><span className="text-muted">Câmera:</span> {corte.camera} · <span className="text-muted">Movimento:</span> {corte.movement}</p>
                  {corte.text_overlay && <p><span className="text-muted">Texto em tela:</span> {corte.text_overlay}</p>}
                  {corte.audio_note && <p><span className="text-muted">Áudio:</span> {corte.audio_note}</p>}
                  <p><span className="text-muted">Transição:</span> {corte.transition_to_next}</p>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
