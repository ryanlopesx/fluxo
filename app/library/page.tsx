'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Filter } from 'lucide-react'
import type { Roteiro, EstagioFunil } from '@/types'
import PageTransition from '@/components/PageTransition'
import ScriptCard from '@/components/ScriptCard'
import FunnelBadge from '@/components/FunnelBadge'

type FiltroStatus = 'todos' | 'draft' | 'approved' | 'used'
type FiltroEstagio = 'todos' | EstagioFunil

export default function BibliotecaPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const [filtroEstagio, setFiltroEstagio] = useState<FiltroEstagio>('todos')

  useEffect(() => {
    fetch('/api/scripts')
      .then(r => r.json())
      .then(j => { setRoteiros(j.data || []); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [])

  const mudarStatus = async (id: string, status: string) => {
    await fetch(`/api/scripts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setRoteiros(rs => rs.map(r => r.id === id ? { ...r, status: status as 'draft' | 'approved' | 'used' } : r))
  }

  const deletar = async (id: string) => {
    await fetch(`/api/scripts/${id}`, { method: 'DELETE' })
    setRoteiros(rs => rs.filter(r => r.id !== id))
  }

  const filtrados = roteiros.filter(r => {
    if (filtroStatus !== 'todos' && r.status !== filtroStatus) return false
    if (filtroEstagio !== 'todos' && r.funnel_stage !== filtroEstagio) return false
    return true
  })

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <BookOpen size={22} className="text-ink-3" /> Biblioteca
          </h1>
          <p className="text-sm text-secondary mt-1">{roteiros.length} roteiro{roteiros.length !== 1 ? 's' : ''} no total</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <Filter size={12} className="text-muted" />
            <span className="text-xs text-muted">Status:</span>
            {(['todos', 'draft', 'approved', 'used'] as FiltroStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  filtroStatus === s ? 'bg-green/10 border-green/30 text-green' : 'border-border text-muted hover:text-secondary'
                }`}
              >
                {s === 'todos' ? 'Todos' : s === 'draft' ? 'Rascunho' : s === 'approved' ? 'Aprovados' : 'Usados'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted">Estágio:</span>
            <button
              onClick={() => setFiltroEstagio('todos')}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                filtroEstagio === 'todos' ? 'bg-green/10 border-green/30 text-green' : 'border-border text-muted hover:text-secondary'
              }`}
            >
              Todos
            </button>
            {(['tofu', 'mofu', 'bofu'] as EstagioFunil[]).map(e => (
              <button key={e} onClick={() => setFiltroEstagio(e)}>
                <FunnelBadge estagio={e} tamanho="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {carregando ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtrados.length > 0 ? (
          <div className="space-y-3">
            {filtrados.map((r, i) => (
              <ScriptCard key={r.id} roteiro={r} delay={i * 0.04} onStatusChange={mudarStatus} onDelete={deletar} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-border rounded-xl"
          >
            <BookOpen size={40} className="text-muted mx-auto mb-3" />
            <p className="text-secondary font-medium">
              {filtroStatus !== 'todos' || filtroEstagio !== 'todos' ? 'Nenhum roteiro com esses filtros' : 'Nenhum roteiro ainda'}
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
