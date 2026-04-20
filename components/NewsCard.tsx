'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Newspaper } from 'lucide-react'
import type { Noticia } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NewsCardProps {
  noticia: Noticia
  selecionada?: boolean
  onSelecionar?: (noticia: Noticia) => void
  delay?: number
}

export default function NewsCard({ noticia, selecionada = false, onSelecionar, delay = 0 }: NewsCardProps) {
  let tempoAgo = ''
  try {
    tempoAgo = formatDistanceToNow(new Date(noticia.published_at), { addSuffix: true, locale: ptBR })
  } catch {
    tempoAgo = 'recentemente'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={() => onSelecionar?.(noticia)}
      className={`rounded-lg border p-3 cursor-pointer transition-all duration-200 ${
        selecionada
          ? 'border-mofu/50 bg-amber-950/20'
          : 'border-border hover:border-border/80 hover:bg-elevated/50 bg-surface'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          selecionada ? 'bg-amber-900/30 text-mofu' : 'bg-elevated text-muted'
        }`}>
          <Newspaper size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary leading-snug line-clamp-2">{noticia.title}</p>
          {noticia.description && (
            <p className="text-[11px] text-muted mt-1 leading-relaxed line-clamp-2">{noticia.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-muted truncate">{noticia.source}</span>
            <span className="text-[10px] text-muted/50">·</span>
            <span className="text-[10px] text-muted">{tempoAgo}</span>
            {noticia.url !== '#' && (
              <a
                href={noticia.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="ml-auto text-muted hover:text-secondary transition-colors"
              >
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
      {selecionada && (
        <div className="mt-2 pt-2 border-t border-amber-800/20">
          <p className="text-[10px] text-mofu font-medium">✓ Notícia selecionada como contexto</p>
        </div>
      )}
    </motion.div>
  )
}
