'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Zap, RefreshCw, Save, Check, Newspaper, PenLine, TrendingUp, Target, ShoppingCart, Instagram } from 'lucide-react'
import type { EstagioFunil, Noticia, Roteiro } from '@/types'
import { ESTAGIO_DESCRICAO, ESTAGIO_CORES } from '@/types'
import type { PostInstagram } from '@/lib/instagram'
import PageTransition from '@/components/PageTransition'
import PhaseCard from '@/components/PhaseCard'
import HookVariants from '@/components/HookVariants'
import ChecklistPanel from '@/components/ChecklistPanel'
import ViralTimeline from '@/components/ViralTimeline'
import NewsCard from '@/components/NewsCard'
import InstagramTrending from '@/components/InstagramTrending'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import FunnelBadge from '@/components/FunnelBadge'

const ICONES_ESTAGIO = {
  tofu: TrendingUp,
  mofu: Target,
  bofu: ShoppingCart,
}

const ETAPAS_LOADING = [
  'Analisando o nicho e estágio do funil...',
  'Formulando o gancho chocante...',
  'Construindo as 4 fases da metodologia...',
  'Avaliando checklist dos 10 pontos...',
]

export default function GerarRoteiro() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [projeto, setProjeto] = useState<{ name: string; product_name: string; keywords: string[] } | null>(null)
  const [estagio, setEstagio] = useState<EstagioFunil>('tofu')
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [noticiaSelecionada, setNoticiaSelecionada] = useState<Noticia | null>(null)
  const [postIgSelecionado, setPostIgSelecionado] = useState<PostInstagram | null>(null)
  const [temaCustomizado, setTemaCustomizado] = useState('')
  const [modoTema, setModoTema] = useState<'noticia' | 'instagram' | 'custom'>('noticia')
  const [gerando, setGerando] = useState(false)
  const [etapaLoading, setEtapaLoading] = useState(0)
  const [resultado, setResultado] = useState<Roteiro | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [fullScriptExpandido, setFullScriptExpandido] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          setProjeto(j.data)
          // Busca notícias com as keywords do projeto
          const query = (j.data.keywords as string[]).join(' ') || j.data.product_name
          fetch(`/api/news?q=${encodeURIComponent(query)}`)
            .then(r => r.json())
            .then(n => setNoticias(n.data || []))
        }
      })
  }, [id])

  // Anima etapas de loading
  useEffect(() => {
    if (!gerando) { setEtapaLoading(0); return }
    const intervalo = setInterval(() => {
      setEtapaLoading(e => (e + 1) % ETAPAS_LOADING.length)
    }, 1800)
    return () => clearInterval(intervalo)
  }, [gerando])

  const gerar = async () => {
    setGerando(true)
    setErro('')
    setResultado(null)
    setSalvo(false)

    try {
      const body: Record<string, unknown> = { project_id: id, funnel_stage: estagio }
      if (modoTema === 'noticia' && noticiaSelecionada) {
        body.news_source_title = noticiaSelecionada.title
        body.news_source_url = noticiaSelecionada.url
        body.news_source_description = noticiaSelecionada.description
      } else if (modoTema === 'instagram' && postIgSelecionado) {
        // Usa o post do Instagram como contexto de tendência
        body.news_source_title = `Instagram Trending: ${postIgSelecionado.autor}`
        body.news_source_url = postIgSelecionado.url
        body.news_source_description = postIgSelecionado.legenda
        body.tema_personalizado = `Tendência do Instagram: Post com ${postIgSelecionado.curtidas} curtidas e ${postIgSelecionado.engajamento_estimado}% de engajamento. Hashtags em alta: ${postIgSelecionado.hashtags.slice(0, 5).join(' ')}. Legenda de referência: "${postIgSelecionado.legenda.slice(0, 150)}"`
      } else if (modoTema === 'custom' && temaCustomizado.trim()) {
        body.tema_personalizado = temaCustomizado.trim()
      }

      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error)
      setResultado(json.data)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar roteiro')
    } finally {
      setGerando(false)
    }
  }

  const aprovar = async () => {
    if (!resultado?.id) return
    setSalvando(true)
    await fetch(`/api/scripts/${resultado.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) })
    setSalvando(false)
    setSalvo(true)
    setResultado(r => r ? { ...r, status: 'approved' } : r)
  }

  const corEstagio = ESTAGIO_CORES[estagio]

  return (
    <PageTransition>
      <div className="p-4 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-muted hover:text-secondary transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-primary">Gerar Roteiro</h1>
            {projeto && <p className="text-sm text-muted">{projeto.name}</p>}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA — Configuração */}
          <div className="space-y-4">
            {/* Seletor de estágio */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-mono text-muted uppercase tracking-wider">Estágio do Funil</p>
              <div className="grid grid-cols-3 gap-2">
                {(['tofu', 'mofu', 'bofu'] as EstagioFunil[]).map(est => {
                  const Icone = ICONES_ESTAGIO[est]
                  const cor = ESTAGIO_CORES[est]
                  const ativo = estagio === est
                  return (
                    <motion.button
                      key={est}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setEstagio(est); setResultado(null); setSalvo(false) }}
                      style={ativo ? { borderColor: `${cor}60`, background: `${cor}12`, color: cor } : {}}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200 text-center ${
                        ativo ? '' : 'border-border text-muted hover:text-secondary hover:border-border/80'
                      }`}
                    >
                      <Icone size={16} />
                      <span className="text-xs font-mono font-medium uppercase">{est}</span>
                      <span className="text-[9px] text-current opacity-70 leading-tight hidden lg:block">{ESTAGIO_DESCRICAO[est]}</span>
                      {ativo && (
                        <motion.div layoutId="activeEstagio" className="absolute inset-0 rounded-lg" style={{ border: `1px solid ${cor}60` }} />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Modo do tema */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setModoTema('noticia')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    modoTema === 'noticia' ? 'bg-mofu/10 border-mofu/30 text-mofu' : 'border-border text-muted hover:text-secondary'
                  }`}
                >
                  <Newspaper size={12} /> Usar Notícia
                </button>
                <button
                  onClick={() => setModoTema('instagram')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    modoTema === 'instagram' ? 'bg-pink-950/30 border-pink-700/40 text-pink-400' : 'border-border text-muted hover:text-secondary'
                  }`}
                >
                  <Instagram size={12} /> Instagram
                </button>
                <button
                  onClick={() => setModoTema('custom')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    modoTema === 'custom' ? 'bg-green/10 border-green/30 text-green' : 'border-border text-muted hover:text-secondary'
                  }`}
                >
                  <PenLine size={12} /> Tema Livre
                </button>
              </div>

              {modoTema === 'instagram' ? (
                <InstagramTrending
                  keywords={projeto?.keywords || []}
                  postSelecionado={postIgSelecionado}
                  onSelecionarPost={post => setPostIgSelecionado(postIgSelecionado?.id === post.id ? null : post)}
                />
              ) : modoTema === 'noticia' ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {noticias.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-muted text-sm">Carregando notícias...</div>
                    </div>
                  ) : noticias.map((n, i) => (
                    <NewsCard
                      key={i}
                      noticia={n}
                      selecionada={noticiaSelecionada?.title === n.title}
                      onSelecionar={n2 => setNoticiaSelecionada(noticiaSelecionada?.title === n2.title ? null : n2)}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
              ) : (
                <Textarea
                  placeholder="Descreva o tema ou contexto do vídeo..."
                  placeholders={[
                    'Ex: Alta no custo da ração e como reduzir sem perder qualidade',
                    'Ex: 3 erros que todo produtor comete na suplementação',
                    'Ex: Por que meu rebanho cresceu depois que parei de usar antibiótico',
                  ]}
                  value={temaCustomizado}
                  onChange={e => setTemaCustomizado(e.target.value)}
                  rows={4}
                  className="h-28"
                />
              )}
            </div>

            {/* Botão gerar */}
            <Button
              variante="primary"
              tamanho="lg"
              className="w-full"
              carregando={gerando}
              icone={<Zap size={15} />}
              onClick={gerar}
            >
              {gerando ? ETAPAS_LOADING[etapaLoading] : 'Gerar Roteiro com IA'}
            </Button>

            {erro && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 bg-red-950/20 border border-red-800/30 rounded-lg px-3 py-2"
              >
                {erro}
              </motion.p>
            )}
          </div>

          {/* COLUNA DIREITA — Resultado */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {gerando && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </motion.div>
              )}

              {resultado && !gerando && (
                <motion.div
                  key="resultado"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Título + Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <FunnelBadge estagio={estagio} />
                      <h2 className="text-base font-medium text-primary mt-1">{resultado.title}</h2>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variante="secondary" tamanho="sm" icone={<RefreshCw size={12} />} onClick={() => { setResultado(null); gerar() }}>
                        Regerar
                      </Button>
                      <Button
                        variante={salvo ? 'bofu' : 'primary'}
                        tamanho="sm"
                        icone={salvo ? <Check size={12} /> : <Save size={12} />}
                        carregando={salvando}
                        onClick={aprovar}
                      >
                        {salvo ? 'Aprovado!' : 'Aprovar'}
                      </Button>
                    </div>
                  </div>

                  {/* FASE 1 — Gancho com variações A/B/C */}
                  <PhaseCard numero="01" nomeFase="GANCHO" duracaoSeg="0 — 3 segundos" cor="#3B82F6" corBg="rgba(59,130,246,0.06)" delay={0}>
                    <HookVariants
                      hookPrincipal={resultado.hook}
                      hookAlt1={resultado.hook_alt1}
                      hookAlt2={resultado.hook_alt2}
                    />
                  </PhaseCard>

                  {/* FASE 2 — Contexto */}
                  <PhaseCard numero="02" nomeFase="CONTEXTO E IDENTIFICAÇÃO" duracaoSeg="3 — 10 segundos" cor="#F59E0B" corBg="rgba(245,158,11,0.06)" delay={0.1}>
                    <div className="space-y-2">
                      {resultado.context.split('\n').filter(Boolean).map((frase, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-mofu font-mono text-sm shrink-0">{i + 1}.</span>
                          <p className="text-sm text-secondary">{frase}</p>
                        </div>
                      ))}
                    </div>
                  </PhaseCard>

                  {/* FASE 3 — Resolução + RE-HOOK */}
                  <PhaseCard numero="03" nomeFase="RESOLUÇÃO COM MÉTODO" duracaoSeg="10 — 35 segundos" cor="#10B981" corBg="rgba(16,185,129,0.06)" delay={0.2}>
                    <div className="space-y-3">
                      {resultado.method_name && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/20 border border-emerald-800/20">
                          <span className="text-xs text-muted">Método:</span>
                          <span className="text-sm font-medium text-bofu">{resultado.method_name}</span>
                        </div>
                      )}
                      <p className="text-sm text-secondary leading-relaxed">{resultado.resolution}</p>

                      {/* RE-HOOK em destaque */}
                      {resultado.rehook && (
                        <motion.div
                          animate={{ scale: [1, 1.01, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="p-3 rounded-lg border border-purple-700/40 bg-purple-950/20"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">⚡ RE-HOOK</span>
                            <span className="text-[10px] text-muted font-mono">18–22 segundos</span>
                          </div>
                          <p className="text-sm text-purple-200">{resultado.rehook}</p>
                        </motion.div>
                      )}
                    </div>
                  </PhaseCard>

                  {/* FASE 4 — Custo da Inação */}
                  <PhaseCard numero="04" nomeFase="CUSTO DA INAÇÃO" duracaoSeg="35 — 40 segundos" cor="#F59E0B" corBg="rgba(245,158,11,0.06)" delay={0.3}>
                    <div className="space-y-2">
                      <p className="text-sm text-secondary leading-relaxed">{resultado.cost_of_inaction}</p>
                      {resultado.cta && (
                        <p className="text-xs text-muted border-t border-border/50 pt-2 mt-2">
                          <span className="text-mofu font-mono mr-1">CTA:</span>{resultado.cta}
                        </p>
                      )}
                    </div>
                  </PhaseCard>

                  {/* Linha do Tempo Visual */}
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <ViralTimeline />
                  </div>

                  {/* Checklist dos 10 Pontos */}
                  {resultado.checklist_items && (
                    <div className="bg-surface border border-border rounded-xl p-4">
                      <ChecklistPanel
                        items={resultado.checklist_items}
                        score={resultado.checklist_score}
                      />
                    </div>
                  )}

                  {/* Roteiro completo */}
                  <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setFullScriptExpandido(!fullScriptExpandido)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-secondary hover:text-primary transition-colors"
                    >
                      <span>Roteiro Completo com Timestamps</span>
                      <span className="text-xs text-muted font-mono">{fullScriptExpandido ? '▲ Recolher' : '▼ Expandir'}</span>
                    </button>
                    <AnimatePresence>
                      {fullScriptExpandido && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-border/50">
                            <pre className="text-xs text-secondary font-mono leading-relaxed whitespace-pre-wrap pt-3">
                              {resultado.full_script}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {!resultado && !gerando && (
                <motion.div
                  key="vazio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl"
                >
                  <Zap size={40} className="text-muted mb-3" style={{ color: corEstagio }} />
                  <p className="text-secondary font-medium">Configure e gere seu roteiro</p>
                  <p className="text-muted text-sm mt-1">O resultado seguirá as 4 fases da metodologia</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
