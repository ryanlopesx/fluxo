'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FolderKanban, ArrowUpRight, FileText } from 'lucide-react'
import type { Projeto } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProjectCardProps {
  projeto: Projeto & { total_roteiros?: number }
  delay?: number
}

export default function ProjectCard({ projeto, delay = 0 }: ProjectCardProps) {
  const tempoAgo = formatDistanceToNow(new Date(projeto.updated_at as number), { addSuffix: true, locale: ptBR })
  const cor = projeto.color as string

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link href={`/projects/${projeto.id}`}>
        <div
          style={{ borderLeftColor: cor, borderLeftWidth: 3 }}
          className="group bg-surface border border-line rounded p-4 hover:border-line-2 hover:bg-raised transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                style={{ color: cor, backgroundColor: `${cor}12`, borderColor: `${cor}20` }}
                className="w-8 h-8 rounded border flex items-center justify-center shrink-0"
              >
                <FolderKanban size={13} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink group-hover:text-ink transition-colors line-clamp-1">
                  {projeto.name as string}
                </h3>
                <p className="text-[10px] text-ink-3 truncate font-mono">{projeto.product_name as string}</p>
              </div>
            </div>
            <ArrowUpRight size={12} className="text-ink-3 group-hover:text-ink-2 transition-colors shrink-0 mt-0.5" />
          </div>

          <p className="text-xs text-ink-2 line-clamp-2 leading-relaxed mb-3">
            {projeto.target_audience as string}
          </p>

          {(projeto.keywords as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(projeto.keywords as string[]).slice(0, 3).map(kw => (
                <span key={kw} className="text-[9px] px-1.5 py-0.5 rounded bg-raised border border-line text-ink-3 font-mono">
                  #{kw}
                </span>
              ))}
              {(projeto.keywords as string[]).length > 3 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-raised border border-line text-ink-3">
                  +{(projeto.keywords as string[]).length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2.5 border-t border-line">
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <FileText size={11} style={{ color: cor }} />
              <span>{projeto.total_roteiros ?? 0} roteiro{(projeto.total_roteiros ?? 0) !== 1 ? 's' : ''}</span>
            </div>
            <span className="text-[9px] text-ink-3 font-mono">{tempoAgo}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
