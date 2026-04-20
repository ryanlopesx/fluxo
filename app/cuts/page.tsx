'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, Clock, Copy, Check, Music, Film, Zap, Trash2 } from 'lucide-react'
import type { PlanoCuts, Roteiro } from '@/types'
import PageTransition from '@/components/PageTransition'
import CutTimeline from '@/components/CutTimeline'
import CutPlanCard from '@/components/CutPlanCard'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Input from '@/components/ui/Input'

const ESTILOS = ['dinâmico', 'lento', 'trend', 'tutorial', 'dramático']

const PLACEHOLDERS_PROMPT = [
  'Ex: Vídeo sobre como reduzir custo de ração, começa no campo, corte rápido no gancho, texto animado no re-hook',
  'Ex: Tutorial de 30s mostrando o protocolo de 3 passos, câmera frontal estável, cortes no beat',
  'Ex: Vídeo dramático, começa com problema real, corte brusco para solução, encerra com desfecho impactante',
  'Ex: Vídeo de trend no estilo "pov:", ritmo rápido, texto em tela em todo o vídeo, fundo simples',
]

function CopiaTudo({ plano }: { plano: PlanoCuts }) {
  const [copiado, setCopiado] = useState(false)
  const textoCompleto = [
    `PLANO DE CORTES — ${plano.title}`,
    `Duração: ${plano.video_duration}s | Estilo: ${plano.style} | Ritmo: ${plano.rhythm}`,
    '',
    `INSTRUÇÕES GERAIS:\n${plano.instructions_general}`,
    '',
    'CORTES:',
    ...plano.cuts.map(c =>
      `[${c.start}s-${c.end}s] #${c.index} ${c.label}${c.is_rehook ? ' ⚡ RE-HOOK' : ''}\n` +
      `Ação: ${c.description}\nCâmera: ${c.camera} / ${c.movement}\n` +
      (c.text_overlay ? `Texto: ${c.text_overlay}\n` : '') +
      `Transição: ${c.transition_to_next}`
    ),
    '',
    `B-ROLL: ${plano.broll_suggestions.join(', ')}`,
    `MÚSICA: ${plano.music_mood}`,
    `LEGENDAS: ${plano.caption_style}`,
  ].join('\n')

  const copiar = async () => {
    await navigator.clipboard.writeText(textoCompleto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <Button variante="secondary" tamanho="sm" icone={copiado ? <Check size={12} className="text-bofu" /> : <Copy size={12} />} onClick={copiar}>
      {copiado ? 'Copiado!' : 'Copiar tudo'}
    </Button>
  )
}

export default function CortadorPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [planos, setPlanos] = useState<PlanoCuts[]>([])
  const [planoAtivo, setPlanoAtivo] = useState<PlanoCuts | null>(null)
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    title: '',
    user_prompt: '',
    video_duration: 30,
    style: 'dinâmico',
    script_id: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/scripts').then(r => r.json()),
      fetch('/api/cuts').then(r => r.json()),
    ]).then(([sc, ct]) => {
      setRoteiros(sc.data || [])
      setPlanos(ct.data || [])
      if ((ct.data || []).length > 0) setPlanoAtivo(ct.data[0])
    })
  }, [])

  const gerar = async () => {
    if (!form.user_prompt.trim()) { setErro('Descreva como quer o vídeo.'); return }
    setGerando(true)
    setErro('')
    try {
      const resp = await fetch('/api/cuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          title: form.title || `Plano ${new Date().toLocaleDateString('pt-BR')}`,
          script_id: form.script_id || undefined,
        }),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error)
      const novoPlano = json.data
      setPlanos(ps => [novoPlano, ...ps])
      setPlanoAtivo(novoPlano)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar plano')
    } finally {
      setGerando(false)
    }
  }

  const deletarPlano = async (id: string) => {
    await fetch(`/api/cuts?id=${id}`, { method: 'DELETE' })
    setPlanos(ps => ps.filter(p => p.id !== id))
    if (planoAtivo?.id === id) setPlanoAtivo(planos.find(p => p.id !== id) || null)
  }

  return (
    <PageTransition>
      <div className="p-4 lg:p-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Scissors size={22} className="text-accent" /> Cortador de Vídeo
          </h1>
          <p className="text-sm text-secondary mt-1">Descreva em linguagem natural e a IA gera o plano de cortes seguindo a linha do tempo viral</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* PAINEL ESQUERDO — Configuração */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <Input
                label="Título do Plano (opcional)"
                placeholder="Ex: Vídeo Moringa 30s Dinâmico"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />

              <Textarea
                label="Descreva como quer o vídeo *"
                placeholders={PLACEHOLDERS_PROMPT}
                value={form.user_prompt}
                onChange={e => setForm(f => ({ ...f, user_prompt: e.target.value }))}
                rows={5}
                className="h-32"
              />

              {/* Duração */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
                    <Clock size={13} className="text-muted" /> Duração
                  </label>
                  <span className="text-sm font-mono text-accent">{form.video_duration}s</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  step={5}
                  value={form.video_duration}
                  onChange={e => setForm(f => ({ ...f, video_duration: Number(e.target.value) }))}
                  className="w-full h-1.5 rounded-full bg-elevated appearance-none cursor-pointer accent-green"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>15s</span><span>30s</span><span>45s</span><span>60s</span><span>90s</span>
                </div>
              </div>

              {/* Estilo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
                  <Film size={13} className="text-muted" /> Estilo
                </label>
                <div className="flex flex-wrap gap-2">
                  {ESTILOS.map(est => (
                    <button
                      key={est}
                      onClick={() => setForm(f => ({ ...f, style: est }))}
                      className={`px-3 py-1.5 rounded-lg text-sm border capitalize transition-all ${
                        form.style === est ? 'bg-green/10 border-green/30 text-green' : 'border-border text-muted hover:text-secondary'
                      }`}
                    >
                      {est}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vincular a roteiro */}
              {roteiros.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-secondary flex items-center gap-1.5">
                    <Zap size={13} className="text-muted" /> Vincular a um Roteiro (opcional)
                  </label>
                  <select
                    value={form.script_id}
                    onChange={e => setForm(f => ({ ...f, script_id: e.target.value }))}
                    className="w-full h-10 rounded-lg bg-elevated border border-border text-secondary text-sm px-3 focus:outline-none focus:border-accent/60"
                  >
                    <option value="">Sem roteiro vinculado</option>
                    {roteiros.map(r => (
                      <option key={r.id} value={r.id}>{r.title} ({r.funnel_stage.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              )}

              {erro && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 bg-red-950/20 border border-red-800/30 rounded-lg px-3 py-2">
                  {erro}
                </motion.p>
              )}

              <Button variante="primary" tamanho="lg" className="w-full" carregando={gerando} icone={<Scissors size={15} />} onClick={gerar}>
                {gerando ? 'Gerando plano de cortes...' : 'Gerar Plano de Cortes'}
              </Button>
            </div>

            {/* Planos salvos */}
            {planos.length > 0 && (
              <div>
                <p className="text-xs font-mono text-muted uppercase tracking-wider mb-2">Planos Salvos ({planos.length})</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {planos.map((p, i) => (
                    <CutPlanCard
                      key={p.id}
                      plano={p}
                      delay={i * 0.04}
                      onDelete={deletarPlano}
                      onSelecionar={setPlanoAtivo}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PAINEL DIREITO — Resultado */}
          <div>
            <AnimatePresence mode="wait">
              {gerando && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl shimmer" />
                  ))}
                </motion.div>
              )}

              {planoAtivo && !gerando && (
                <motion.div key={planoAtivo.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Header do plano */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-medium text-primary">{planoAtivo.title}</h2>
                      <p className="text-xs text-muted">{planoAtivo.style} · {planoAtivo.video_duration}s · {planoAtivo.cuts.length} cortes</p>
                    </div>
                    <CopiaTudo plano={planoAtivo} />
                  </div>

                  {/* Instruções gerais */}
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs font-mono text-muted uppercase tracking-wider mb-2">Instruções Gerais</p>
                    <p className="text-sm text-secondary leading-relaxed">{planoAtivo.instructions_general}</p>
                  </div>

                  {/* Timeline */}
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <CutTimeline cortes={planoAtivo.cuts} duracaoTotal={planoAtivo.total_duration || planoAtivo.video_duration} />
                  </div>

                  {/* B-Roll + Música */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface border border-border rounded-xl p-3">
                      <p className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">B-Roll Sugerido</p>
                      <div className="flex flex-wrap gap-1">
                        {planoAtivo.broll_suggestions.map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-elevated border border-border text-secondary">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-3 space-y-1.5">
                      <div>
                        <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Música</p>
                        <p className="text-xs text-secondary flex items-center gap-1"><Music size={10} /> {planoAtivo.music_mood}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Legendas</p>
                        <p className="text-xs text-secondary">{planoAtivo.caption_style}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!planoAtivo && !gerando && (
                <motion.div key="vazio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
                  <Scissors size={40} className="text-muted mb-3" />
                  <p className="text-secondary font-medium">Nenhum plano gerado</p>
                  <p className="text-muted text-sm mt-1">Descreva o vídeo e clique em gerar</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
