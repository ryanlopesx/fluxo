'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, BookOpen, Scissors,
  CheckSquare, Menu, X,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/',          icone: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects',  icone: FolderKanban,    label: 'Projetos' },
  { href: '/library',   icone: BookOpen,         label: 'Biblioteca' },
  { href: '/cuts',      icone: Scissors,         label: 'Cortador' },
  { href: '/checklist', icone: CheckSquare,      label: 'Checklist' },
]

function NavItem({ item, ativo, onClick }: { item: typeof navItems[0]; ativo: boolean; onClick?: () => void }) {
  return (
    <Link href={item.href} onClick={onClick}>
      <div className={clsx(
        'flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors duration-100',
        ativo
          ? 'bg-raised text-ink'
          : 'text-ink-3 hover:text-ink-2 hover:bg-raised/60'
      )}>
        <item.icone size={14} className={ativo ? 'text-green' : 'text-ink-3'} />
        <span className={clsx('font-medium', ativo ? 'text-ink' : '')}>{item.label}</span>
        {ativo && <div className="ml-auto w-1 h-1 rounded-full bg-green" />}
      </div>
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-line">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-bg font-mono">F</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-ink tracking-tight">FLUXO</span>
            <span className="text-[9px] font-mono text-ink-3 border border-line px-1 py-px rounded">v1.0</span>
          </div>
        </div>
        <p className="text-[10px] text-ink-3 mt-1.5 ml-8">Roteiros que vendem</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-thin px-2 py-3 space-y-px">
        {navItems.map((item) => {
          const ativo = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <NavItem key={item.href} item={item} ativo={ativo} onClick={onClose} />
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-line">
        <p className="text-[9px] font-mono text-ink-3 leading-none">Baseado em</p>
        <p className="text-[10px] text-ink-2 font-medium mt-0.5">Hugo Petrakis</p>
        <p className="text-[9px] font-mono text-ink-3 mt-1">Reels que Vendem</p>
      </div>
    </div>
  )
}

export default function Navigation() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-line bg-surface min-h-screen sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-b border-line">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-green flex items-center justify-center">
              <span className="text-[9px] font-bold text-bg font-mono">F</span>
            </div>
            <span className="text-sm font-semibold text-ink tracking-tight">FLUXO</span>
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
