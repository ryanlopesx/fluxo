'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, BookOpen, Scissors,
  CheckSquare, Menu, X, Zap,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/',          icone: LayoutDashboard, label: 'Dashboard',   desc: 'Visão geral' },
  { href: '/projects',  icone: FolderKanban,    label: 'Projetos',    desc: 'Seus produtos' },
  { href: '/library',   icone: BookOpen,         label: 'Biblioteca',  desc: 'Todos roteiros' },
  { href: '/cuts',      icone: Scissors,         label: 'Cortador',    desc: 'Plano de edição' },
  { href: '/checklist', icone: CheckSquare,      label: 'Checklist',   desc: '10 pontos' },
]

function NavItem({ item, ativo, onClick }: { item: typeof navItems[0]; ativo: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <div className={clsx(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150',
        ativo
          ? 'bg-raised text-ink'
          : 'text-ink-3 hover:text-ink-2 hover:bg-raised/50'
      )}>
        {ativo && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-green rounded-full"
          />
        )}
        <item.icone
          size={15}
          className={clsx('shrink-0 transition-colors', ativo ? 'text-green' : 'text-ink-3 group-hover:text-ink-2')}
        />
        <div className="flex-1 min-w-0">
          <p className={clsx('text-[13px] font-medium leading-none', ativo ? 'text-ink' : '')}>{item.label}</p>
          <p className="text-[10px] text-ink-3 mt-0.5 leading-none">{item.desc}</p>
        </div>
      </div>
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Logo */}
      <div className="px-4 pt-5 pb-5 border-b border-line">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-md bg-green flex items-center justify-center shrink-0">
            <Zap size={13} className="text-bg" fill="currentColor" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-ink tracking-tight leading-none">FLUXO</p>
            <p className="text-[10px] text-ink-3 font-mono leading-none mt-0.5">v1.0</p>
          </div>
        </div>
        <p className="text-[11px] text-ink-3 mt-2 leading-relaxed pl-0.5">
          Roteiros virais com IA
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-thin px-2 py-3 space-y-0.5">
        <p className="text-[9px] font-mono text-ink-3 uppercase tracking-widest px-3 py-1.5">Menu</p>
        {navItems.map((item) => {
          const ativo = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <NavItem key={item.href} item={item} ativo={ativo} onClick={onClose} />
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-line">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          <p className="text-[10px] text-ink-3">Sistema ativo</p>
        </div>
        <p className="text-[10px] font-medium text-ink-2">Hugo Petrakis</p>
        <p className="text-[9px] text-ink-3 font-mono">Reels que Vendem</p>
      </div>
    </div>
  )
}

export default function Navigation() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-line bg-surface min-h-screen sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-b border-line">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green flex items-center justify-center">
              <Zap size={11} className="text-bg" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-ink tracking-tight">FLUXO</span>
          </div>
          <button
            onClick={() => setAberto(!aberto)}
            className="p-1.5 rounded text-ink-3 hover:text-ink-2 hover:bg-raised transition-colors"
          >
            {aberto ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {aberto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAberto(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 220 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-surface border-r border-line overflow-hidden"
            >
              <SidebarContent onClose={() => setAberto(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile spacer */}
      <div className="lg:hidden h-[49px] shrink-0" />
    </>
  )
}
