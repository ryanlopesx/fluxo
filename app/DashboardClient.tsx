'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FolderKanban, FileText, ThumbsUp, BookCheck, Zap,
  Scissors, CheckSquare, ArrowRight, Plus, TrendingUp,
  BarChart3, Target, AlertTriangle,
} from 'lucide-react'
import type { Estatisticas, Roteiro, Projeto } from '@/types'
import StatsCard from '@/components/StatsCard'
import FunnelVisual from '@/components/FunnelVisual'
import ViralTimeline from '@/components/ViralTimeline'
import ScriptCard from '@/components/ScriptCard'
import ProjectCard from '@/components/ProjectCard'
import PageTransition from '@/components/PageTransition'
import Button from '@/components/ui/Button'

interface Props {
  stats: Estatisticas
  recentes: Roteiro[]
  projetos: (Projeto & { total_roteiros: number })[]
}

const PRINCIPIOS = [
  { num: '01', texto: 'Gancho viral ≠ educativo' },
  { num: '02', texto: 'Contexto rápido (5s ou menos)' },
  { num: '03', texto: 'Não revele o final no início' },
  { num: '04', texto: 'Re-hook no meio (15–25s)' },
  { num: '05', texto: 'Resolução só no final' },
]

const ERROS_RAPIDOS = [
  'Enrolação pra entregar a info',
  'Gancho fraco ou genérico',
  'Revelar o resultado cedo',
  'Falar sem método próprio',
]

export default function DashboardClient({ stats, recentes, projetos }: Props) {
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const scoresMedio = recentes.length > 0
    ? Math.round(recentes.reduce((s, r) => s + (r.checklist_score || 0), 0) / recentes.length)
    : 0
  const taxaAprovacao = stats.total_roteiros > 0
    ? Math.round((stats.total_aprovados / stats.total_roteiros) * 100)
    : 0

  return (
    <PageTransition>
      <div className="p-5 lg:p-7 max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-1">{hoje}</p>
            <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
            <p className="text-sm text-ink-3 mt-0.5">
              {stats.total_roteiros > 0
                ? `${stats.total_roteiros} roteiros · score médio ${scoresMedio}/10 · ${taxaAprovacao}% aprovados`
                : 'Crie seu primeiro projeto e gere roteiros com IA'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/checklist">
              <Button variante="ghost" tamanho="sm" icone={<CheckSquare size={13} />}>Checklist</Button>
            </Link>
            <Link href="/projects/new">
              <Button variante="primary" tamanho="sm" icone={<Plus size={13} />}>Novo Projeto</Button>
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard titulo="Projetos"  valor={stats.total_projetos}  icone={<FolderKanban size={14} />} cor="#1DB954" delay={0}    descricao="Perfis cadastrados" />
          <StatsCard titulo="Roteiros"  valor={stats.total_roteiros}  icone={<FileText size={14} />}     cor="#4B8FE8" delay={0.05}  descricao="Gerados no total" />
          <StatsCard titulo="Aprovados" valor={stats.total_aprovados} icone={<ThumbsUp size={14} />}     cor="#1DB954" delay={0.1}   descricao="Prontos para postar" />
          <StatsCard titulo="Usados"    valor={stats.total_usados}    icone={<BookCheck size={14} />}    cor="#D98C00" delay={0.15}  descricao="Já publicados" />
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* COLUNA 1 */}
          <div className="space-y-4">

            {/* Funil */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-surface border border-line rounded p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 size={13} className="text-green" />
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Funil</p>
                </div>
                <span className="text-[10px] font-mono text-ink-3 bg-raised border border-line px-2 py-0.5 rounded">
                  {stats.total_roteiros} total
                </span>
              </div>
              <FunnelVisual
                tofu={stats.por_estagio.tofu}
                mofu={stats.por_estagio.mofu}
                bofu={stats.por_estagio.bofu}
                total={stats.total_roteiros}
              />
              {stats.total_roteiros > 0 && (
                <div className="mt-3 pt-3 border-t border-line grid grid-cols-3 gap-2">
                  {[
                    { label: 'TOFU', n: stats.por_estagio.tofu, cor: '#4B8FE8' },
                    { label: 'MOFU', n: stats.por_estagio.mofu, cor: '#D98C00' },
                    { label: 'BOFU', n: stats.por_estagio.bofu, cor: '#1DB954' },
                  ].map(e => (
                    <div key={e.label} className="text-center">
                      <p className="text-base font-semibold tabular-nums" style={{ color: e.cor }}>{e.n}</p>
                      <p className="text-[9px] font-mono text-ink-3">{e.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Score médio */}
            {recentes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface border border-line rounded p-4"
              >
                <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-3">Score Médio</p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-semibold text-ink tabular-nums">{scoresMedio}</span>
                  <span className="text-sm text-ink-3 mb-1">/10</span>
                </div>
                <div className="h-1 bg-raised rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(scoresMedio / 10) * 100}%` }}
                    transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-green"
                  />
                </div>
                <p className="text-[10px] font-mono text-ink-3 mt-2">
                  {scoresMedio >= 8 ? 'Alta qualidade' : scoresMedio >= 5 ? 'Bom, melhore o re-hook' : 'Revise os ganchos'}
                </p>
              </motion.div>
            )}

            {/* Acesso rápido */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-surface border border-line rounded p-4 space-y-1.5"
            >
              <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider mb-2">Acesso Rápido</p>
              <Link href="/projects/new" className="block">
                <Button variante="primary" tamanho="sm" icone={<Plus size={13} />} className="w-full justify-start">
                  Novo Projeto
                </Button>
              </Link>
              <Link href="/cuts" className="block">
                <Button variante="secondary" tamanho="sm" icone={<Scissors size={13} />} className="w-full justify-start">
                  Criar Plano de Cortes
                </Button>
              </Link>
              <Link href="/checklist" className="block">
                <Button variante="ghost" tamanho="sm" icone={<CheckSquare size={13} />} className="w-full justify-start">
                  Checklist dos 10 Pontos
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* COLUNA 2+3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* Linha do tempo */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-surface border border-line rounded p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-green" />
                <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Estrutura dos Roteiros</p>
              </div>
              <ViralTimeline compacta={false} />
            </motion.div>

            {/* Projetos */}
            {projetos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <FolderKanban size={12} className="text-ink-3" />
                    <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Projetos Recentes</p>
                  </div>
                  <Link href="/projects" className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink-2 transition-colors">
                    Ver todos <ArrowRight size={10} />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {projetos.map((p, i) => (
                    <ProjectCard key={p.id as string} projeto={p} delay={i * 0.05} />
                  ))}
                </div>
              </div>
            )}

            {/* Roteiros recentes */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-ink-3" />
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Últimos Roteiros</p>
                </div>
                <Link href="/library" className="flex items-center gap-1 text-[11px] text-ink-3 hover:text-ink-2 transition-colors">
                  Biblioteca <ArrowRight size={10} />
                </Link>
              </div>

              {recentes.length > 0 ? (
                <div className="space-y-2.5">
                  {recentes.map((r, i) => (
                    <ScriptCard key={r.id} roteiro={r} delay={i * 0.04} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-surface border border-line border-dashed rounded p-10 text-center"
                >
                  <FileText size={32} className="text-ink-3 mx-auto mb-3" />
                  <p className="text-sm font-medium text-ink-2">Nenhum roteiro ainda</p>
                  <p className="text-xs text-ink-3 mt-1 mb-4">Crie um projeto e gere roteiros com a metodologia de 4 fases</p>
                  <Link href="/projects/new">
                    <Button variante="primary" tamanho="sm" icone={<Plus size={12} />}>Criar primeiro projeto</Button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Info: princípios + erros */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-surface border border-line rounded p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target size={12} className="text-green" />
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">5 Princípios Virais</p>
                </div>
                <div className="space-y-1.5">
                  {PRINCIPIOS.map((p) => (
                    <div key={p.num} className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-green shrink-0 mt-0.5">{p.num}</span>
                      <p className="text-[11px] text-ink-2 leading-snug">{p.texto}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-surface border border-line rounded p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={12} className="text-danger" />
                  <p className="text-[10px] font-mono text-ink-3 uppercase tracking-wider">Erros Comuns</p>
                </div>
                <div className="space-y-1.5">
                  {ERROS_RAPIDOS.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-danger shrink-0 mt-0.5">✗</span>
                      <p className="text-[11px] text-ink-2 leading-snug">{e}</p>
                    </div>
                  ))}
                  <Link href="/checklist" className="block mt-2">
                    <span className="text-[10px] text-ink-3 hover:text-ink-2 transition-colors">
                      Ver todos os 7 erros →
                    </span>
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  )
}
