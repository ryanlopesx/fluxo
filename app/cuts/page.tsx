'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, Clock, Copy, Check, Music, Film, Zap, Trash2, Upload, Video, Download, FileText, ChevronRight, AlertCircle } from 'lucide-react'
import type { PlanoCuts, Roteiro } from '@/types'
import PageTransition from '@/components/PageTransition'
import CutTimeline from '@/components/CutTimeline'
import CutPlanCard from '@/components/CutPlanCard'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Input from '@/components/ui/Input'

const ESTILOS = ['dinâmico', 'lento', 'trend', 'tutorial', 'dramático']

/* ─── Analisador de Vídeo ────────────────────────────────────── */
interface Corte { index: number; inicio: number; fim: number; tipo: string; descricao: string; camera: string; texto_tela: string; transicao: string }
interface Legenda { inicio: number; fim: number; texto: string }
interface AnaliseVideo { cortes: Corte[]; legendas: Legenda[]; instrucoes: string; musica: string; dicas_edicao: string[]; srt: string }

function fmt(s: number) {
  const m = Math.floor(s / 60); const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const COR_TIPO: Record<string, string> = {
  gancho: 'text-tofu bg-tofu/10 border-tofu/25',
  desenvolvimento: 'text-green bg-green/10 border-green/25',
  rehook: 'text-mofu bg-mofu/10 border-mofu/25',
  cta: 'text-bofu bg-bofu/10 border-bofu/25',
}

function AnalisadorVideo() {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  const [videoUrl,    setVideoUrl]    = useState<string | null>(null)
  const [duracao,     setDuracao]     = useState(0)
  const [analisando,  setAnalisando]  = useState(false)
  const [progresso,   setProgresso]   = useState('')
  const [analise,     setAnalise]     = useState<AnaliseVideo | null>(null)
  const [erro,        setErro]        = useState('')
  const [roteiro,     setRoteiro]     = useState('')
  const [estilo,      setEstilo]      = useState('dinâmico')
  const [abaRes,      setAbaRes]      = useState<'cortes' | 'legendas'>('cortes')

  const carregarVideo = (file: File) => {
    if (!file.type.startsWith('video/')) { setErro('Envie um arquivo de vídeo (MP4, MOV, etc.)'); return }
    if (file.size > 500 * 1024 * 1024) { setErro('Vídeo muito grande. Máximo 500MB.'); return }
    setErro(''); setAnalise(null)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
  }

  const extrairFrames = useCallback(async (): Promise<{ data: string; tempo: number }[]> => {
    const v = videoRef.current; const c = canvasRef.current
    if (!v || !c || !duracao) return []

    const NUM_FRAMES = Math.min(10, Math.max(6, Math.floor(duracao / 5)))
    const tempos: number[] = []
    for (let i = 0; i < NUM_FRAMES; i++) {
      tempos.push((duracao / (NUM_FRAMES - 1)) * i)
    }

    const frames: { data: string; tempo: number }[] = []
    for (const t of tempos) {
      v.currentTime = t
      await new Promise<void>(res => { v.onseeked = () => res() })
      const w = 480; const h = Math.round(480 * (v.videoHeight / v.videoWidth))
      c.width = w; c.height = h
      c.getContext('2d')?.drawImage(v, 0, 0, w, h)
      frames.push({ data: c.toDataURL('image/jpeg', 0.65), tempo: t })
    }
    return frames
  }, [duracao])

  const analisar = async () => {
    setAnalisando(true); setErro(''); setAnalise(null)
    try {
      setProgresso('Extraindo frames do vídeo...')
      const frames = await extrairFrames()
      if (!frames.length) throw new Error('Não foi possível extrair frames do vídeo.')

      setProgresso(`Enviando ${frames.length} frames para a IA...`)
      const resp = await fetch('/api/cuts/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames, duracao, roteiro: roteiro.trim() || undefined, estilo }),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error)
      setAnalise(json.data)
      setProgresso('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao analisar vídeo')
      setProgresso('')
    } finally {
      setAnalisando(false)
    }
  }

  const baixarSRT = () => {
    if (!analise?.srt) return
    const blob = new Blob([analise.srt], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'legendas.srt'; a.click()
  }

  return (
    <div className="space-y-5">
      {/* Upload */}
      {!videoUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) carregarVideo(f) }}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-line rounded-xl p-14 text-center cursor-pointer hover:border-tofu/40 hover:bg-tofu/5 transition-all"
        >
          <div className="w-16 h-16 rounded-2xl bg-raised border border-line flex items-center justify-center mx-auto mb-4">
            <Upload size={26} className="text-ink-3" />
          </div>
          <p className="text-base font-semibold text-ink mb-1">Arraste o vídeo ou clique</p>
          <p className="text-sm text-ink-3 mb-1">MP4, MOV, WEBM — até 500MB</p>
          <p className="text-xs text-ink-3">A IA analisa os frames e gera cortes + legenda .srt</p>
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) carregarVideo(f) }} />
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-5">
          {/* Vídeo + config */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black border border-line">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full max-h-72 object-contain"
                controls
                onLoadedMetadata={e => setDuracao((e.target as HTMLVideoElement).duration)}
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {duracao > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-raised border border-line">
                <Video size={14} className="text-tofu shrink-0" />
                <p className="text-sm text-ink-2">Duração: <span className="font-mono text-ink">{fmt(duracao)}</span></p>
                <button onClick={() => { setVideoUrl(null); setAnalise(null) }} className="ml-auto text-xs text-ink-3 hover:text-danger transition-colors">Trocar vídeo</button>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-ink-3 uppercase tracking-widest block mb-1.5">Estilo de edição</label>
                <div className="flex flex-wrap gap-2">
                  {ESTILOS.map(e => (
                    <button key={e} onClick={() => setEstilo(e)}
                      className={`px-3 py-1.5 rounded-lg text-xs border capitalize transition-all ${estilo === e ? 'bg-green/10 border-green/30 text-green' : 'border-line text-ink-3 hover:text-ink-2'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-ink-3 uppercase tracking-widest block mb-1.5">Roteiro / script (opcional)</label>
                <textarea
                  value={roteiro}
                  onChange={e => setRoteiro(e.target.value)}
                  placeholder="Cole o roteiro aqui para legendas mais precisas..."
                  rows={3}
                  className="w-full rounded-lg bg-raised border border-line text-sm text-ink-2 px-3 py-2.5 resize-none focus:outline-none focus:border-tofu/50 placeholder:text-ink-3"
                />
              </div>
            </div>

            {erro && <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 flex items-center gap-2"><AlertCircle size={12} />{erro}</p>}

            <Button
              variante="primary" tamanho="lg" className="w-full"
              carregando={analisando}
              icone={<Scissors size={15} />}
              onClick={analisar}
              disabled={!duracao || analisando}
            >
              {analisando ? progresso || 'Analisando...' : 'Analisar vídeo com IA'}
            </Button>
          </div>

          {/* Resultado */}
          <div>
            {analisando && (
              <div className="space-y-3">
                {[140, 100, 80, 120, 90].map((h, i) => <div key={i} className="shimmer rounded-lg" style={{ height: h }} />)}
                <p className="text-xs text-ink-3 text-center font-mono animate-pulse">{progresso}</p>
              </div>
            )}

            {analise && !analisando && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {/* Downloads */}
                <div className="flex gap-2">
                  <button onClick={baixarSRT}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green/10 border border-green/25 text-green text-sm font-medium hover:bg-green/15 transition-colors">
                    <Download size={14} /> Baixar .srt
                  </button>
                  <button onClick={() => {
                    const txt = analise.cortes.map(c =>
                      `[${fmt(c.inicio)}-${fmt(c.fim)}] ${c.tipo.toUpperCase()}: ${c.descricao}${c.texto_tela ? `\nTexto: ${c.texto_tela}` : ''}`
                    ).join('\n\n')
                    navigator.clipboard.writeText(txt)
                  }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-line text-ink-3 text-xs hover:text-ink-2 transition-colors">
                    <Copy size={13} /> Copiar plano
                  </button>
                </div>

                {/* Instruções */}
                <div className="rounded-lg border border-line bg-surface p-3">
                  <p className="text-[9px] font-mono text-ink-3 uppercase tracking-widest mb-1.5">Instruções gerais</p>
                  <p className="text-xs text-ink-2 leading-relaxed">{analise.instrucoes}</p>
                </div>

                {/* Abas cortes / legendas */}
                <div className="flex gap-1 p-1 bg-raised border border-line rounded-lg">
                  {(['cortes', 'legendas'] as const).map(t => (
                    <button key={t} onClick={() => setAbaRes(t)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${abaRes === t ? 'bg-surface border border-line text-ink' : 'text-ink-3 hover:text-ink-2'}`}>
                      {t} ({t === 'cortes' ? analise.cortes.length : analise.legendas.length})
                    </button>
                  ))}
                </div>

                {/* Lista de cortes */}
                {abaRes === 'cortes' && (
                  <div className="space-y-2 max-h-96 overflow-y-auto scroll-thin pr-1">
                    {analise.cortes.map(c => (
                      <div key={c.index} className="rounded-lg border border-line bg-surface p-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border capitalize ${COR_TIPO[c.tipo] || 'text-ink-3 bg-raised border-line'}`}>{c.tipo}</span>
                          <span className="text-[10px] font-mono text-ink-3">{fmt(c.inicio)} → {fmt(c.fim)}</span>
                          <ChevronRight size={10} className="text-ink-3 ml-auto" />
                          <span className="text-[10px] text-ink-3">{c.transicao}</span>
                        </div>
                        <p className="text-xs text-ink-2">{c.descricao}</p>
                        {c.texto_tela && (
                          <p className="text-[10px] text-tofu bg-tofu/10 border border-tofu/20 rounded px-2 py-1">"{c.texto_tela}"</p>
                        )}
                        <p className="text-[9px] text-ink-3">Câmera: {c.camera}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lista de legendas */}
                {abaRes === 'legendas' && (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto scroll-thin pr-1">
                    {analise.legendas.map((l, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3 py-2">
                        <span className="text-[9px] font-mono text-ink-3 shrink-0 mt-0.5 w-14">{fmt(l.inicio)}→{fmt(l.fim)}</span>
                        <p className="text-xs text-ink-2">{l.texto}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dicas */}
                {analise.dicas_edicao?.length > 0 && (
                  <div className="rounded-lg border border-line bg-raised p-3">
                    <p className="text-[9px] font-mono text-ink-3 uppercase tracking-widest mb-2">Dicas de edição</p>
                    <div className="space-y-1.5">
                      {analise.dicas_edicao.map((d, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Zap size={9} className="text-tofu shrink-0 mt-0.5" />
                          <p className="text-[11px] text-ink-2">{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!analise && !analisando && (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-line rounded-xl">
                <FileText size={32} className="text-ink-3 mb-3" />
                <p className="text-sm text-ink-2 font-medium">Resultado aparece aqui</p>
                <p className="text-xs text-ink-3 mt-1">Cortes + arquivo .srt de legendas</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [aba, setAba] = useState<'plano' | 'video'>('video')
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
      <div className="p-4 lg:p-8 max-w-7xl space-y-6">
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scissors size={16} className="text-tofu" />
              <h1 className="text-2xl font-bold text-ink">Cortador de Vídeo</h1>
            </div>
            <p className="text-sm text-ink-3">Suba um vídeo e a IA gera os cortes e as legendas .srt automaticamente</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-1 p-1 bg-raised border border-line rounded-lg w-fit">
          {[
            { key: 'video', icone: <Video size={13} />, label: 'Analisar Vídeo', badge: 'NOVO' },
            { key: 'plano', icone: <Film size={13} />, label: 'Gerar Plano de Cortes', badge: '' },
          ].map(opt => (
            <button key={opt.key} onClick={() => setAba(opt.key as typeof aba)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${aba === opt.key ? 'bg-surface border border-line text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'}`}>
              <span className={aba === opt.key ? 'text-tofu' : 'text-ink-3'}>{opt.icone}</span>
              {opt.label}
              {opt.badge && <span className="text-[9px] font-mono bg-tofu/20 text-tofu border border-tofu/30 px-1.5 py-0.5 rounded-full">{opt.badge}</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {aba === 'video' ? (
            <motion.div key="video" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AnalisadorVideo />
            </motion.div>
          ) : (
            <motion.div key="plano" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
