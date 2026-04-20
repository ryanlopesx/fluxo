'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, TrendingUp, Heart, MessageCircle, Play, Hash, RefreshCw, Eye, AlertCircle, Lock } from 'lucide-react'
import type { PostInstagram } from '@/lib/instagram'

interface TrendingData {
  posts: PostInstagram[]
  hashtags_trending: string[]
  tema_principal: string
  insights: string[]
}

interface InstagramTrendingProps {
  keywords: string[]
  onSelecionarPost?: (post: PostInstagram) => void
  postSelecionado?: PostInstagram | null
}

function NumeroCompacto({ n }: { n: number }) {
  if (n >= 1_000_000) return <>{(n / 1_000_000).toFixed(1)}M</>
  if (n >= 1_000) return <>{(n / 1_000).toFixed(1)}k</>
  return <>{n}</>
}

function PostCard({ post, selecionado, onClick }: { post: PostInstagram; selecionado: boolean; onClick: () => void }) {
  const corTipo = post.tipo === 'reel' ? '#60A5FA' : post.tipo === 'carrossel' ? '#FBBF24' : '#34D399'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`rounded-lg border p-3 cursor-pointer transition-all duration-150 ${
        selecionado
          ? 'border-green/40 bg-green/5'
          : 'border-border hover:border-border/80 bg-surface'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Thumbnail ou placeholder */}
        <div
          className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-muted"
          style={{ backgroundColor: `${corTipo}10`, border: `1px solid ${corTipo}30` }}
        >
          {post.tipo === 'reel' ? <Play size={16} style={{ color: corTipo }} /> : <Eye size={16} style={{ color: corTipo }} />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Tipo + autor */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded" style={{ color: corTipo, backgroundColor: `${corTipo}15`, border: `1px solid ${corTipo}30` }}>
              {post.tipo}
            </span>
            <span className="text-[10px] text-muted truncate">@{post.autor}</span>
          </div>

          {/* Legenda */}
          <p className="text-xs text-secondary leading-snug line-clamp-2">{post.legenda || '(sem legenda)'}</p>

          {/* Métricas */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-muted flex items-center gap-0.5">
              <Heart size={9} className="text-red-400" />
              <NumeroCompacto n={post.curtidas} />
            </span>
            <span className="text-[10px] text-muted flex items-center gap-0.5">
              <MessageCircle size={9} />
              <NumeroCompacto n={post.comentarios} />
            </span>
            {post.visualizacoes && (
              <span className="text-[10px] text-muted flex items-center gap-0.5">
                <Play size={9} />
                <NumeroCompacto n={post.visualizacoes} />
              </span>
            )}
            <span className="ml-auto text-[10px] font-mono" style={{ color: post.engajamento_estimado > 5 ? '#34D399' : '#8B949E' }}>
              {post.engajamento_estimado}% eng.
            </span>
          </div>
        </div>
      </div>

      {selecionado && (
        <div className="mt-2 pt-2 border-t border-accent/20">
          <p className="text-[10px] text-accent font-medium">✓ Post selecionado como referência</p>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-[10px] text-muted hover:text-accent transition-colors"
          >
            Ver no Instagram ↗
          </a>
        </div>
      )}
    </motion.div>
  )
}

export default function InstagramTrending({ keywords, onSelecionarPost, postSelecionado }: InstagramTrendingProps) {
  const [dados, setDados] = useState<TrendingData | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [configurado, setConfigurado] = useState<boolean | null>(null)
  const [erro, setErro] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'posts' | 'hashtags' | 'insights'>('posts')

  const buscar = async () => {
    setCarregando(true)
    setErro('')
    try {
      const q = keywords.slice(0, 3).join(',')
      const resp = await fetch(`/api/instagram?mode=trending&q=${encodeURIComponent(q)}&limit=10`)
      const json = await resp.json()

      setConfigurado(json.configurado !== false)

      if (json.error && !json.data) {
        setErro(json.error)
        return
      }
      if (json.data) setDados(json.data)
    } catch {
      setErro('Erro ao conectar com a API do Instagram')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (keywords.length > 0) buscar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Não configurado
  if (configurado === false) {
    return (
      <div className="rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Instagram size={16} className="text-pink-400" />
          <span className="text-sm font-medium text-primary">Instagram Trending</span>
        </div>
        <div className="flex gap-2 p-3 rounded-lg bg-amber-950/20 border border-amber-800/30">
          <Lock size={14} className="text-mofu shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-secondary">Instagram não configurado</p>
            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
              Adicione no <code className="text-accent bg-elevated px-1 rounded">.env.local</code>:
            </p>
            <pre className="text-[10px] text-secondary font-mono mt-1 bg-elevated/50 p-2 rounded leading-relaxed">
              INSTAGRAM_USERNAME=seu_usuario{'\n'}INSTAGRAM_PASSWORD=sua_senha
            </pre>
            <p className="text-[10px] text-muted mt-1">Recomendado: use uma conta secundária</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <Instagram size={15} className="text-pink-400" />
          <span className="text-sm font-medium text-primary">Instagram Trending</span>
          {keywords.length > 0 && (
            <div className="flex gap-1">
              {keywords.slice(0, 2).map(k => (
                <span key={k} className="text-[9px] px-1.5 py-0.5 rounded bg-elevated border border-border text-muted">#{k}</span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={buscar}
          disabled={carregando}
          className="text-muted hover:text-secondary transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={carregando ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Abas */}
      {dados && (
        <div className="flex border-b border-border">
          {(['posts', 'hashtags', 'insights'] as const).map(aba => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                abaAtiva === aba ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-secondary'
              }`}
            >
              {aba === 'posts' ? `Posts (${dados.posts.length})` : aba === 'hashtags' ? `Hashtags` : 'Insights'}
            </button>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-3 max-h-80 overflow-y-auto">
        {carregando && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg shimmer" />
            ))}
          </div>
        )}

        {erro && !carregando && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-950/20 border border-red-800/30">
            <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{erro}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {dados && !carregando && (
            <motion.div key={abaAtiva} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {abaAtiva === 'posts' && (
                <div className="space-y-2">
                  {dados.posts.length === 0 ? (
                    <p className="text-xs text-muted text-center py-4">Nenhum post encontrado para essas keywords</p>
                  ) : dados.posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      selecionado={postSelecionado?.id === post.id}
                      onClick={() => onSelecionarPost?.(post)}
                    />
                  ))}
                </div>
              )}

              {abaAtiva === 'hashtags' && (
                <div className="flex flex-wrap gap-2 py-2">
                  {dados.hashtags_trending.map(h => (
                    <motion.span
                      key={h}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-elevated border border-border text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Hash size={10} className="text-accent" />
                      {h.replace('#', '')}
                    </motion.span>
                  ))}
                </div>
              )}

              {abaAtiva === 'insights' && (
                <div className="space-y-2 py-1">
                  {dados.insights.length === 0 ? (
                    <p className="text-xs text-muted">Nenhum insight disponível para este nicho</p>
                  ) : dados.insights.map((insight, i) => (
                    <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-elevated/50 border border-border">
                      <TrendingUp size={12} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-secondary leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
