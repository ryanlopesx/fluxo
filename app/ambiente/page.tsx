'use client'

import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Upload, Zap, RotateCcw, Check, X, Lightbulb,
  Mic, Monitor, Star, AlertTriangle, ChevronDown, ChevronUp,
  Video, ScanLine, Target, Image as ImageIcon,
} from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import Button from '@/components/ui/Button'

/* ─── Types ──────────────────────────────────────────────────── */
interface Checklist { item: string; ok: boolean; acao: string }
interface Analise {
  score: number
  resumo: string
  iluminacao: { nota: number; avaliacao: string; problemas: string[]; solucoes: string[] }
  camera: { posicao_ideal: string; altura: string; angulo: string; distancia: string; enquadramento: string }
  fundo: { nota: number; avaliacao: string; elementos_remover: string[]; elementos_adicionar: string[]; posicao_ideal: string }
  audio: { nota: number; avaliacao: string; problemas: string[]; solucoes: string[] }
  iluminacao_setup: { tipo_detectado: string; setup_recomendado: string; posicao_luz: string; luz_fill: string; horario_ideal: string; produtos_baratos: string[] }
  cenario: { estilo_detectado: string; adequacao: string; transformacoes: string[]; props_sugeridos: string[] }
  checklist: Checklist[]
  prioridades: string[]
}

/* ─── Helpers ────────────────────────────────────────────────── */
function Nota({ valor, max = 10 }: { valor: number; max?: number }) {
  const cor = valor >= 8 ? '#1DB954' : valor >= 5 ? '#D98C00' : '#E5534B'
  return (
    <span className="text-sm font-bold tabular-nums" style={{ color: cor }}>{valor}<span className="text-[10px] font-normal text-ink-3">/{max}</span></span>
  )
}

function Tag({ texto, tipo = 'neutro' }: { texto: string; tipo?: 'ok' | 'ruim' | 'neutro' | 'dica' }) {
  const estilos = {
    ok:     'bg-green/10 border-green/25 text-green',
    ruim:   'bg-danger/10 border-danger/25 text-danger',
    neutro: 'bg-raised border-line text-ink-3',
    dica:   'bg-tofu/10 border-tofu/25 text-tofu',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border ${estilos[tipo]}`}>
      {tipo === 'ok' && <Check size={9} />}
      {tipo === 'ruim' && <X size={9} />}
      {tipo === 'dica' && <Zap size={9} />}
      {texto}
    </span>
  )
}

function SecaoCard({ titulo, nota, icone, children, defaultOpen = false }: {
  titulo: string; nota?: number; icone: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [aberto, setAberto] = useState(defaultOpen)
  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-raised/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-ink-3">{icone}</span>
          <span className="text-sm font-semibold text-ink">{titulo}</span>
        </div>
        <div className="flex items-center gap-3">
          {nota !== undefined && <Nota valor={nota} />}
          {aberto ? <ChevronUp size={13} className="text-ink-3" /> : <ChevronDown size={13} className="text-ink-3" />}
        </div>
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-line space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Página ─────────────────────────────────────────────────── */
export default function AmbientePage() {
  const [imagem, setImagem] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [erro, setErro] = useState('')
  const [modoCaptura, setModoCaptura] = useState<'upload' | 'camera'>('upload')
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  /* Drag & drop */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) lerArquivo(file)
  }, [])

  const lerArquivo = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      setImagem(e.target?.result as string)
      setAnalise(null)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) lerArquivo(file)
  }

  /* Câmera */
  const abrirCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraAtiva(true)
    } catch {
      setErro('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }

  const fecharCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraAtiva(false)
  }

  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.9)
    setImagem(dataUrl)
    setAnalise(null)
    fecharCamera()
  }

  /* Análise */
  const analisar = async () => {
    if (!imagem) return
    setAnalisando(true)
    setErro('')
    setAnalise(null)

    try {
      const resp = await fetch('/api/ambiente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagem, tipo: 'foto' }),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error)
      setAnalise(json.data)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao analisar imagem')
    } finally {
      setAnalisando(false)
    }
  }

  const resetar = () => {
    setImagem(null)
    setAnalise(null)
    setErro('')
    fecharCamera()
  }

  const scoreColor = (s: number) => s >= 8 ? '#1DB954' : s >= 5 ? '#D98C00' : '#E5534B'

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-line">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ScanLine size={16} className="text-tofu" />
              <h1 className="text-2xl font-bold text-ink">Analisador de Ambiente</h1>
            </div>
            <p className="text-sm text-ink-3">
              Envie uma foto ou grave seu espaço de gravação — a IA analisa iluminação, câmera, fundo e áudio.
            </p>
          </div>
          {imagem && (
            <button onClick={resetar} className="flex items-center gap-1.5 text-xs text-ink-3 hover:text-danger transition-colors px-3 py-1.5 rounded border border-line hover:border-danger/30">
              <RotateCcw size={12} /> Recomeçar
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">

          {/* ══ COLUNA ESQUERDA — Captura ══ */}
          <div className="space-y-4">

            {/* Tabs upload / câmera */}
            {!imagem && !cameraAtiva && (
              <div className="flex gap-2 p-1 bg-raised border border-line rounded-lg">
                {[
                  { key: 'upload', icone: <Upload size={13} />, label: 'Enviar foto' },
                  { key: 'camera', icone: <Video size={13} />, label: 'Usar câmera' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setModoCaptura(opt.key as typeof modoCaptura)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
                      modoCaptura === opt.key
                        ? 'bg-surface border border-line text-ink shadow-sm'
                        : 'text-ink-3 hover:text-ink-2'
                    }`}
                  >
                    {opt.icone} {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Área de captura */}
            {!imagem && !cameraAtiva && modoCaptura === 'upload' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-tofu/60 bg-tofu/5'
                    : 'border-line hover:border-line-2 hover:bg-raised/50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${dragOver ? 'bg-tofu/15' : 'bg-raised border border-line'}`}>
                  <ImageIcon size={24} className={dragOver ? 'text-tofu' : 'text-ink-3'} />
                </div>
                <p className="text-sm font-semibold text-ink-2 mb-1">
                  {dragOver ? 'Solte aqui!' : 'Arraste a foto ou clique'}
                </p>
                <p className="text-xs text-ink-3">JPG, PNG, WEBP até 10MB</p>
                <p className="text-[11px] text-ink-3 mt-3 max-w-xs mx-auto leading-relaxed">
                  Fotografe seu espaço de gravação com a câmera do seu celular e envie aqui
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </motion.div>
            )}

            {/* Câmera ativa */}
            {!imagem && modoCaptura === 'camera' && (
              <div className="space-y-3">
                {!cameraAtiva ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-dashed border-line rounded-xl p-10 text-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-raised border border-line flex items-center justify-center mx-auto mb-4">
                      <Camera size={24} className="text-ink-3" />
                    </div>
                    <p className="text-sm font-semibold text-ink-2 mb-1">Ativar câmera</p>
                    <p className="text-xs text-ink-3 mb-5 max-w-xs mx-auto">
                      Aponte a câmera para seu ambiente de gravação e tire uma foto
                    </p>
                    <Button variante="secondary" tamanho="md" icone={<Camera size={14} />} onClick={abrirCamera}>
                      Abrir câmera
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden bg-black border border-line">
                      <video ref={videoRef} className="w-full" playsInline muted />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-4 border border-white/20 rounded-lg" />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2">
                          <span className="text-[10px] bg-black/50 text-white px-2 py-0.5 rounded font-mono">
                            Aponte para o ambiente
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variante="secondary" tamanho="sm" icone={<X size={12} />} onClick={fecharCamera} className="flex-1">
                        Cancelar
                      </Button>
                      <Button variante="primary" tamanho="sm" icone={<Camera size={12} />} onClick={capturarFoto} className="flex-1">
                        Capturar foto
                      </Button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </motion.div>
                )}
              </div>
            )}

            {/* Preview da imagem */}
            {imagem && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-line bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagem} alt="Ambiente capturado" className="w-full object-cover max-h-72" />
                  {analise && (
                    <div className="absolute top-3 right-3">
                      <div
                        className="w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2"
                        style={{
                          backgroundColor: `${scoreColor(analise.score)}15`,
                          borderColor: `${scoreColor(analise.score)}60`,
                        }}
                      >
                        <span className="text-lg font-bold" style={{ color: scoreColor(analise.score) }}>
                          {analise.score}
                        </span>
                        <span className="text-[8px] text-ink-3">/10</span>
                      </div>
                    </div>
                  )}
                </div>

                {!analise && !analisando && (
                  <Button
                    variante="primary"
                    tamanho="lg"
                    className="w-full"
                    carregando={analisando}
                    icone={<Zap size={15} />}
                    onClick={analisar}
                  >
                    Analisar Ambiente com IA
                  </Button>
                )}

                {analisando && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-line">
                    <div className="w-6 h-6 border-2 border-line border-t-tofu rounded-full animate-spin shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-ink">Analisando seu ambiente...</p>
                      <p className="text-xs text-ink-3">Verificando iluminação, câmera, fundo e áudio</p>
                    </div>
                  </div>
                )}

                {erro && (
                  <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{erro}</p>
                )}
              </motion.div>
            )}

            {/* Dicas de como tirar a foto */}
            {!analise && (
              <div className="rounded-lg border border-line bg-surface p-4">
                <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Como fotografar seu ambiente</p>
                <div className="space-y-2">
                  {[
                    { icone: <Camera size={11} />, texto: 'Foto do ambiente inteiro, não selfie' },
                    { icone: <Lightbulb size={11} />, texto: 'Inclua as fontes de luz visíveis' },
                    { icone: <Monitor size={11} />, texto: 'Mostre o fundo onde você grava' },
                    { icone: <Target size={11} />, texto: 'Foto de onde a câmera ficaria' },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-tofu shrink-0">{d.icone}</span>
                      <p className="text-[11px] text-ink-3">{d.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══ COLUNA DIREITA — Análise ══ */}
          <div>
            {!analise && !analisando && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed border-line rounded-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-raised border border-line flex items-center justify-center mx-auto mb-5">
                  <ScanLine size={28} className="text-ink-3" />
                </div>
                <h3 className="text-base font-semibold text-ink-2 mb-2">Análise aparecerá aqui</h3>
                <p className="text-sm text-ink-3 max-w-xs">
                  Envie uma foto do seu espaço de gravação para receber um guia completo de produção
                </p>
                <div className="grid grid-cols-2 gap-3 mt-6 max-w-sm">
                  {[
                    { label: 'Iluminação', icone: '💡', desc: 'Setup e posição' },
                    { label: 'Câmera', icone: '📷', desc: 'Altura e ângulo' },
                    { label: 'Fundo', icone: '🎬', desc: 'O que mudar' },
                    { label: 'Áudio', icone: '🎙️', desc: 'Acústica do espaço' },
                  ].map(f => (
                    <div key={f.label} className="bg-surface border border-line rounded-lg p-3 text-left">
                      <span className="text-xl">{f.icone}</span>
                      <p className="text-xs font-semibold text-ink-2 mt-1">{f.label}</p>
                      <p className="text-[10px] text-ink-3">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {analisando && (
              <div className="space-y-3">
                {[100, 180, 150, 200, 140].map((h, i) => (
                  <div key={i} className="shimmer rounded-lg" style={{ height: h }} />
                ))}
              </div>
            )}

            {analise && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Resumo geral */}
                <div className="rounded-lg border border-line bg-surface p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 shrink-0"
                      style={{ borderColor: `${scoreColor(analise.score)}50`, backgroundColor: `${scoreColor(analise.score)}10` }}
                    >
                      <span className="text-2xl font-bold" style={{ color: scoreColor(analise.score) }}>{analise.score}</span>
                      <span className="text-[9px] text-ink-3">/10</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink mb-1">Avaliação Geral</p>
                      <p className="text-xs text-ink-2 leading-relaxed">{analise.resumo}</p>
                    </div>
                  </div>
                </div>

                {/* Prioridades */}
                <div className="rounded-lg border border-mofu/30 bg-mofu/5 p-4">
                  <p className="text-[10px] font-mono text-mofu uppercase tracking-widest mb-2">🎯 Prioridades — Faça isso primeiro</p>
                  <div className="space-y-2">
                    {analise.prioridades.map((p, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[11px] font-mono font-bold text-mofu shrink-0">{i + 1}.</span>
                        <p className="text-xs text-ink-2">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist rápido */}
                <div className="rounded-lg border border-line bg-surface p-4">
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Checklist de Produção</p>
                  <div className="space-y-2">
                    {analise.checklist.map((c, i) => (
                      <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                        c.ok ? 'bg-green/5 border-green/20' : 'bg-danger/5 border-danger/15'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          c.ok ? 'bg-green/20 text-green' : 'bg-danger/15 text-danger'
                        }`}>
                          {c.ok ? <Check size={10} /> : <X size={10} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-ink-2">{c.item}</p>
                          {!c.ok && <p className="text-[10px] text-danger/80 mt-0.5">{c.acao}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Câmera */}
                <SecaoCard titulo="Posicionamento da Câmera" icone={<Camera size={14} />} defaultOpen>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Posição', valor: analise.camera.posicao_ideal },
                      { label: 'Altura', valor: analise.camera.altura },
                      { label: 'Ângulo', valor: analise.camera.angulo },
                      { label: 'Distância', valor: analise.camera.distancia },
                    ].map(item => (
                      <div key={item.label} className="bg-raised border border-line rounded-lg p-2.5">
                        <p className="text-[9px] font-mono text-ink-3 uppercase mb-1">{item.label}</p>
                        <p className="text-xs text-ink-2 leading-snug">{item.valor}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-raised border border-line rounded-lg p-2.5">
                    <p className="text-[9px] font-mono text-ink-3 uppercase mb-1">Enquadramento</p>
                    <p className="text-xs text-ink-2">{analise.camera.enquadramento}</p>
                  </div>
                </SecaoCard>

                {/* Iluminação */}
                <SecaoCard titulo="Iluminação" nota={analise.iluminacao.nota} icone={<Lightbulb size={14} />} defaultOpen>
                  <p className="text-xs text-ink-2 leading-relaxed">{analise.iluminacao.avaliacao}</p>
                  {analise.iluminacao.problemas.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono text-danger uppercase mb-1.5">Problemas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analise.iluminacao.problemas.map((p, i) => <Tag key={i} texto={p} tipo="ruim" />)}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-mono text-green uppercase mb-1.5">Soluções</p>
                    <div className="space-y-1.5">
                      {analise.iluminacao.solucoes.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check size={10} className="text-green shrink-0 mt-0.5" />
                          <p className="text-xs text-ink-2">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-line pt-3">
                    <p className="text-[10px] font-mono text-ink-3 uppercase mb-1.5">Setup recomendado</p>
                    <p className="text-xs text-ink-2 mb-1"><span className="text-ink-3">Principal:</span> {analise.iluminacao_setup.posicao_luz}</p>
                    <p className="text-xs text-ink-2 mb-1"><span className="text-ink-3">Fill:</span> {analise.iluminacao_setup.luz_fill}</p>
                    {analise.iluminacao_setup.horario_ideal && (
                      <p className="text-xs text-ink-2"><span className="text-ink-3">Horário:</span> {analise.iluminacao_setup.horario_ideal}</p>
                    )}
                    {analise.iluminacao_setup.produtos_baratos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {analise.iluminacao_setup.produtos_baratos.map((p, i) => <Tag key={i} texto={p} tipo="dica" />)}
                      </div>
                    )}
                  </div>
                </SecaoCard>

                {/* Fundo/Cenário */}
                <SecaoCard titulo="Fundo & Cenário" nota={analise.fundo.nota} icone={<Monitor size={14} />}>
                  <p className="text-xs text-ink-2 leading-relaxed">{analise.fundo.avaliacao}</p>
                  <p className="text-xs text-ink-2"><span className="text-ink-3">Posição ideal:</span> {analise.fundo.posicao_ideal}</p>
                  {analise.fundo.elementos_remover.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono text-danger uppercase mb-1.5">Remover</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analise.fundo.elementos_remover.map((e, i) => <Tag key={i} texto={e} tipo="ruim" />)}
                      </div>
                    </div>
                  )}
                  {analise.fundo.elementos_adicionar.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono text-green uppercase mb-1.5">Adicionar</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analise.fundo.elementos_adicionar.map((e, i) => <Tag key={i} texto={e} tipo="ok" />)}
                      </div>
                    </div>
                  )}
                  {analise.cenario.props_sugeridos.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono text-tofu uppercase mb-1.5">Props sugeridos</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analise.cenario.props_sugeridos.map((p, i) => <Tag key={i} texto={p} tipo="dica" />)}
                      </div>
                    </div>
                  )}
                </SecaoCard>

                {/* Áudio */}
                <SecaoCard titulo="Áudio & Acústica" nota={analise.audio.nota} icone={<Mic size={14} />}>
                  <p className="text-xs text-ink-2 leading-relaxed">{analise.audio.avaliacao}</p>
                  {analise.audio.problemas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {analise.audio.problemas.map((p, i) => <Tag key={i} texto={p} tipo="ruim" />)}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {analise.audio.solucoes.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Zap size={10} className="text-tofu shrink-0 mt-0.5" />
                        <p className="text-xs text-ink-2">{s}</p>
                      </div>
                    ))}
                  </div>
                </SecaoCard>

                {/* Transformações do cenário */}
                {analise.cenario.transformacoes.length > 0 && (
                  <SecaoCard titulo="Como Transformar o Espaço" icone={<Star size={14} />}>
                    <div className="space-y-2">
                      {analise.cenario.transformacoes.map((t, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-raised border border-line">
                          <span className="text-[11px] font-mono text-green font-bold shrink-0">{i + 1}.</span>
                          <p className="text-xs text-ink-2 leading-relaxed">{t}</p>
                        </div>
                      ))}
                    </div>
                  </SecaoCard>
                )}

                {/* Nova análise */}
                <Button variante="secondary" tamanho="md" icone={<RotateCcw size={13} />} className="w-full" onClick={resetar}>
                  Analisar outro ambiente
                </Button>

              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
