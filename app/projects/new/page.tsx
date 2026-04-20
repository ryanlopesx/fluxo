'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, X, ArrowLeft, Check } from 'lucide-react'
import PageTransition from '@/components/PageTransition'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

const CORES_PROJETO = [
  '#6366F1', '#60A5FA', '#34D399', '#FBBF24',
  '#F87171', '#A78BFA', '#FB923C', '#E879F9',
]

const TONS_VOZ = ['educativo', 'direto e cru', 'inspirador', 'técnico', 'descontraído', 'urgente']

export default function NovoProjeto() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    name: '',
    product_name: '',
    target_audience: '',
    voice_tone: 'educativo',
    product_description: '',
    color: '#6366F1',
    keywords: [] as string[],
    news_categories: [] as string[],
  })

  const [novaKeyword, setNovaKeyword] = useState('')
  const [novaCategoria, setNovaCategoria] = useState('')

  const atualizar = (campo: string, valor: unknown) => setForm(f => ({ ...f, [campo]: valor }))

  const adicionarKeyword = () => {
    if (novaKeyword.trim() && !form.keywords.includes(novaKeyword.trim())) {
      atualizar('keywords', [...form.keywords, novaKeyword.trim()])
      setNovaKeyword('')
    }
  }

  const adicionarCategoria = () => {
    if (novaCategoria.trim() && !form.news_categories.includes(novaCategoria.trim())) {
      atualizar('news_categories', [...form.news_categories, novaCategoria.trim()])
      setNovaCategoria('')
    }
  }

  const salvar = async () => {
    if (!form.name.trim() || !form.product_name.trim() || !form.target_audience.trim()) {
      setErro('Preencha: nome do projeto, produto e público-alvo.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      const resp = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error)
      router.push(`/projects/${json.data.id}`)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
      setSalvando(false)
    }
  }

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted hover:text-secondary transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-primary">Novo Projeto</h1>
            <p className="text-sm text-secondary mt-0.5">Configure o perfil do projeto para roteiros mais precisos</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Informações básicas */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-primary">Informações Básicas</h2>
            <Input
              label="Nome do Projeto *"
              placeholder="Ex: Igor da Moringa, Meu Canal Agro"
              value={form.name}
              onChange={e => atualizar('name', e.target.value)}
            />
            <Input
              label="Produto / Serviço *"
              placeholder="Ex: Moringa em pó para bovinos"
              value={form.product_name}
              onChange={e => atualizar('product_name', e.target.value)}
            />
            <Input
              label="Público-alvo *"
              placeholder="Ex: Produtores rurais do interior com rebanho bovino"
              value={form.target_audience}
              onChange={e => atualizar('target_audience', e.target.value)}
            />
            <Textarea
              label="Descrição do Produto"
              placeholder="O que o produto faz, resultados esperados, diferenciais..."
              value={form.product_description}
              onChange={e => atualizar('product_description', e.target.value)}
              rows={3}
              className="h-20"
            />
          </div>

          {/* Tom de voz */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-primary">Tom de Voz</h2>
            <div className="flex flex-wrap gap-2">
              {TONS_VOZ.map(tom => (
                <button
                  key={tom}
                  onClick={() => atualizar('voice_tone', tom)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-150 ${
                    form.voice_tone === tom
                      ? 'bg-green/10 border-green/30 text-green'
                      : 'bg-elevated border-border text-secondary hover:text-primary'
                  }`}
                >
                  {tom}
                </button>
              ))}
            </div>
          </div>

          {/* Cor do projeto */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-primary">Cor do Projeto</h2>
            <div className="flex gap-3 flex-wrap">
              {CORES_PROJETO.map(cor => (
                <button
                  key={cor}
                  onClick={() => atualizar('color', cor)}
                  style={{ backgroundColor: cor }}
                  className="w-8 h-8 rounded-lg transition-transform hover:scale-110 relative"
                >
                  {form.color === cor && (
                    <Check size={14} className="text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-primary">Palavras-chave do Nicho</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: ração, suplemento, rebanho"
                value={novaKeyword}
                onChange={e => setNovaKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionarKeyword()}
                className="flex-1"
              />
              <Button variante="secondary" tamanho="md" icone={<Plus size={14} />} onClick={adicionarKeyword}>
                Adicionar
              </Button>
            </div>
            {form.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.keywords.map(kw => (
                  <motion.span
                    key={kw}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-elevated border border-border text-sm text-secondary"
                  >
                    {kw}
                    <button onClick={() => atualizar('keywords', form.keywords.filter(k => k !== kw))} className="text-muted hover:text-red-400 transition-colors">
                      <X size={11} />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Categorias de notícias */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-primary">Categorias de Notícias</h2>
            <p className="text-xs text-muted">Temas para buscar notícias relevantes para os roteiros MOFU</p>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: agronegócio, nutrição animal"
                value={novaCategoria}
                onChange={e => setNovaCategoria(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionarCategoria()}
                className="flex-1"
              />
              <Button variante="secondary" tamanho="md" icone={<Plus size={14} />} onClick={adicionarCategoria}>
                Adicionar
              </Button>
            </div>
            {form.news_categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.news_categories.map(cat => (
                  <motion.span
                    key={cat}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/20 border border-amber-800/30 text-sm text-mofu"
                  >
                    {cat}
                    <button onClick={() => atualizar('news_categories', form.news_categories.filter(c => c !== cat))} className="text-muted hover:text-red-400 transition-colors">
                      <X size={11} />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Erro */}
          {erro && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 bg-red-950/20 border border-red-800/30 rounded-lg px-3 py-2"
            >
              {erro}
            </motion.p>
          )}

          {/* Salvar */}
          <div className="flex gap-3">
            <Button variante="ghost" tamanho="lg" onClick={() => router.back()}>Cancelar</Button>
            <Button variante="primary" tamanho="lg" carregando={salvando} onClick={salvar} className="flex-1">
              Criar Projeto
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
