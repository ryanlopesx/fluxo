'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, ChevronDown, ChevronUp, ThumbsUp, BookCheck, Trash2, Zap } from 'lucide-react'
import type { Roteiro } from '@/types'
import { ESTAGIO_CORES } from '@/types'
import FunnelBadge from './FunnelBadge'
import Badge from './ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ScriptCardProps {
  roteiro: Roteiro
  delay?: number
  onStatusChange?: (id: string, status: string) => void
  onDelete?: (id: string) => void
}

function BotaoCopiar({ texto, tamanho = 'sm' }: { texto: string; tamanho?: 'sm' | 'md' }) {
  const [copiado, setCopiado] = useState(false)
  const copiar = async () => {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }
  return (
    <button
      onClick={copiar}
      className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink-2 transition-colors px-2 py-1 rounded hover:bg-raised"
    >
      {copiado ? <Check size={11} className="text-green" /> : <Copy size={11} />}
      {tamanho === 'md' && <span>{copiado ? 'Copiado!' : 'Copiar'}</span>}
    </button>
  )
}

const STATUS_LABELS: Record<string, string> = {
  draft:    'Rascunho',
  approved: 'Aprovado',
  used:     'Usado',
}

const STATUS_CORES: Record<string, 'muted' | 'success' | 'brand'> = {
  draft:    'muted',
  approved: 'success',
  used:     'brand',
}

export default function ScriptCard({ roteiro, delay = 0, onStatusChange, onDelete }: ScriptCardProps) {
  const [expandido, setExpandido] = useState(false)
  const [confirmandoDelete, setConfirmandoDelete] = useState(false)
  const cor = ESTAGIO_CORES[roteiro.funnel_stage]
  const tempoAgo = formatDistanceToNow(new Date(roteiro.created_at), { addSuffix: true, locale: ptBR })
  const scoreColor = roteiro.checklist_score >= 8 ? '#1DB954' : roteiro.checklist_score >= 5 ? '#D98C00' : '#E5534B'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
      className="bg-surface border border-line rounded overflow-hidden"
    >
      {/* Header */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <FunnelBadge estagio={roteiro.funnel_stage} />
            <Badge variante={STATUS_CORES[roteiro.status] as 'muted' | 'success' | 'brand'} tamanho="sm">
              {STATUS_LABELS[roteiro.status]}
            </Badge>
            <span style={{ color: scoreColor }} className="text-[10px] font-mono">
              {roteiro.checklist_score}/10
            </span>
          </div>
          <span className="text-[10px] text-ink-3 font-mono shrink-0">{tempoAgo}</span>
        </div>

        <h3 className="text-sm font-medium text-ink line-clamp-1">{roteiro.title}</h3>

        <div className="flex items-start gap-2">
          <Zap size={11} style={{ color: cor }} className="shrink-0 mt-0.5" />
          <p className="text-xs text-ink-2 leading-snug line-clamp-2 flex-1">&ldquo;{roteiro.hook}&rdquo;</p>
          <BotaoCopiar texto={roteiro.hook} />
        </div>

        {roteiro.method_name && (
          <p className="text-[10px] text-ink-3 font-mono">
            Método: <span style={{ color: cor }}>{roteiro.method_name}</span>
          </p>
        )}
      </div>

      {/* Expandido */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-3 border-t border-line pt-3">
              {/* Hook variations */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Variações A/B/C</p>
                {[roteiro.hook, roteiro.hook_alt1, roteiro.hook_alt2].map((h, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-raised border border-line">
                    <span className="text-[10px] font-mono text-ink-3 shrink-0 mt-0.5">{['A', 'B', 'C'][i]}</span>
                    <p className="text-xs text-ink-2 flex-1 leading-snug">{h}</p>
                    <BotaoCopiar texto={h} />
                  </div>
                ))}
              </div>

              {/* Contexto */}
              {roteiro.context && (
                <div>
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-1">Fase 2 — Contexto</p>
                  <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-line">{roteiro.context}</p>
                </div>
              )}

              {/* Resolução + RE-HOOK */}
              {roteiro.resolution && (
                <div>
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-1">Fase 3 — Resolução</p>
                  <p className="text-xs text-ink-2 leading-relaxed">{roteiro.resolution}</p>
                  {roteiro.rehook && (
                    <div className="mt-2 p-2 rounded bg-rehook/5 border border-rehook/20">
                      <p className="text-[10px] font-mono text-rehook mb-1">RE-HOOK (18–22s)</p>
                      <p className="text-xs text-ink-2">{roteiro.rehook}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Custo da inação */}
              {roteiro.cost_of_inaction && (
                <div>
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-1">Fase 4 — Custo da Inação</p>
                  <p className="text-xs text-ink-2 leading-relaxed">{roteiro.cost_of_inaction}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-line">
                <BotaoCopiar texto={roteiro.full_script} tamanho="md" />
                {roteiro.status !== 'approved' && (
                  <button
                    onClick={() => onStatusChange?.(roteiro.id, 'approved')}
                    className="flex items-center gap-1 text-xs text-green hover:text-green-2 transition-colors px-2 py-1 rounded hover:bg-green/10"
                  >
                    <ThumbsUp size={11} /> Aprovar
                  </button>
                )}
                {roteiro.status !== 'used' && (
                  <button
                    onClick={() => onStatusChange?.(roteiro.id, 'used')}
                    className="flex items-center gap-1 text-xs text-tofu hover:text-tofu/80 transition-colors px-2 py-1 rounded hover:bg-tofu/10"
                  >
                    <BookCheck size={11} /> Usado
                  </button>
                )}
                <div className="ml-auto">
                  {confirmandoDelete ? (
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmandoDelete(false)} className="text-xs text-ink-3 hover:text-ink-2 transition-colors">Cancelar</button>
                      <button onClick={() => onDelete?.(roteiro.id)} className="text-xs text-danger hover:text-danger/80 transition-colors">Confirmar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmandoDelete(true)} className="text-xs text-ink-3 hover:text-danger transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-center gap-1 py-2 text-[11px] text-ink-3 hover:text-ink-2 transition-colors border-t border-line hover:bg-raised/40"
      >
        {expandido ? <><ChevronUp size={11} /> Recolher</> : <><ChevronDown size={11} /> Ver detalhes</>}
      </button>
    </motion.div>
  )
}
