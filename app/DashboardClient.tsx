'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FolderKanban, FileText, ThumbsUp, BookCheck,
  Scissors, CheckSquare, ArrowRight, Plus, TrendingUp,
  BarChart3, Target, AlertTriangle, Zap,
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

function SectionHeader({ icone, titulo, href, linkTexto }: { icone: React.ReactNode; titulo: string; href?: string; linkTexto?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-ink-3">{icone}</span>
        <h2 className="text-sm font-semibold text-ink-2">{titulo}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink-2 transition-colors">
          {linkTexto} <ArrowRight size={11} />
        </Link>
      )}
    </div>
  )
}

export default function DashboardClient({ stats, recentes, projetos }: Props) {
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const scoresMedio = recentes.length > 0
    ? Math.round(recentes.reduce((s, r) => s + (r.checklist_score || 0), 0) / recentes.length)
    : 0
  const taxaAprovacao = stats.total_roteiros > 0
    ? Math.round((stats.total_aprovados / stats.total_roteiros) * 100)
    : 0

  return (
    <PageTransition>
      <div className="p-5 lg:p-8 max-w-7xl space-y-8">

        {/* ── HEADER ─────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4 flex-wrap pb-6 border-b border-line">
          <div>
            <p className="text-xs font-mono text-ink-3 mb-1">{saudacao}</p>
            <h1 className="text-3xl font-bold text-ink tracking-tight">Dashboard</h1>
            <p className="text-sm text-ink-3 mt-1.5">
              {stats.total_roteiros > 0
                ? `${stats.total_roteiros} roteiros gerados · score médio ${scoresMedio}/10 · ${taxaAprovacao}% aprovados`
                : 'Crie seu primeiro projeto e comece a gerar roteiros com IA'}
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

        {/* ── STATS ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard titulo="Projetos"  valor={stats.total_projetos}  icone={<FolderKanban size={15} />} cor="#1DB954" delay={0}    descricao="Perfis ativos" />
          <StatsCard titulo="Roteiros"  valor={stats.total_roteiros}  icone={<FileText size={15} />}     cor="#4B8FE8" delay={0.05}  descricao="Gerados com IA" />
          <StatsCard titulo="Aprovados" valor={stats.total_aprovados} icone={<ThumbsUp size={15} />}     cor="#1DB954" delay={0.1}   descricao="Prontos para postar" />
          <StatsCard titulo="Publicados" valor={stats.total_usados}   icone={<BookCheck size={15} />}    cor="#D98C00" delay={0.15}  descricao="Já no ar" />
        </div>

        {/* ── GRID PRINCIPAL ─────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── COLUNA LATERAL ── */}
          <div className="space-y-5">

            {/* Funil */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-surface border border-line rounded-lg p-5"
            >
              <SectionHeader icone={<BarChart3 size={14} />} titulo="Distribuição do Funil" />
              <FunnelVisual
                tofu={stats.por_estagio.tofu}
                mofu={stats.por_estagio.mofu}
                bofu={stats.por_estagio.bofu}
                total={stats.total_roteiros}
              />
              {stats.total_roteiros > 0 && (
                <div className="mt-4 pt-4 border-t border-line grid grid-cols-3 gap-2">
                  {[
                    { label: 'TOFU', n: stats.por_estagio.tofu, cor: '#4B8FE8' },
                    { label: 'MOFU', n: stats.por_estagio.mofu, cor: '#D98C00' },
                    { label: 'BOFU', n: stats.por_estagio.bofu, cor: '#1DB954' },
                  ].map(e => (
                    <div key={e.label} className="text-center">
                      <p className="text-xl font-bold tabular-nums" style={{ color: e.cor }}>{e.n}</p>
                      <p className="text-[10px] font-mono text-ink-3 mt-0.5">{e.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Score médio */}
            {recentes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface border border-line rounded-lg p-5"
              >
                <SectionHeader icone={<Target size={14} />} titulo="Score Médio" />
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-5xl font-bold text-ink tabular-nums tracking-tight">{scoresMedio}</span>
                  <span className="text-lg text-ink-3">/10</span>
                </div>
                <div className="h-1.5 bg-raised rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(scoresMedio / 10) * 100}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: scoresMedio >= 8 ? '#1DB954' : scoresMedio >= 5 ? '#D98C00' : '#E5534B' }}
                  />
                </div>
                <p className="text-xs text-ink-3">
                  {scoresMedio >= 8 ? '✓ Alta qualidade viral' : scoresMedio >= 5 ? '→ Bom — melhore o re-hook' : '! Revise os ganchos'}
                </p>
              </motion.div>
            )}

            {/* Acesso rápido */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-surface border border-line rounded-lg p-5"
            >
              <SectionHeader icone={<Zap size={14} />} titulo="Acesso Rápido" />
              <div className="space-y-2">
                <Link href="/projects/new" className="block">
                  <Button variante="primary" tamanho="sm" icone={<Plus size={13} />} className="w-full justify-start">
                    Novo Projeto
                  </Button>
                </Link>
                <Link href="/cuts" className="block">
                  <Button variante="secondary" tamanho="sm" icone={<Scissors size={13} />} className="w-full justify-start">
                    Plano de Cortes
                  </Button>
                </Link>
                <Link href="/checklist" className="block">
                  <Button variante="ghost" tamanho="sm" icone={<CheckSquare size={13} />} className="w-full justify-start">
                    Checklist dos 10 Pontos
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* ── COLUNA PRINCIPAL ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Estrutura viral */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface border border-line rounded-lg p-5"
            >
              <SectionHeader icone={<TrendingUp size={14} />} titulo="Estrutura dos Roteiros" />
              <ViralTimeline compacta={false} />
            </motion.div>

            {/* Projetos recentes */}
            {projetos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionHeader
                  icone={<FolderKanban size={14} />}
                  titulo="Projetos Recentes"
                  href="/projects"
                  linkTexto="Ver todos"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  {projetos.map((p, i) => (
                    <ProjectCard key={p.id as string} projeto={p} delay={i * 0.05} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Últimos roteiros */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <SectionHeader
                icone={<FileText size={14} />}
                titulo="Últimos Roteiros"
                href="/library"
                linkTexto="Biblioteca"
              />

              {recentes.length > 0 ? (
                <div className="space-y-2.5">
                  {recentes.map((r, i) => (
                    <ScriptCard key={r.id} roteiro={r} delay={i * 0.04} />
                  ))}
                </div>
              ) : (
                <div className="bg-surface border border-line border-dashed rounded-lg p-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-raised border border-line flex items-center justify-center mx-auto mb-4">
                    <FileText size={20} className="text-ink-3" />
                  </div>
                  <p className="text-sm font-semibold text-ink-2 mb-1">Nenhum roteiro ainda</p>
                  <p className="text-xs text-ink-3 mb-5 max-w-xs mx-auto">
                    Crie um projeto e gere roteiros seguindo a metodologia de 4 fases
                  </p>
                  <Link href="/projects/new">
                    <Button variante="primary" tamanho="sm" icone={<Plus size={12} />}>
                      Criar primeiro projeto
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Princípios + Erros */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-surface border border-line rounded-lg p-5"
              >
                <SectionHeader icone={<Target size={14} />} titulo="5 Princípios Virais" />
                <div className="space-y-3">
                  {PRINCIPIOS.map((p) => (
                    <div key={p.num} className="flex items-start gap-3">
                      <span className="text-[11px] font-mono text-green font-semibold shrink-0 mt-px">{p.num}</span>
                      <p className="text-xs text-ink-2 leading-relaxed">{p.texto}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-surface border border-line rounded-lg p-5"
              >
                <SectionHeader icone={<AlertTriangle size={14} />} titulo="Erros Comuns" />
                <div className="space-y-3">
                  {ERROS_RAPIDOS.map((e, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[11px] font-mono text-danger font-semibold shrink-0 mt-px">✗</span>
                      <p className="text-xs text-ink-2 leading-relaxed">{e}</p>
                    </div>
                  ))}
                  <Link href="/checklist" className="block mt-1">
                    <span className="text-xs text-ink-3 hover:text-ink-2 transition-colors">
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
