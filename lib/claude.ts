import Anthropic from '@anthropic-ai/sdk'
import type { EstagioFunil, ChecklistItens } from '@/types'

const cliente = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODELO = 'claude-sonnet-4-6'

// System prompt com a metodologia completa do Hugo Petrakis
const SYSTEM_ROTEIRO = `Você é um especialista em roteiros virais de Reels para Instagram, treinado na metodologia "Reels que Vendem" do Hugo Petrakis.

METODOLOGIA OBRIGATÓRIA — 4 FASES:

FASE 1 — GANCHO (0-3s):
Use EXATAMENTE uma das três formas:
- Dado específico + dor: "90% dos produtores rurais estão perdendo dinheiro sem saber."
- Afirmação contraintuitiva: "Parar de usar ração foi o que fez meu rebanho crescer."
- Promessa concreta com prazo: "O método que usei pra reduzir 30% do custo em 60 dias."
REGRA ABSOLUTA: NUNCA comece com "Hoje eu vou falar sobre..." — isso mata o vídeo.
O gancho é um ATAQUE, não uma introdução.

FASE 2 — CONTEXTO E IDENTIFICAÇÃO (3-10s):
Exatamente 3 frases curtas que descrevem a dor. Fórmula: 3 frases, 3 facadas na dor.
Exemplo: "Você compra ração. O preço sobe. Você paga assim mesmo."
Não pule para a solução — sem sentir a dor, a pessoa não sente urgência.

FASE 3 — RESOLUÇÃO COM MÉTODO (10-35s):
O método DEVE ter nome próprio — um framework nomeado.
Não é "use um bom suplemento". É "use o Protocolo de Redução de Custo em 3 etapas".
OBRIGATÓRIO: inclua um RE-HOOK entre 18-22s — uma segunda informação chocante.
Não revele o desfecho antes da hora. Segure a curiosidade.

FASE 4 — CUSTO DA INAÇÃO (últimos 3-5s):
Use EXATAMENTE uma das três formas:
- Projeção de tempo perdido: "Daqui a 6 meses sua margem vai estar exatamente onde está hoje."
- Custo de oportunidade: "Cada mês sem isso é dinheiro que poderia ficar no seu bolso."
- Chamada implícita: "Agora você sabe. O que você vai fazer com isso depende de você."
NUNCA feche só com "gostou? segue o perfil" — isso é o fechamento mais fraco possível.

REGRAS DE OURO:
- Não enrola: cada segundo a mais é um usuário a menos
- Não volta atrás: se já disse, não repete
- Não mostra o final cedo: segura a curiosidade até o último momento
- Gere SEMPRE 3 variações de gancho diferentes para a mesma ideia

AVALIAÇÃO AUTOMÁTICA:
Ao final, avalie o roteiro nos 10 pontos do checklist e retorne true/false para cada um.

Responda APENAS com JSON válido, sem texto adicional.`

export interface RespostaRoteiro {
  title: string
  hook: string
  hook_alt1: string
  hook_alt2: string
  context: string
  method_name: string
  resolution: string
  rehook: string
  cost_of_inaction: string
  cta: string
  full_script: string
  checklist_score: number
  checklist_items: ChecklistItens
}

interface ParamsGerarRoteiro {
  funnel_stage: EstagioFunil
  product_name: string
  target_audience: string
  voice_tone: string
  product_description: string
  keywords: string[]
  tema_customizado?: string
  news_title?: string
  news_description?: string
}

const TOFU_INSTRUCOES = `Estágio: TOFU (Topo de Funil)
Objetivo: alcance massivo. O vídeo deve falar do NICHO, não do produto.
A pessoa ainda não sabe que precisa do produto. Fale da dor, do problema, do contexto do mercado.
Não mencione o produto pelo nome. Gere curiosidade sobre o problema.`

const MOFU_INSTRUCOES = `Estágio: MOFU (Meio de Funil)
Objetivo: conectar o tema/notícia ao produto de forma natural.
A pessoa já conhece o problema. Agora mostre como o produto é a solução.
Se houver notícia/tendência, use-a como gancho de contexto.
Mencione o produto sutilmente, sem CTA agressivo.`

const BOFU_INSTRUCOES = `Estágio: BOFU (Fundo de Funil)
Objetivo: conversão direta. A pessoa já conhece o produto.
CTA claro, direto. Argumento de urgência ou oferta específica.
Pode mencionar preço, bônus, prazo limitado, resultado específico.
Fase 4 deve ter CTA explícito e forte.`

export async function gerarRoteiro(params: ParamsGerarRoteiro): Promise<RespostaRoteiro> {
  const instrucoesFunil = {
    tofu: TOFU_INSTRUCOES,
    mofu: MOFU_INSTRUCOES,
    bofu: BOFU_INSTRUCOES,
  }[params.funnel_stage]

  const contextoNoticia = params.news_title
    ? `\n\nNOTÍCIA/TENDÊNCIA PARA USAR COMO CONTEXTO:\nTítulo: ${params.news_title}\nDescrição: ${params.news_description || ''}`
    : ''

  const temaCostumizado = params.tema_customizado
    ? `\n\nTEMA PERSONALIZADO DO USUÁRIO: ${params.tema_customizado}`
    : ''

  const prompt = `${instrucoesFunil}

DADOS DO PROJETO:
- Produto/Serviço: ${params.product_name}
- Público-alvo: ${params.target_audience}
- Tom de voz: ${params.voice_tone}
- Descrição: ${params.product_description}
- Palavras-chave: ${params.keywords.join(', ')}
${contextoNoticia}
${temaCostumizado}

Gere um roteiro COMPLETO seguindo as 4 fases da metodologia. Crie também 2 variações alternativas de gancho (hook_alt1 e hook_alt2) para o sistema de teste A/B.

No full_script, inclua timestamps no formato [0s], [3s], [10s], [18s], [22s], [35s] marcando cada fase.

Avalie o checklist dos 10 pontos e retorne o checklist_score (0-10) e checklist_items com true/false para cada item.

Responda SOMENTE com este JSON:
{
  "title": "título curto do roteiro",
  "hook": "gancho principal (Fase 1)",
  "hook_alt1": "variação A do gancho para teste A/B",
  "hook_alt2": "variação B do gancho para teste A/B",
  "context": "fase 2 — exatamente 3 frases de dor separadas por \\n",
  "method_name": "Nome Próprio do Método (ex: Protocolo XYZ de 3 Etapas)",
  "resolution": "fase 3 completa com o método nomeado",
  "rehook": "o re-hook entre 18-22s — segunda informação chocante",
  "cost_of_inaction": "fase 4 — custo da inação",
  "cta": "call to action final",
  "full_script": "roteiro completo com timestamps [0s] [3s] [10s] [18s] [22s] [35s]",
  "checklist_score": 8,
  "checklist_items": {
    "gancho_tem_dado_ou_promessa": true,
    "contexto_descreve_dor": true,
    "resolucao_tem_metodo_nomeado": true,
    "final_gera_custo_de_inacao": true,
    "testou_variacoes_de_gancho": true,
    "tem_rehook_no_meio": true,
    "escondeu_resultado_ate_o_final": true,
    "nao_voltou_pra_info_anterior": true,
    "tem_assinatura_visual": false,
    "assistiria_ate_o_fim": true
  }
}`

  const resposta = await cliente.messages.create({
    model: MODELO,
    max_tokens: 4096,
    system: SYSTEM_ROTEIRO,
    messages: [{ role: 'user', content: prompt }],
  })

  const textoResposta = resposta.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  // Extrai JSON da resposta — remove possíveis markdown code blocks
  const jsonLimpo = textoResposta
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  try {
    return JSON.parse(jsonLimpo) as RespostaRoteiro
  } catch {
    throw new Error(`Claude retornou JSON inválido: ${jsonLimpo.slice(0, 200)}`)
  }
}
