'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FolderKanban, Plus, Search } from 'lucide-react'
import type { Projeto } from '@/types'
import PageTransition from '@/components/PageTransition'
import ProjectCard from '@/components/ProjectCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<(Projeto & { total_roteiros: number })[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(j => { setProjetos(j.data || []); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [])

  const filtrados = projetos.filter(p =>
    p.name.toLowerCase().includes(busca.toLowerCase()) ||
    p.product_name.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary">Projetos</h1>
            <p className="text-sm text-secondary mt-1">{projetos.length} projeto{projetos.length !== 1 ? 's' : ''} cadastrado{projetos.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/projects/new">
            <Button variante="primary" icone={<Plus size={14} />}>Novo Projeto</Button>
          </Link>
        </div>

        {/* Busca */}
        {projetos.length > 0 && (
          <Input
            placeholder="Buscar projeto ou produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            icone={<Search size={14} />}
            className="max-w-sm"
          />
        )}

        {/* Lista */}
        {carregando ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtrados.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((p, i) => (
              <ProjectCard key={p.id as string} projeto={p} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <FolderKanban size={48} className="text-muted mb-4" />
            <p className="text-base font-medium text-secondary">
              {busca ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
            </p>
            <p className="text-sm text-muted mt-1 mb-6">
              {busca ? 'Tente outro termo de busca' : 'Crie seu primeiro projeto para começar a gerar roteiros'}
            </p>
            {!busca && (
              <Link href="/projects/new">
                <Button variante="primary" icone={<Plus size={14} />}>Criar primeiro projeto</Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
