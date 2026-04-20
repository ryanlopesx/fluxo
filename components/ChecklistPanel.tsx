'use client'

import { motion } from 'framer-motion'
import { Check, X, AlertCircle } from 'lucide-react'
import type { ChecklistItens } from '@/types'
import { CHECKLIST_10_PONTOS } from '@/types'

const DICAS_CORRECAO: Record<keyof ChecklistItens, string> = {
  gancho_tem_dado_ou_promessa: 'Reescreva o gancho usando um dado específico (%), uma afirmação contraintuitiva ou uma promessa com prazo concreto.',
  contexto_descreve_dor: 'Escreva exatamente 3 frases curtas descrevendo a dor do público antes de falar da solução.',
  resolucao_tem_metodo_nomeado: 'Dê um nome próprio ao método — "Protocolo de X em 3 Passos", "Sistema Y". Nomes geram autoridade.',
  final_gera_custo_de_inacao: 'Troque o fechamento por uma projeção de perda ("daqui a 6 meses..."), custo de oportunidade ou chamada implícita.',
  testou_variacoes_de_gancho: 'Use as 3 variações de gancho geradas. Grave o mesmo meio/final com os 3 ganchos e use a função Reels Teste.',
  tem_rehook_no_meio: 'Adicione uma segunda informação chocante ou dado inesperado entre 18-22s para reter quem está perdendo atenção.',
  escondeu_resultado_ate_o_final: 'Não revele o resultado ou conclusão antes dos últimos 5 segundos. A curiosidade é o que segura a atenção.',
  nao_voltou_pra_info_anterior: 'Revise o roteiro: se você mencionou algo antes, não mencione de novo. Cada segundo é novo conteúdo.',
  tem_assinatura_visual: 'Defina: uma peça de roupa padrão, um fundo fixo, um ângulo de câmera específico, e uma frase/gesto recorrente.',
  assistiria_ate_o_fim: 'Releia como se fosse um desconhecido. Se em algum ponto você deslizaria, reescreva aquele trecho.',
}

interface ChecklistPanelProps {
  items: ChecklistItens
  score: number
  interativo?: boolean
  onChange?: (items: ChecklistItens) => void
}

export default function ChecklistPanel({ items, score, interativo = false, onChange }: ChecklistPanelProps) {
  const percentual = Math.round((score / 10) * 100)
  const corBarra = score >= 8 ? '#34D399' : score >= 5 ? '#FBBF24' : '#F87171'

  const toggleItem = (id: keyof ChecklistItens) => {
    if (!interativo || !onChange) return
    onChange({ ...items, [id]: !items[id] })
  }

  return (
    <div className="space-y-3">
      {/* Score */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-muted uppercase tracking-wider">Checklist dos 10 Pontos</span>
        <span className="text-sm font-mono font-medium" style={{ color: corBarra }}>{score}/10</span>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentual}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          style={{ backgroundColor: corBarra }}
          className="h-full rounded-full"
        />
      </div>

      {/* Itens */}
      <div className="space-y-1.5">
        {CHECKLIST_10_PONTOS.map((ponto, i) => {
          const aprovado = items[ponto.id as keyof ChecklistItens]
          const dica = !aprovado ? DICAS_CORRECAO[ponto.id as keyof ChecklistItens] : null

          return (
            <motion.div
              key={ponto.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <motion.div
                whileTap={interativo ? { scale: 0.98 } : undefined}
                onClick={() => toggleItem(ponto.id as keyof ChecklistItens)}
                animate={aprovado ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors duration-150 ${
                  aprovado
                    ? 'bg-emerald-950/20 border-emerald-800/30'
                    : 'bg-red-950/10 border-red-900/20'
                } ${interativo ? 'cursor-pointer hover:border-opacity-60' : ''}`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  aprovado ? 'bg-bofu/20 text-bofu' : 'bg-red-900/20 text-red-400'
                }`}>
                  {aprovado ? <Check size={10} /> : <X size={10} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-snug ${aprovado ? 'text-secondary' : 'text-secondary/80'}`}>
                    <span className="font-mono text-muted mr-1">{String(i + 1).padStart(2, '0')}</span>
                    {ponto.texto}
                  </p>
                  {dica && (
                    <div className="flex gap-1.5 mt-1.5">
                      <AlertCircle size={10} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-400/80 leading-relaxed">{dica}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
