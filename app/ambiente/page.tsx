'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Upload, Zap, RotateCcw, Check, X, Lightbulb,
  Mic, Monitor, Star, ChevronDown, ChevronUp,
  Video, ScanLine, Target, Image as ImageIcon,
  Radio, Volume2, VolumeX, Send, StopCircle,
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

interface Mensagem { role: 'user' | 'assistant'; content: string; frame?: string }

/* ─── Helpers ────────────────────────────────────────────────── */
function Nota({ valor }: { valor: number }) {
  const cor = valor >= 8 ? '#1DB954' : valor >= 5 ? '#D98C00' : '#E5534B'
  return <span className="text-sm font-bold tabular-nums" style={{ color: cor }}>{valor}<span className="text-[10px] font-normal text-ink-3">/10</span></span>
}

function Tag({ texto, tipo = 'neutro' }: { texto: string; tipo?: 'ok' | 'ruim' | 'neutro' | 'dica' }) {
  const estilos = { ok: 'bg-green/10 border-green/25 text-green', ruim: 'bg-danger/10 border-danger/25 text-danger', neutro: 'bg-raised border-line text-ink-3', dica: 'bg-tofu/10 border-tofu/25 text-tofu' }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border ${estilos[tipo]}`}>
      {tipo === 'ok' && <Check size={9} />}{tipo === 'ruim' && <X size={9} />}{tipo === 'dica' && <Zap size={9} />}
      {texto}
    </span>
  )
}

function SecaoCard({ titulo, nota, icone, children, defaultOpen = false }: { titulo: string; nota?: number; icone: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [aberto, setAberto] = useState(defaultOpen)
  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <button onClick={() => setAberto(!aberto)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-raised/50 transition-colors">
        <div className="flex items-center gap-2.5"><span className="text-ink-3">{icone}</span><span className="text-sm font-semibold text-ink">{titulo}</span></div>
        <div className="flex items-center gap-3">{nota !== undefined && <Nota valor={nota} />}{aberto ? <ChevronUp size={13} className="text-ink-3" /> : <ChevronDown size={13} className="text-ink-3" />}</div>
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 border-t border-line space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Modo Ao Vivo ───────────────────────────────────────────── */
function ModoAoVivo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [sessaoAtiva, setSessaoAtiva] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [respondendo, setRespondendo] = useState(false)
  const [voz, setVoz] = useState(true)
  const [erroCam, setErroCam] = useState('')
  const [intervaloSeg, setIntervaloSeg] = useState(15)

  // Scroll automático no chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [mensagens])

  const abrirCamera = async () => {
    setErroCam('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      setCameraAtiva(true)
    } catch {
      setErroCam('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }

  const fecharCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraAtiva(false)
    setSessaoAtiva(false)
    if (intervaloRef.current) clearInterval(intervaloRef.current)
  }, [])

  const capturarFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null
    const v = videoRef.current
    const c = canvasRef.current
    c.width = Math.min(v.videoWidth, 800)
    c.height = Math.round(c.width * (v.videoHeight / v.videoWidth))
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', 0.7)
  }

  const falar = (texto: string) => {
    if (!voz || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.05
    utterance.pitch = 1.0
    // Prefere voz em português se disponível
    const vozes = window.speechSynthesis.getVoices()
    const vozPt = vozes.find(v => v.lang.startsWith('pt'))
    if (vozPt) utterance.voice = vozPt
    window.speechSynthesis.speak(utterance)
  }

  const analisarFrame = useCallback(async (historico: Mensagem[]) => {
    const frame = capturarFrame()
    if (!frame || respondendo) return

    setRespondendo(true)

    // Adiciona mensagem do user (invisível no chat, só para contexto)
    const novasMensagens: Mensagem[] = [...historico, { role: 'user', content: '', frame }]

    // Placeholder da resposta
    const idxResposta = novasMensagens.length
    novasMensagens.push({ role: 'assistant', content: '' })
    setMensagens([...novasMensagens])

    try {
      const resp = await fetch('/api/ambiente/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frame,
          historico: historico.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!resp.ok || !resp.body) throw new Error('Erro na API')

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let textoCompleto = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        textoCompleto += chunk
        setMensagens(prev => {
          const updated = [...prev]
          updated[idxResposta] = { role: 'assistant', content: textoCompleto }
          return updated
        })
      }

      falar(textoCompleto)
      return [...novasMensagens.slice(0, idxResposta), { role: 'assistant' as const, content: textoCompleto }]
    } catch (e) {
      const erroMsg = 'Erro ao analisar. Tentando novamente...'
      setMensagens(prev => {
        const updated = [...prev]
        updated[idxResposta] = { role: 'assistant', content: erroMsg }
        return updated
      })
    } finally {
      setRespondendo(false)
    }
    return novasMensagens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respondendo, voz])

  const iniciarSessao = async () => {
    setSessaoAtiva(true)
    setMensagens([])
    window.speechSynthesis.cancel()

    // Primeira análise imediata
    const hist: Mensagem[] = []
    const resultado = await analisarFrame(hist)
    const novoHist = resultado ?? hist

    // Intervalo automático
    intervaloRef.current = setInterval(async () => {
      setMensagens(prev => {
        analisarFrame(prev.filter(m => m.role === 'assistant' && m.content))
        return prev
      })
    }, intervaloSeg * 1000)

    return () => { if (intervaloRef.current) clearInterval(intervaloRef.current) }
  }

  const pararSessao = () => {
    setSessaoAtiva(false)
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    window.speechSynthesis.cancel()
  }

  const analisarAgora = () => {
    setMensagens(prev => {
      analisarFrame(prev.filter(m => m.content))
      return prev
    })
  }

  useEffect(() => () => { fecharCamera(); window.speechSynthesis?.cancel() }, [fecharCamera])

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-5 h-full">

      {/* Câmera */}
      <div className="space-y-3">
        {!cameraAtiva ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-line rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-raised border border-line flex items-center justify-center mx-auto mb-4">
              <Video size={28} className="text-ink-3" />
            </div>
            <p className="text-base font-semibold text-ink mb-1">Coach de Gravação ao Vivo</p>
            <p className="text-sm text-ink-3 mb-2 max-w-sm mx-auto">
              Ligue a câmera, aponte pro seu espaço e converse com a IA sobre como melhorar seu setup em tempo real.
            </p>
            <p className="text-xs text-ink-3 mb-6">A IA analisa automaticamente a cada {intervaloSeg} segundos e fala com você.</p>
            {erroCam && <p className="text-xs text-danger mb-4">{erroCam}</p>}
            <Button variante="primary" tamanho="lg" icone={<Camera size={15} />} onClick={abrirCamera}>
              Ligar câmera
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-line">
              <video ref={videoRef} className="w-full max-h-[420px] object-cover" playsInline muted />

              {/* Overlay status */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                {sessaoAtiva ? (
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
                    <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                    <span className="text-[11px] text-white font-mono">AO VIVO</span>
                  </div>
                ) : (
                  <div className="bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
                    <span className="text-[11px] text-ink-3 font-mono">CÂMERA LIGADA</span>
                  </div>
                )}
                <button
                  onClick={() => setVoz(!voz)}
                  className="bg-black/60 backdrop-blur rounded-full p-2 text-white hover:bg-black/80 transition-colors"
                  title={voz ? 'Desligar voz' : 'Ligar voz'}
                >
                  {voz ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
              </div>

              {/* Guia de enquadramento */}
              <div className="absolute inset-6 border border-white/15 rounded-lg pointer-events-none" />

              {respondendo && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-tofu"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                    ))}
                  </div>
                  <span className="text-[11px] text-white">Analisando...</span>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2 flex-wrap">
              {!sessaoAtiva ? (
                <Button variante="primary" tamanho="md" icone={<Radio size={13} />} onClick={iniciarSessao} className="flex-1">
                  Iniciar sessão ao vivo
                </Button>
              ) : (
                <>
                  <Button variante="secondary" tamanho="sm" icone={<Send size={12} />} onClick={analisarAgora} carregando={respondendo}>
                    Analisar agora
                  </Button>
                  <Button variante="danger" tamanho="sm" icone={<StopCircle size={12} />} onClick={pararSessao}>
                    Pausar
                  </Button>
                </>
              )}
              <Button variante="ghost" tamanho="sm" icone={<X size={12} />} onClick={fecharCamera}>
                Fechar câmera
              </Button>

              {/* Intervalo */}
              {!sessaoAtiva && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[11px] text-ink-3">A cada</span>
                  <select
                    value={intervaloSeg}
                    onChange={e => setIntervaloSeg(Number(e.target.value))}
                    className="text-xs bg-surface border border-line rounded px-2 py-1 text-ink-2"
                  >
                    <option value={10}>10s</option>
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1min</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Dicas de uso */}
        {!sessaoAtiva && (
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Como usar o modo ao vivo</p>
            <div className="space-y-2">
              {[
                { icone: <Camera size={11} />, texto: 'Aponte a câmera para o espaço onde você grava' },
                { icone: <Radio size={11} />, texto: 'Clique em "Iniciar sessão" — a IA vai te falar o que vê' },
                { icone: <Volume2 size={11} />, texto: 'Ative o volume para ouvir os feedbacks em voz' },
                { icone: <Send size={11} />, texto: 'Clique "Analisar agora" a qualquer momento para pedir feedback' },
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

      {/* Chat */}
      <div className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden" style={{ minHeight: 420 }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
          <div className={`w-2 h-2 rounded-full ${sessaoAtiva ? 'bg-danger animate-pulse' : 'bg-ink-3'}`} />
          <span className="text-sm font-semibold text-ink">Coach IA</span>
          {voz && <Volume2 size={12} className="text-green ml-auto" />}
        </div>

        {/* Mensagens */}
        <div ref={chatRef} className="flex-1 overflow-y-auto scroll-thin p-4 space-y-3">
          {mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-raised border border-line flex items-center justify-center mx-auto mb-3">
                <Radio size={20} className="text-ink-3" />
              </div>
              <p className="text-sm font-medium text-ink-2 mb-1">Aguardando início</p>
              <p className="text-xs text-ink-3 max-w-[200px]">
                Ligue a câmera e inicie a sessão para começar a conversar com o coach
              </p>
            </div>
          ) : (
            mensagens.filter(m => m.role === 'assistant').map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5"
              >
                {/* Avatar IA */}
                <div className="w-7 h-7 rounded-full bg-tofu/20 border border-tofu/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={12} className="text-tofu" />
                </div>
                <div className="flex-1">
                  <div className="bg-raised border border-line rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    {msg.content ? (
                      <p className="text-sm text-ink leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="flex gap-1 py-1">
                        {[0,1,2].map(j => (
                          <motion.div key={j} className="w-1.5 h-1.5 rounded-full bg-ink-3"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, delay: j * 0.2, repeat: Infinity }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-ink-3 mt-1 ml-1 font-mono">Análise {i + 1}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer do chat */}
        {sessaoAtiva && (
          <div className="px-4 py-3 border-t border-line flex items-center gap-2">
            <div className="flex-1 text-[11px] text-ink-3">
              {respondendo ? 'Analisando seu espaço...' : `Próxima análise em ${intervaloSeg}s`}
            </div>
            <button onClick={analisarAgora} disabled={respondendo}
              className="text-[11px] text-tofu hover:text-tofu/80 transition-colors disabled:opacity-40 flex items-center gap-1">
              <Send size={10} /> Agora
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────── */
export default function AmbientePage() {
  const [aba, setAba] = useState<'foto' | 'aovivo'>('aovivo')
  const [imagem, setImagem] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [erro, setErro] = useState('')
  const [modoCaptura, setModoCaptura] = useState<'upload' | 'camera'>('upload')
  const [cameraFotoAtiva, setCameraFotoAtiva] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const videoFotoRef = useRef<HTMLVideoElement>(null)
  const canvasFotoRef = useRef<HTMLCanvasElement>(null)
  const streamFotoRef = useRef<MediaStream | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) lerArquivo(file)
  }, [])

  const lerArquivo = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => { setImagem(e.target?.result as string); setAnalise(null) }
    reader.readAsDataURL(file)
  }

  const abrirCameraFoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamFotoRef.current = stream
      if (videoFotoRef.current) { videoFotoRef.current.srcObject = stream; videoFotoRef.current.play() }
      setCameraFotoAtiva(true)
    } catch { setErro('Não foi possível acessar a câmera.') }
  }

  const fecharCameraFoto = () => {
    streamFotoRef.current?.getTracks().forEach(t => t.stop())
    streamFotoRef.current = null
    setCameraFotoAtiva(false)
  }

  const capturarFoto = () => {
    if (!videoFotoRef.current || !canvasFotoRef.current) return
    const v = videoFotoRef.current; const c = canvasFotoRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    setImagem(c.toDataURL('image/jpeg', 0.9))
    setAnalise(null)
    fecharCameraFoto()
  }

  const analisar = async () => {
    if (!imagem) return
    setAnalisando(true); setErro(''); setAnalise(null)
    try {
      const resp = await fetch('/api/ambiente', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imagem }) })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error)
      setAnalise(json.data)
    } catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao analisar') }
    finally { setAnalisando(false) }
  }

  const resetar = () => { setImagem(null); setAnalise(null); setErro(''); fecharCameraFoto() }
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
            <p className="text-sm text-ink-3">Coach de setup ao vivo ou análise detalhada de foto do seu espaço.</p>
          </div>
          {imagem && aba === 'foto' && (
            <button onClick={resetar} className="flex items-center gap-1.5 text-xs text-ink-3 hover:text-danger transition-colors px-3 py-1.5 rounded border border-line hover:border-danger/30">
              <RotateCcw size={12} /> Recomeçar
            </button>
          )}
        </div>

        {/* Abas */}
        <div className="flex gap-1 p-1 bg-raised border border-line rounded-lg w-fit">
          {[
            { key: 'aovivo', icone: <Radio size={13} />, label: 'Coach ao vivo', badge: 'NOVO' },
            { key: 'foto',   icone: <ImageIcon size={13} />, label: 'Analisar foto', badge: '' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setAba(opt.key as typeof aba)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                aba === opt.key ? 'bg-surface border border-line text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              <span className={aba === opt.key ? 'text-tofu' : 'text-ink-3'}>{opt.icone}</span>
              {opt.label}
              {opt.badge && (
                <span className="text-[9px] font-mono bg-tofu/20 text-tofu border border-tofu/30 px-1.5 py-0.5 rounded-full">{opt.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba */}
        <AnimatePresence mode="wait">
          {aba === 'aovivo' ? (
            <motion.div key="aovivo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ModoAoVivo />
            </motion.div>
          ) : (
            <motion.div key="foto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-[420px_1fr] gap-6">

                {/* Captura */}
                <div className="space-y-4">
                  {!imagem && !cameraFotoAtiva && (
                    <div className="flex gap-2 p-1 bg-raised border border-line rounded-lg">
                      {[{ key: 'upload', icone: <Upload size={13} />, label: 'Enviar foto' }, { key: 'camera', icone: <Video size={13} />, label: 'Usar câmera' }].map(opt => (
                        <button key={opt.key} onClick={() => setModoCaptura(opt.key as typeof modoCaptura)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${modoCaptura === opt.key ? 'bg-surface border border-line text-ink' : 'text-ink-3 hover:text-ink-2'}`}>
                          {opt.icone} {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {!imagem && !cameraFotoAtiva && modoCaptura === 'upload' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                      onClick={() => inputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-tofu/60 bg-tofu/5' : 'border-line hover:border-line-2 hover:bg-raised/50'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${dragOver ? 'bg-tofu/15' : 'bg-raised border border-line'}`}>
                        <ImageIcon size={24} className={dragOver ? 'text-tofu' : 'text-ink-3'} />
                      </div>
                      <p className="text-sm font-semibold text-ink-2 mb-1">{dragOver ? 'Solte aqui!' : 'Arraste a foto ou clique'}</p>
                      <p className="text-xs text-ink-3">JPG, PNG, WEBP até 10MB</p>
                      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) lerArquivo(f) }} />
                    </motion.div>
                  )}

                  {!imagem && modoCaptura === 'camera' && (
                    !cameraFotoAtiva ? (
                      <div className="border-2 border-dashed border-line rounded-xl p-10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-raised border border-line flex items-center justify-center mx-auto mb-4"><Camera size={24} className="text-ink-3" /></div>
                        <p className="text-sm font-semibold text-ink-2 mb-5">Ativar câmera</p>
                        <Button variante="secondary" tamanho="md" icone={<Camera size={14} />} onClick={abrirCameraFoto}>Abrir câmera</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden bg-black border border-line">
                          <video ref={videoFotoRef} className="w-full" playsInline muted />
                          <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none" />
                        </div>
                        <div className="flex gap-2">
                          <Button variante="secondary" tamanho="sm" icone={<X size={12} />} onClick={fecharCameraFoto} className="flex-1">Cancelar</Button>
                          <Button variante="primary" tamanho="sm" icone={<Camera size={12} />} onClick={capturarFoto} className="flex-1">Capturar</Button>
                        </div>
                        <canvas ref={canvasFotoRef} className="hidden" />
                      </div>
                    )
                  )}

                  {imagem && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-line bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagem} alt="Ambiente" className="w-full object-cover max-h-72" />
                        {analise && (
                          <div className="absolute top-3 right-3">
                            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2" style={{ backgroundColor: `${scoreColor(analise.score)}15`, borderColor: `${scoreColor(analise.score)}60` }}>
                              <span className="text-lg font-bold" style={{ color: scoreColor(analise.score) }}>{analise.score}</span>
                              <span className="text-[8px] text-ink-3">/10</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {!analise && !analisando && <Button variante="primary" tamanho="lg" className="w-full" carregando={analisando} icone={<Zap size={15} />} onClick={analisar}>Analisar Ambiente com IA</Button>}
                      {analisando && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-line">
                          <div className="w-6 h-6 border-2 border-line border-t-tofu rounded-full animate-spin shrink-0" />
                          <div><p className="text-sm font-medium text-ink">Analisando...</p><p className="text-xs text-ink-3">Verificando iluminação, câmera, fundo e áudio</p></div>
                        </div>
                      )}
                      {erro && <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{erro}</p>}
                    </motion.div>
                  )}

                  {!analise && (
                    <div className="rounded-lg border border-line bg-surface p-4">
                      <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Como fotografar</p>
                      <div className="space-y-2">
                        {[{ icone: <Camera size={11} />, t: 'Foto do ambiente inteiro, não selfie' }, { icone: <Lightbulb size={11} />, t: 'Inclua as fontes de luz visíveis' }, { icone: <Monitor size={11} />, t: 'Mostre o fundo onde você grava' }, { icone: <Target size={11} />, t: 'Foto de onde a câmera ficaria' }].map((d, i) => (
                          <div key={i} className="flex items-center gap-2"><span className="text-tofu shrink-0">{d.icone}</span><p className="text-[11px] text-ink-3">{d.t}</p></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Análise */}
                <div>
                  {!analise && !analisando && (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed border-line rounded-xl">
                      <div className="w-16 h-16 rounded-2xl bg-raised border border-line flex items-center justify-center mx-auto mb-5"><ScanLine size={28} className="text-ink-3" /></div>
                      <h3 className="text-base font-semibold text-ink-2 mb-2">Análise aparecerá aqui</h3>
                      <p className="text-sm text-ink-3 max-w-xs">Envie uma foto do seu espaço para receber um guia completo de produção</p>
                    </div>
                  )}
                  {analisando && <div className="space-y-3">{[100, 180, 150, 200, 140].map((h, i) => <div key={i} className="shimmer rounded-lg" style={{ height: h }} />)}</div>}
                  {analise && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                      <div className="rounded-lg border border-line bg-surface p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 shrink-0" style={{ borderColor: `${scoreColor(analise.score)}50`, backgroundColor: `${scoreColor(analise.score)}10` }}>
                            <span className="text-2xl font-bold" style={{ color: scoreColor(analise.score) }}>{analise.score}</span>
                            <span className="text-[9px] text-ink-3">/10</span>
                          </div>
                          <div><p className="text-sm font-semibold text-ink mb-1">Avaliação Geral</p><p className="text-xs text-ink-2 leading-relaxed">{analise.resumo}</p></div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-mofu/30 bg-mofu/5 p-4">
                        <p className="text-[10px] font-mono text-mofu uppercase tracking-widest mb-2">🎯 Prioridades</p>
                        <div className="space-y-2">{analise.prioridades.map((p, i) => (
                          <div key={i} className="flex items-start gap-2.5"><span className="text-[11px] font-mono font-bold text-mofu shrink-0">{i + 1}.</span><p className="text-xs text-ink-2">{p}</p></div>
                        ))}</div>
                      </div>
                      <div className="rounded-lg border border-line bg-surface p-4">
                        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-3">Checklist</p>
                        <div className="space-y-2">{analise.checklist.map((c, i) => (
                          <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border ${c.ok ? 'bg-green/5 border-green/20' : 'bg-danger/5 border-danger/15'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${c.ok ? 'bg-green/20 text-green' : 'bg-danger/15 text-danger'}`}>{c.ok ? <Check size={10} /> : <X size={10} />}</div>
                            <div><p className="text-xs font-medium text-ink-2">{c.item}</p>{!c.ok && <p className="text-[10px] text-danger/80 mt-0.5">{c.acao}</p>}</div>
                          </div>
                        ))}</div>
                      </div>
                      <SecaoCard titulo="Câmera" icone={<Camera size={14} />} defaultOpen>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ label: 'Posição', valor: analise.camera.posicao_ideal }, { label: 'Altura', valor: analise.camera.altura }, { label: 'Ângulo', valor: analise.camera.angulo }, { label: 'Distância', valor: analise.camera.distancia }].map(item => (
                            <div key={item.label} className="bg-raised border border-line rounded-lg p-2.5"><p className="text-[9px] font-mono text-ink-3 uppercase mb-1">{item.label}</p><p className="text-xs text-ink-2">{item.valor}</p></div>
                          ))}
                        </div>
                      </SecaoCard>
                      <SecaoCard titulo="Iluminação" nota={analise.iluminacao.nota} icone={<Lightbulb size={14} />} defaultOpen>
                        <p className="text-xs text-ink-2">{analise.iluminacao.avaliacao}</p>
                        <div className="flex flex-wrap gap-1.5">{analise.iluminacao.problemas.map((p, i) => <Tag key={i} texto={p} tipo="ruim" />)}</div>
                        <div className="space-y-1.5">{analise.iluminacao.solucoes.map((s, i) => <div key={i} className="flex items-start gap-2"><Check size={10} className="text-green shrink-0 mt-0.5" /><p className="text-xs text-ink-2">{s}</p></div>)}</div>
                        {analise.iluminacao_setup.produtos_baratos.length > 0 && <div className="flex flex-wrap gap-1.5">{analise.iluminacao_setup.produtos_baratos.map((p, i) => <Tag key={i} texto={p} tipo="dica" />)}</div>}
                      </SecaoCard>
                      <SecaoCard titulo="Fundo & Cenário" nota={analise.fundo.nota} icone={<Monitor size={14} />}>
                        <p className="text-xs text-ink-2">{analise.fundo.avaliacao}</p>
                        <div className="flex flex-wrap gap-1.5">{analise.fundo.elementos_remover.map((e, i) => <Tag key={i} texto={e} tipo="ruim" />)}</div>
                        <div className="flex flex-wrap gap-1.5">{analise.fundo.elementos_adicionar.map((e, i) => <Tag key={i} texto={e} tipo="ok" />)}</div>
                        <div className="flex flex-wrap gap-1.5">{analise.cenario.props_sugeridos.map((p, i) => <Tag key={i} texto={p} tipo="dica" />)}</div>
                      </SecaoCard>
                      <SecaoCard titulo="Áudio" nota={analise.audio.nota} icone={<Mic size={14} />}>
                        <p className="text-xs text-ink-2">{analise.audio.avaliacao}</p>
                        <div className="flex flex-wrap gap-1.5">{analise.audio.problemas.map((p, i) => <Tag key={i} texto={p} tipo="ruim" />)}</div>
                        <div className="space-y-1.5">{analise.audio.solucoes.map((s, i) => <div key={i} className="flex items-start gap-2"><Zap size={10} className="text-tofu shrink-0 mt-0.5" /><p className="text-xs text-ink-2">{s}</p></div>)}</div>
                      </SecaoCard>
                      {analise.cenario.transformacoes.length > 0 && (
                        <SecaoCard titulo="Transformações do Espaço" icone={<Star size={14} />}>
                          <div className="space-y-2">{analise.cenario.transformacoes.map((t, i) => <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-raised border border-line"><span className="text-[11px] font-mono text-green font-bold shrink-0">{i + 1}.</span><p className="text-xs text-ink-2">{t}</p></div>)}</div>
                        </SecaoCard>
                      )}
                      <Button variante="secondary" tamanho="md" icone={<RotateCcw size={13} />} className="w-full" onClick={resetar}>Analisar outro ambiente</Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
