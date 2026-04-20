'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Zap, Tag, Users, Mic, FileText, Trash2 } from 'lucide-react'
import type { Projeto, Roteiro } from '@/types'
import PageTransition from '@/components/PageTransition'
import ScriptCard from '@/components/ScriptCard'
import FunnelBadge from '@/components/FunnelBadge'
import Button from '@/components/ui/Button'

export default function ProjetoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [projeto, setProjeto] = useState<(Projeto & { total_roteiros: number }) | null>(null)
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [deletando, setDeletando] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then(r => r.json()),
      fetch(`/api/scripts?project_id=${id}`).then(r => r.json()),
    ]).then(([pj, sc]) => {
      setProjeto(pj.data)
      setRoteiros(sc.data || [])
      setCarregando(false)
    }).catch(() => setCarregando(false))
  }, [id])

  const mudarStatus = async (roteiroId: string, status: string) => {
    await fetch(`/api/scripts/${roteiroId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setRoteiros(rs => rs.map(r => r.id === roteiroId ? { ...r, status: status as 'draft' | 'approved' | 'used' } : r))
  }

  const deletarRoteiro = async (roteiroId: string) => {
    await fetch(`/api/scripts/${roteiroId}`, { method: 'DELETE' })
    setRoteiros(rs => rs.filter(r => r.id !== roteiroId))
  }

  const deletarProjeto = async () => {
    if (!confirm('Deletar projeto e todos os roteiros?')) return
    setDeletando(true)
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.push('/projects')
  }

  if (carregando) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        <div className="h-8 w-48 rounded-lg shimmer" />
        <div className="h-32 rounded-xl shimmer" />
      </div>
    )
  }

  if (!projeto) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-secondary">Projeto não encontrado.</p>
        <Link href="/projects" className="text-accent text-sm mt-2 inline-block">← Voltar</Link>
      </div>
    )
  }

  const porEstagio = {
    tofu: roteiros.filter(r => r.funnel_stage === 'tofu'),
    mofu: roteiros.filter(r => r.funnel_stage === 'mofu'),
    bofu: roteiros.filter(r => r.funnel_stage === 'bofu'),
  }

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-muted hover:text-secondary transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-primary">{projeto.name}</h1>
              <p className="text-sm text-muted">{projeto.product_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${id}/generate`}>
              <Button variante="primary" icone={<Zap size={14} />}>Gerar Roteiro</Button>
            </Link>
            <Button variante="danger" tamanho="md" icone={<Trash2 size={13} />} carregando={deletando} onClick={deletarProjeto}>
              Deletar
            </Button>
          </div>
        </div>

        {/* Info do projeto */}
        <div
          style={{ borderLeftColor: projeto.color, borderLeftWidth: 3, background: `linear-gradient(135deg, ${projeto.color}08 0%, transparent 50%)` }}
          className="rounded-xl border border-border p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="flex items-start gap-2">
            <Users size={14} className="text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">Público</p>
              <p className="text-sm text-secondary leading-snug">{projeto.target_audience}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mic size={14} className="text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">Tom de Voz</p>
              <p className="text-sm text-secondary">{projeto.voice_tone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Tag size={14} className="text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">Keywords</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(projeto.keywords as string[]).slice(0, 3).map(k => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-elevated border border-border text-muted">{k}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText size={14} className="text-muted mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider">Roteiros</p>
              <p className="text-sm text-secondary">{roteiros.length} gerado{roteiros.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Roteiros por estágio */}
        {roteiros.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Zap size={40} className="text-muted mx-auto mb-3" />
            <p className="text-secondary font-medium">Nenhum roteiro gerado</p>
            <p className="text-muted text-sm mt-1 mb-4">Clique em "Gerar Roteiro" para começar</p>
            <Link href={`/projects/${id}/generate`}>
              <Button variante="primary" icone={<Zap size={14} />}>Gerar Roteiro</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {(['tofu', 'mofu', 'bofu'] as const).map(estagio => {
              const lista = porEstagio[estagio]
              if (lista.length === 0) return null
              return (
                <div key={estagio}>
                  <div className="flex items-center gap-2 mb-3">
                    <FunnelBadge estagio={estagio} mostrarDescricao />
                    <span className="text-xs text-muted">({lista.length})</span>
                  </div>
                  <div className="space-y-3">
                    {lista.map((r, i) => (
                      <ScriptCard
                        key={r.id}
                        roteiro={r}
                        delay={i * 0.04}
                        onStatusChange={mudarStatus}
                        onDelete={deletarRoteiro}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
