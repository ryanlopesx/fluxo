'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Zap, RefreshCw, Check, Newspaper, PenLine,
  TrendingUp, Target, ShoppingCart, Instagram, Copy,
  Camera, Music, Type, Film, ThumbsUp, Mic, Eye,
  ChevronDown, ChevronUp, Clapperboard, Hash,
} from 'lucide-react'
import type { EstagioFunil, Noticia, Roteiro } from '@/types'
import { ESTAGIO_DESCRICAO, ESTAGIO_CORES } from '@/types'
import type { PostInstagram } from '@/lib/instagram'
import PageTransition from '@/components/PageTransition'
import ChecklistPanel from '@/components/ChecklistPanel'
import ViralTimeline from '@/components/ViralTimeline'
import NewsCard from '@/components/NewsCard'
import InstagramTrending from '@/components/InstagramTrending'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import FunnelBadge from '@/components/FunnelBadge'

/* ─── Constantes ─────────────────────────────────────────────── */

const ICONES_ESTAGIO = { tofu: TrendingUp, mofu: Target, bofu: ShoppingCart }

const ETAPAS_LOADING = [
  'Analisando nicho e estágio do funil...',
  'Formulando o gancho chocante...',
  'Construindo as 4 fases da metodologia...',
  'Avaliando checklist dos 10 pontos...',
]

const TIPS_ESTAGIO: Record<EstagioFunil, { titulo: string; dicas: string[] }> = {
  tofu: {
    titulo: 'TOFU — Atrair Desconhecidos',
    dicas: [
      'Não mencione o produto no gancho',
      'O problema precisa ser universal no nicho',
      'Dados reais geram mais curiosidade',
      'Evite CTAs de venda, prefira "salvar" ou "seguir"',
    ],
  },
  mofu: {
    titulo: 'MOFU — Educar Interessados',
    dicas: [
      'A audiência já sente a dor — aprofunde',
      'Apresente o método com nome próprio',
      'Mostre prova social ou resultados',
      'CTA pode ser link na bio ou direct',
    ],
  },
  bofu: {
    titulo: 'BOFU — Converter Prontos',
    dicas: [
      'Fale direto sobre oferta ou resultado',
      'Use urgência real (tempo, vagas, preço)',
      'Objeção principal deve aparecer no meio',
      'CTA claro e único — uma ação só',
    ],
  },
}

const CAMERA_SHOTS: Record<string, { shot: string; angulo: string; movimento: string }> = {
  gancho:    { shot: 'Close-up rosto',   angulo: 'Olho na câmera',     movimento: 'Estático' },
  contexto:  { shot: 'Meio corpo',       angulo: 'Levemente acima',     movimento: 'Leve pan' },
  resolucao: { shot: 'Plano médio',      angulo: 'Na linha dos olhos',  movimento: 'Cortes rítmicos' },
  rehook:    { shot: 'Close extremo',    angulo: 'Olho na câmera',     movimento: 'Zoom in' },
  cta:       { shot: 'Meio corpo',       angulo: 'Levemente abaixo',    movimento: 'Estático' },
}

/* ─── Helpers ────────────────────────────────────────────────── */

function CopyBtn({ texto, label }: { texto: string; label?: string }) {
  const [ok, setOk] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(texto)
    setOk(true)
    setTimeout(() => setOk(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink-2 transition-colors px-2 py-1 rounded hover:bg-raised"
    >
      {ok ? <Check size={10} className="text-green" /> : <Copy size={10} />}
      {label && <span>{ok ? 'Copiado!' : label}</span>}
    </button>
  )
}

function ShotBadge({ fase }: { fase: keyof typeof CAMERA_SHOTS }) {
  const s = CAMERA_SHOTS[fase]
  return (
    <div className="flex items-center gap-3 text-[10px] text-ink-3 font-mono">
      <span className="flex items-center gap-1"><Camera size={9} /> {s.shot}</span>
      <span className="flex items-center gap-1"><Eye size={9} /> {s.angulo}</span>
      <span className="flex items-center gap-1"><Film size={9} /> {s.movimento}</span>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────────── */

export default function GerarRoteiro() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [projeto, setProjeto] = useState<{ name: string; product_name: string; keywords: string[]; voice_tone: string } | null>(null)
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
  const [fullScriptAberto, setFullScriptAberto] = useState(false)
  const [hookAtivo, setHookAtivo] = useState(0)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(j => {
        if (j.data) {
          setProjeto(j.data)
          const query = (j.data.keywords as string[]).join(' ') || j.data.product_name
          fetch(`/api/news?q=${encodeURIComponent(query)}`)
            .then(r => r.json())
            .then(n => setNoticias(n.data || []))
        }
      })
  }, [id])

  useEffect(() => {
    if (!gerando) { setEtapaLoading(0); return }
    const t = setInterval(() => setEtapaLoading(e => (e + 1) % ETAPAS_LOADING.length), 1800)
    return () => clearInterval(t)
  }, [gerando])

  const gerar = async () => {
    setGerando(true)
    setErro('')
    setResultado(null)
    setSalvo(false)
    setHookAtivo(0)

    try {
      const body: Record<string, unknown> = { project_id: id, funnel_stage: estagio }
      if (modoTema === 'noticia' && noticiaSelecionada) {
        body.news_source_title = noticiaSelecionada.title
        body.news_source_url = noticiaSelecionada.url
        body.news_source_description = noticiaSelecionada.description
      } else if (modoTema === 'instagram' && postIgSelecionado) {
        body.news_source_title = `Instagram Trending: ${postIgSelecionado.autor}`
        body.news_source_url = postIgSelecionado.url
        body.news_source_description = postIgSelecionado.legenda
        body.tema_personalizado = `Tendência: Post de ${postIgSelecionado.autor} com ${postIgSelecionado.curtidas} curtidas. Hashtags: ${postIgSelecionado.hashtags.slice(0, 5).join(' ')}. "${postIgSelecionado.legenda.slice(0, 150)}"`
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
    await fetch(`/api/scripts/${resultado.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
    setSalvando(false)
    setSalvo(true)
    setResultado(r => r ? { ...r, status: 'approved' } : r)
  }

  const corEstagio = ESTAGIO_CORES[estagio]
  const ganchos = resultado ? [resultado.hook, resultado.hook_alt1, resultado.hook_alt2] : []
  const tips = TIPS_ESTAGIO[estagio]

  return (
    <PageTransition>
      <div className="flex flex-col h-full min-h-screen">

        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-line px-5 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-ink-3 hover:text-ink-2 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Clapperboard size={14} className="text-ink-3" />
              <h1 className="text-sm font-semibold text-ink">Gerar Roteiro</h1>
              {projeto && <span className="text-xs text-ink-3">— {projeto.name}</span>}
            </div>
          </div>
          {resultado && (
            <div className="flex items-center gap-2">
              <FunnelBadge estagio={estagio} />
              <Button variante="secondary" tamanho="sm" icone={<RefreshCw size={11} />} onClick={() => { setResultado(null); gerar() }}>
                Regerar
              </Button>
              <Button
                variante={salvo ? 'primary' : 'primary'}
                tamanho="sm"
                icone={salvo ? <Check size={11} /> : <ThumbsUp size={11} />}
                carregando={salvando}
                onClick={aprovar}
                className={salvo ? 'bg-green!' : ''}
              >
                {salvo ? 'Aprovado!' : 'Aprovar'}
              </Button>
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className={`flex-1 grid gap-0 ${resultado ? 'lg:grid-cols-[300px_1fr_260px]' : 'lg:grid-cols-[340px_1fr]'}`}>

          {/* ══ PAINEL ESQUERDO — Configuração ══ */}
          <div className="border-r border-line bg-surface overflow-y-auto scroll-thin">
            <div className="p-4 space-y-4">

              {/* Estágio do funil */}
              <div>
                <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Estágio do Funil</p>
                <div className="space-y-1.5">
                  {(['tofu', 'mofu', 'bofu'] as EstagioFunil[]).map(est => {
                    const Icone = ICONES_ESTAGIO[est]
                    const cor = ESTAGIO_CORES[est]
                    const ativo = estagio === est
                    return (
                      <motion.button
                        key={est}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setEstagio(est); setResultado(null); setSalvo(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                          ativo ? 'border-line-2 bg-raised' : 'border-line hover:border-line-2 hover:bg-raised/50'
                        }`}
                        style={ativo ? { borderColor: `${cor}50` } : {}}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: ativo ? `${cor}20` : 'transparent', color: ativo ? cor : '#555' }}
                        >
                          <Icone size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold uppercase font-mono ${ativo ? 'text-ink' : 'text-ink-3'}`}>{est}</p>
                          <p className="text-[10px] text-ink-3 leading-snug mt-0.5">{ESTAGIO_DESCRICAO[est]}</p>
                        </div>
                        {ativo && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cor }} />}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Dicas do estágio */}
              <div className="rounded-lg border border-line bg-raised/50 p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: corEstagio }}>{tips.titulo}</p>
                <div className="space-y-1.5">
                  {tips.dicas.map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-[10px] font-mono mt-0.5" style={{ color: corEstagio }}>→</span>
                      <p className="text-[11px] text-ink-3 leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fonte do conteúdo */}
              <div>
                <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Fonte do Conteúdo</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { key: 'noticia', icone: <Newspaper size={12} />, label: 'Notícia do dia', desc: 'Tendência atual' },
                    { key: 'instagram', icone: <Instagram size={12} />, label: 'Post do Instagram', desc: 'Conteúdo viral' },
                    { key: 'custom', icone: <PenLine size={12} />, label: 'Tema livre', desc: 'Você define' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setModoTema(opt.key as typeof modoTema)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                        modoTema === opt.key
                          ? 'bg-raised border-line-2 text-ink'
                          : 'border-line text-ink-3 hover:border-line-2 hover:bg-raised/40'
                      }`}
                    >
                      <span className={modoTema === opt.key ? 'text-green' : 'text-ink-3'}>{opt.icone}</span>
                      <div>
                        <p className="text-[11px] font-medium">{opt.label}</p>
                        <p className="text-[9px] text-ink-3">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conteúdo da fonte */}
              <div>
                {modoTema === 'instagram' ? (
                  <InstagramTrending
                    keywords={projeto?.keywords || []}
                    postSelecionado={postIgSelecionado}
                    onSelecionarPost={p => setPostIgSelecionado(postIgSelecionado?.id === p.id ? null : p)}
                  />
                ) : modoTema === 'noticia' ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto scroll-thin pr-1">
                    {noticias.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-line border-t-green rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[11px] text-ink-3">Buscando notícias...</p>
                      </div>
                    ) : noticias.map((n, i) => (
                      <NewsCard
                        key={i}
                        noticia={n}
                        selecionada={noticiaSelecionada?.title === n.title}
                        onSelecionar={n2 => setNoticiaSelecionada(noticiaSelecionada?.title === n2.title ? null : n2)}
                        delay={i * 0.03}
                      />
                    ))}
                  </div>
                ) : (
                  <Textarea
                    placeholder="Descreva o tema do vídeo..."
                    placeholders={[
                      'Ex: Alta no custo da ração e como reduzir sem perder qualidade',
                      'Ex: 3 erros que todo produtor comete na suplementação',
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
                icone={<Zap size={14} />}
                onClick={gerar}
              >
                {gerando ? ETAPAS_LOADING[etapaLoading] : 'Gerar Roteiro com IA'}
              </Button>

              {erro && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2"
                >
                  {erro}
                </motion.p>
              )}

              {/* Tom de voz */}
              {projeto?.voice_tone && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-raised border border-line">
                  <Mic size={11} className="text-ink-3 shrink-0" />
                  <div>
                    <p className="text-[9px] text-ink-3 font-mono uppercase">Tom de voz</p>
                    <p className="text-[11px] text-ink-2 capitalize">{projeto.voice_tone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══ PAINEL CENTRAL — Roteiro ══ */}
          <div className="overflow-y-auto scroll-thin">
            <AnimatePresence mode="wait">

              {/* Loading */}
              {gerando && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 border-2 border-line border-t-green rounded-full animate-spin" />
                    <div>
                      <p className="text-sm font-medium text-ink">Gerando roteiro...</p>
                      <p className="text-xs text-ink-3">{ETAPAS_LOADING[etapaLoading]}</p>
                    </div>
                  </div>
                  {[120, 80, 200, 160].map((h, i) => (
                    <div key={i} className="shimmer rounded-lg" style={{ height: h }} />
                  ))}
                </motion.div>
              )}

              {/* Vazio */}
              {!resultado && !gerando && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border"
                    style={{ backgroundColor: `${corEstagio}12`, borderColor: `${corEstagio}30` }}
                  >
                    <Clapperboard size={28} style={{ color: corEstagio }} />
                  </div>
                  <h2 className="text-lg font-semibold text-ink mb-2">Pronto para gerar</h2>
                  <p className="text-sm text-ink-3 max-w-sm mb-6">
                    Configure o estágio do funil e a fonte do conteúdo no painel esquerdo, depois clique em &quot;Gerar Roteiro com IA&quot;.
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-w-md">
                    {[
                      { label: '4 Fases', desc: 'Estrutura viral completa', icon: '🎬' },
                      { label: '3 Ganchos', desc: 'Variações A/B/C para testar', icon: '⚡' },
                      { label: '10 Pontos', desc: 'Checklist de qualidade', icon: '✓' },
                    ].map(f => (
                      <div key={f.label} className="bg-surface border border-line rounded-lg p-3 text-center">
                        <p className="text-xl mb-1">{f.icon}</p>
                        <p className="text-xs font-semibold text-ink-2">{f.label}</p>
                        <p className="text-[10px] text-ink-3 mt-0.5">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Resultado */}
              {resultado && !gerando && (
                <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 space-y-5">

                  {/* Título */}
                  <div className="flex items-start gap-3 pb-4 border-b border-line">
                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-ink leading-snug">{resultado.title}</h2>
                      {resultado.news_source_title && (
                        <p className="text-[11px] text-ink-3 mt-1 flex items-center gap-1">
                          <Newspaper size={9} /> Baseado em: {resultado.news_source_title}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className="text-2xl font-bold tabular-nums"
                        style={{ color: resultado.checklist_score >= 8 ? '#1DB954' : resultado.checklist_score >= 5 ? '#D98C00' : '#E5534B' }}
                      >
                        {resultado.checklist_score}
                      </span>
                      <p className="text-[9px] text-ink-3 font-mono">/10 score</p>
                    </div>
                  </div>

                  {/* ── FASE 1: GANCHO ── */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#4B8FE820', color: '#4B8FE8' }}>01</span>
                        <h3 className="text-sm font-semibold text-ink">GANCHO</h3>
                        <span className="text-[10px] text-ink-3 font-mono">0 – 3s</span>
                      </div>
                      <ShotBadge fase="gancho" />
                    </div>

                    {/* Tabs A/B/C */}
                    <div className="flex gap-1.5 mb-3">
                      {['A', 'B', 'C'].map((l, i) => (
                        <button
                          key={l}
                          onClick={() => setHookAtivo(i)}
                          className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all border ${
                            hookAtivo === i
                              ? 'bg-tofu/15 border-tofu/40 text-tofu'
                              : 'border-line text-ink-3 hover:border-line-2'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                      <span className="ml-auto text-[10px] text-ink-3 self-center">
                        Grave os 3 ganchos e teste qual performa melhor
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={hookAtivo}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="rounded-lg border border-tofu/30 bg-tofu/5 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-ink leading-relaxed flex-1">
                            &ldquo;{ganchos[hookAtivo]}&rdquo;
                          </p>
                          <CopyBtn texto={ganchos[hookAtivo]} />
                        </div>
                        <div className="mt-3 pt-3 border-t border-tofu/20 flex items-center gap-4 text-[10px] text-ink-3">
                          <span className="flex items-center gap-1"><Type size={9} /> Frase de impacto</span>
                          <span className="flex items-center gap-1"><Mic size={9} /> Tom: assertivo</span>
                          <span className="flex items-center gap-1"><Eye size={9} /> Olho na câmera</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-2 p-2.5 rounded-lg bg-raised border border-line flex items-start gap-2">
                      <Zap size={11} className="text-mofu shrink-0 mt-0.5" />
                      <p className="text-[10px] text-ink-3 leading-relaxed">
                        <span className="text-ink-2 font-medium">Dica de gravação:</span> Use a função &ldquo;Reels Teste&rdquo; do Instagram para publicar sem aparecer para seguidores. Publique o vencedor em 24–48h.
                      </p>
                    </div>
                  </section>

                  {/* ── FASE 2: CONTEXTO ── */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#D98C0020', color: '#D98C00' }}>02</span>
                        <h3 className="text-sm font-semibold text-ink">CONTEXTO & DOR</h3>
                        <span className="text-[10px] text-ink-3 font-mono">3 – 10s</span>
                      </div>
                      <ShotBadge fase="contexto" />
                    </div>
                    <div className="rounded-lg border border-mofu/20 bg-mofu/5 p-4 space-y-2">
                      {resultado.context.split('\n').filter(Boolean).map((linha, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[11px] font-mono text-mofu font-bold shrink-0 mt-0.5">{i + 1}.</span>
                          <p className="text-sm text-ink-2 leading-relaxed flex-1">{linha}</p>
                          <CopyBtn texto={linha} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-1 rounded bg-raised border border-line text-ink-3 flex items-center gap-1">
                        <Film size={9} /> Corte a cada frase
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded bg-raised border border-line text-ink-3 flex items-center gap-1">
                        <Type size={9} /> Legenda na tela
                      </span>
                    </div>
                  </section>

                  {/* ── FASE 3: RESOLUÇÃO ── */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#1DB95420', color: '#1DB954' }}>03</span>
                        <h3 className="text-sm font-semibold text-ink">RESOLUÇÃO</h3>
                        <span className="text-[10px] text-ink-3 font-mono">10 – 35s</span>
                      </div>
                      <ShotBadge fase="resolucao" />
                    </div>

                    {resultado.method_name && (
                      <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-green/10 border border-green/25">
                        <Hash size={11} className="text-green shrink-0" />
                        <p className="text-xs text-ink-2">Método: <span className="font-semibold text-green">{resultado.method_name}</span></p>
                      </div>
                    )}

                    <div className="rounded-lg border border-green/20 bg-green/5 p-4">
                      <p className="text-sm text-ink-2 leading-relaxed">{resultado.resolution}</p>
                    </div>

                    {/* RE-HOOK */}
                    {resultado.rehook && (
                      <motion.div
                        className="mt-3 p-4 rounded-lg border border-rehook/40 bg-rehook/8 relative overflow-hidden"
                        animate={{ borderColor: ['rgba(157,127,234,0.4)', 'rgba(157,127,234,0.7)', 'rgba(157,127,234,0.4)'] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Zap size={11} className="text-rehook" fill="currentColor" />
                          <span className="text-[10px] font-mono text-rehook uppercase tracking-widest font-bold">RE-HOOK</span>
                          <span className="text-[10px] text-ink-3 font-mono">18 – 22s</span>
                          <ShotBadge fase="rehook" />
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-ink leading-relaxed flex-1">&ldquo;{resultado.rehook}&rdquo;</p>
                          <CopyBtn texto={resultado.rehook} />
                        </div>
                        <p className="text-[10px] text-rehook/70 mt-2">Segundo pico de atenção — essencial para reter quem quase saiu</p>
                      </motion.div>
                    )}
                  </section>

                  {/* ── FASE 4: CUSTO DA INAÇÃO ── */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#D98C0020', color: '#D98C00' }}>04</span>
                        <h3 className="text-sm font-semibold text-ink">CUSTO DA INAÇÃO</h3>
                        <span className="text-[10px] text-ink-3 font-mono">35 – 40s</span>
                      </div>
                      <ShotBadge fase="cta" />
                    </div>
                    <div className="rounded-lg border border-mofu/20 bg-mofu/5 p-4 space-y-3">
                      <p className="text-sm text-ink-2 leading-relaxed">{resultado.cost_of_inaction}</p>
                      {resultado.cta && (
                        <div className="pt-3 border-t border-mofu/20 flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-mono text-ink-3 uppercase mb-1">CTA</p>
                            <p className="text-sm font-medium text-ink">{resultado.cta}</p>
                          </div>
                          <CopyBtn texto={resultado.cta} label="Copiar CTA" />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ── LINHA DO TEMPO ── */}
                  <section className="bg-surface border border-line rounded-lg p-4">
                    <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Linha do Tempo do Vídeo</p>
                    <ViralTimeline compacta={false} />
                  </section>

                  {/* ── ROTEIRO COMPLETO ── */}
                  <section className="bg-surface border border-line rounded-lg overflow-hidden">
                    <button
                      onClick={() => setFullScriptAberto(!fullScriptAberto)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-ink-2 hover:text-ink hover:bg-raised/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clapperboard size={13} className="text-ink-3" />
                        Roteiro Completo com Timestamps
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyBtn texto={resultado.full_script} label="Copiar tudo" />
                        {fullScriptAberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {fullScriptAberto && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-line pt-3">
                            <pre className="text-xs text-ink-2 font-mono leading-relaxed whitespace-pre-wrap">
                              {resultado.full_script}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ══ PAINEL DIREITO — Ferramentas (só quando há resultado) ══ */}
          {resultado && !gerando && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l border-line bg-surface overflow-y-auto scroll-thin"
            >
              <div className="p-4 space-y-5">

                {/* Checklist */}
                <div>
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Qualidade do Roteiro</p>
                  {resultado.checklist_items && (
                    <ChecklistPanel items={resultado.checklist_items} score={resultado.checklist_score} />
                  )}
                </div>

                {/* Guia de produção */}
                <div className="pt-4 border-t border-line">
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Guia de Produção</p>
                  <div className="space-y-2">
                    {[
                      { icone: <Camera size={11} />, titulo: 'Câmera', desc: 'Vertical 9:16 · 1080p mín.' },
                      { icone: <Mic size={11} />, titulo: 'Áudio', desc: 'Microfone lapela ou ring-light mic' },
                      { icone: <Film size={11} />, titulo: 'Gravação', desc: 'Grave fases separadas para editar' },
                      { icone: <Type size={11} />, titulo: 'Legenda', desc: 'Texto na tela em todo o vídeo' },
                      { icone: <Music size={11} />, titulo: 'Trilha', desc: 'Trending audio com volume baixo' },
                    ].map(item => (
                      <div key={item.titulo} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-raised/50 border border-line">
                        <span className="text-ink-3 mt-0.5 shrink-0">{item.icone}</span>
                        <div>
                          <p className="text-[11px] font-medium text-ink-2">{item.titulo}</p>
                          <p className="text-[10px] text-ink-3">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hashtags sugeridas */}
                {projeto?.keywords && projeto.keywords.length > 0 && (
                  <div className="pt-4 border-t border-line">
                    <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Hashtags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {projeto.keywords.slice(0, 8).map(kw => (
                        <span key={kw} className="text-[10px] px-2 py-1 rounded-md bg-raised border border-line text-ink-3 font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>
                    <CopyBtn
                      texto={projeto.keywords.slice(0, 8).map(k => `#${k}`).join(' ')}
                      label="Copiar hashtags"
                    />
                  </div>
                )}

                {/* Melhor horário */}
                <div className="pt-4 border-t border-line">
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Melhor Horário para Postar</p>
                  <div className="space-y-1.5">
                    {['07h – 09h (manhã)', '12h – 13h (almoço)', '19h – 21h (noite)'].map(h => (
                      <div key={h} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                        <p className="text-[11px] text-ink-3">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      </div>
    </PageTransition>
  )
}
