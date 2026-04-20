'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Check, AlertCircle } from 'lucide-react'
import type { ChecklistItens } from '@/types'
import { CHECKLIST_10_PONTOS, SETE_ERROS } from '@/types'
import PageTransition from '@/components/PageTransition'
import ErrorsPanel from '@/components/ErrorsPanel'

const DICAS_CORRECAO: Record<keyof ChecklistItens, string> = {
  gancho_tem_dado_ou_promessa: 'Use um dado específico (%), uma afirmação contraintuitiva ou uma promessa com prazo. Nunca comece com "hoje eu vou falar sobre".',
  contexto_descreve_dor: 'Escreva exatamente 3 frases curtas e diretas que descrevem a dor do público. Fórmula: dor → dor → dor.',
  resolucao_tem_metodo_nomeado: 'Dê um nome próprio ao método. Ex: "Protocolo de Redução de Custo em 3 Etapas". Nome gera autoridade.',
  final_gera_custo_de_inacao: 'Feche com projeção de perda ("daqui a 6 meses..."), custo de oportunidade ou chamada implícita. Nunca só "gostou? segue."',
  testou_variacoes_de_gancho: 'Grave 3 versões do mesmo gancho. Use a função Reels Teste do Instagram. Publique o vencedor após 48h.',
  tem_rehook_no_meio: 'Entre 18-22s, insira uma segunda informação chocante ou dado inesperado para reter quem está cansando.',
  escondeu_resultado_ate_o_final: 'Nunca revele o resultado ou a conclusão antes dos últimos 5s. A curiosidade é o que mantém a atenção.',
  nao_voltou_pra_info_anterior: 'Revise: se você mencionou algo antes, não mencione de novo. Cada segundo é novo conteúdo.',
  tem_assinatura_visual: 'Defina: uma peça de roupa padrão, um fundo fixo, um ângulo de câmera, e uma frase/gesto recorrente.',
  assistiria_ate_o_fim: 'Leia o roteiro como se fosse um estranho. Em algum ponto você deslizaria? Reescreva aquele trecho.',
}

const EXEMPLOS: Record<keyof ChecklistItens, string> = {
  gancho_tem_dado_ou_promessa: '"90% dos produtores rurais estão perdendo dinheiro sem saber." — dado + dor em 3s.',
  contexto_descreve_dor: '"Você compra ração. O preço sobe. Você paga assim mesmo." — 3 frases, 3 facadas.',
  resolucao_tem_metodo_nomeado: '"O Protocolo de Redução de Custo em 3 Etapas" — nome próprio = autoridade.',
  final_gera_custo_de_inacao: '"Daqui a 6 meses sua margem vai estar exatamente onde está hoje." — projeção de perda.',
  testou_variacoes_de_gancho: 'Gancho A: dado. Gancho B: contradição. Gancho C: promessa. Poste os 3 como Reels Teste.',
  tem_rehook_no_meio: '"Mas o que ninguém te conta é que..." — surpresa no meio que choca quem estava perdendo atenção.',
  escondeu_resultado_ate_o_final: 'Não mostre o print, o resultado, o número — guarde para o último segundo.',
  nao_voltou_pra_info_anterior: 'Não use "como eu disse antes" ou "voltando ao que falei" — cada frase é nova.',
  tem_assinatura_visual: 'Boné preto, parede de tijolos, câmera na altura dos olhos, frase "anota aí:".',
  assistiria_ate_o_fim: 'Mostre o roteiro pra alguém que não conhece seu produto. Eles assistiram até o fim?',
}

export default function ChecklistPage() {
  const estadoInicial = Object.fromEntries(
    CHECKLIST_10_PONTOS.map(p => [p.id, false])
  ) as unknown as ChecklistItens

  const [items, setItems] = useState<ChecklistItens>(estadoInicial)
  const [expandido, setExpandido] = useState<string | null>(null)

  const score = Object.values(items).filter(Boolean).length
  const completo = score === 10
  const percentual = (score / 10) * 100
  const corBarra = score >= 8 ? '#34D399' : score >= 5 ? '#FBBF24' : '#F87171'

  const toggle = (id: keyof ChecklistItens) => {
    setItems(i => ({ ...i, [id]: !i[id] }))
  }

  const resetar = () => {
    setItems(estadoInicial)
    setExpandido(null)
  }

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <CheckSquare size={22} className="text-green" />
            Os 10 Pontos antes de Postar
          </h1>
          <p className="text-sm text-secondary mt-1">
            Metodologia Reels que Vendem — Hugo Petrakis. Não poste sem verificar cada ponto.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Checklist */}
          <div className="lg:col-span-2 space-y-4">
            {/* Score */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary">{score}/10 pontos verificados</span>
                <button onClick={resetar} className="text-xs text-muted hover:text-secondary transition-colors">Resetar</button>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${percentual}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ backgroundColor: corBarra }}
                  className="h-full rounded-full"
                />
              </div>

              <AnimatePresence>
                {completo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/40"
                  >
                    <div className="w-8 h-8 rounded-full bg-bofu/20 flex items-center justify-center">
                      <Check size={16} className="text-bofu" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bofu">Roteiro aprovado nos 10 pontos!</p>
                      <p className="text-xs text-muted">Agora sim você pode postar com confiança.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Itens */}
            <div className="space-y-2">
              {CHECKLIST_10_PONTOS.map((ponto, i) => {
                const aprovado = items[ponto.id as keyof ChecklistItens]
                const aberto = expandido === ponto.id

                return (
                  <motion.div
                    key={ponto.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`rounded-xl border overflow-hidden transition-colors duration-150 ${
                      aprovado ? 'border-emerald-800/40 bg-emerald-950/10' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-start gap-3 p-3">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        animate={aprovado ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        onClick={() => toggle(ponto.id as keyof ChecklistItens)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          aprovado ? 'bg-bofu/20 border-bofu' : 'border-border hover:border-secondary'
                        }`}
                      >
                        <AnimatePresence>
                          {aprovado && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check size={12} className="text-bofu" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${aprovado ? 'text-secondary line-through decoration-muted' : 'text-primary'}`}>
                          <span className="font-mono text-xs text-muted mr-2">{String(i + 1).padStart(2, '0')}</span>
                          {ponto.texto}
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandido(aberto ? null : ponto.id)}
                        className="text-xs text-muted hover:text-secondary transition-colors shrink-0"
                      >
                        {aberto ? '▲' : '▼'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {aberto && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-border/40 pt-3 space-y-3">
                            {!aprovado && (
                              <div className="flex gap-2">
                                <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-secondary leading-relaxed">
                                  {DICAS_CORRECAO[ponto.id as keyof ChecklistItens]}
                                </p>
                              </div>
                            )}
                            <div className="p-2.5 rounded-lg bg-elevated/50 border border-border/50">
                              <p className="text-[10px] font-mono text-muted mb-1">Exemplo prático</p>
                              <p className="text-xs text-secondary leading-relaxed italic">
                                {EXEMPLOS[ponto.id as keyof ChecklistItens]}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Os 7 Erros */}
          <div className="bg-surface border border-border rounded-xl p-4 h-fit">
            <ErrorsPanel />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
