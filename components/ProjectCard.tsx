'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, FileText, Users } from 'lucide-react'
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link href={`/projects/${projeto.id}`}>
        <div className="group bg-surface border border-line rounded-lg p-4 hover:border-line-2 hover:bg-raised transition-all duration-150 cursor-pointer relative overflow-hidden">
          {/* Accent lateral */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ backgroundColor: cor }} />

          <div className="pl-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-ink group-hover:text-ink transition-colors line-clamp-1 leading-snug">
                  {projeto.name as string}
                </h3>
                <p className="text-xs text-ink-3 font-mono mt-0.5 truncate">{projeto.product_name as string}</p>
              </div>
              <ArrowUpRight size={13} className="text-ink-3 group-hover:text-ink-2 transition-colors shrink-0 mt-0.5" />
            </div>

            {/* Público */}
            <div className="flex items-start gap-1.5 mb-3">
              <Users size={11} className="text-ink-3 shrink-0 mt-0.5" />
              <p className="text-[11px] text-ink-3 line-clamp-1 leading-snug">{projeto.target_audience as string}</p>
            </div>

            {/* Keywords */}
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

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-line">
              <div className="flex items-center gap-1.5">
                <FileText size={11} style={{ color: cor }} />
                <span className="text-xs text-ink-3">
                  {projeto.total_roteiros ?? 0} roteiro{(projeto.total_roteiros ?? 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-[9px] text-ink-3 font-mono">{tempoAgo}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
