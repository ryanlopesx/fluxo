import Anthropic from '@anthropic-ai/sdk'
import type { Corte } from '@/types'

const cliente = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODELO = 'claude-sonnet-4-6'

const SYSTEM_CORTES = `Você é um editor de vídeo profissional especializado em Reels do Instagram, treinado na metodologia "Reels que Vendem" do Hugo Petrakis.

Você cria planos de corte detalhados que respeitam OBRIGATORIAMENTE a linha do tempo viral:

LINHA DO TEMPO VIRAL OBRIGATÓRIA:
- 0-3s → FASE 1 (Gancho): Corte AGRESSIVO, zoom, impacto visual imediato. Câmera instável proposital.
- 3-8s → FASE 2 (Contexto): Câmera mais estável, aproximação gradual no rosto/produto.
- 8-18s → FASE 3a (Resolução): Ritmo médio, espaço para o método. B-roll intercalado.
- 18-22s → FASE 3b (RE-HOOK): Corte SURPRESA, mudança de ângulo, elemento visual que choca. OBRIGATÓRIO.
- 22-35s → FASE 3c (Condução): Build up, câmera conduzindo pro desfecho, ritmo crescente.
- 35-40s → FASE 4 (Custo da Inação): Corte final impactante, hold longo, resolução.

TIPOS DE CORTE DISPONÍVEIS:
- jump_cut: corte direto sem transição
- zoom_in / zoom_out: zoom durante o corte
- cut_on_beat: corte sincronizado ao beat da música
- j_cut: áudio do próximo clip começa antes
- l_cut: áudio do clip atual continua no próximo
- smash_cut: corte brusco para criar impacto
- match_cut: corte baseado em similaridade visual

MOVIMENTOS DE CÂMERA:
- static, handheld (instável), push_in, pull_out, pan_left, pan_right, tilt_up, tilt_down

Responda APENAS com JSON válido, sem texto adicional, sem markdown.`

export interface RespostaCuts {
  total_duration: number
  style: string
  rhythm: string
  instructions_general: string
  cuts: Corte[]
  broll_suggestions: string[]
  music_mood: string
  caption_style: string
  export_settings: Record<string, string>
}

interface ParamsGerarCuts {
  user_prompt: string
  video_duration: number
  style: string
  contexto_roteiro?: string
}

export async function gerarPlanoCuts(params: ParamsGerarCuts): Promise<RespostaCuts> {
  const contexto = params.contexto_roteiro
    ? `\n\nROTEIRO VINCULADO:\n${params.contexto_roteiro}`
    : ''

  const prompt = `PEDIDO DO USUÁRIO: "${params.user_prompt}"
Duração total: ${params.video_duration} segundos
Estilo: ${params.style}
${contexto}

Crie um plano de cortes detalhado respeitando a linha do tempo viral da metodologia (0-3s gancho, 3-8s contexto, 8-18s resolução, 18-22s RE-HOOK obrigatório, 22-35s condução, 35-40s desfecho).

O RE-HOOK entre 18-22s DEVE ser marcado com "is_rehook": true e ter um corte visualmente impactante.

Para cada corte, defina: início, fim, fase (1-4), tipo, descrição da ação, câmera, movimento, texto em tela (se houver), nota de áudio, transição para o próximo.

Ajuste os tempos se a duração for menor que 40s (mantenha as proporções).

Responda com este JSON:
{
  "total_duration": ${params.video_duration},
  "style": "${params.style}",
  "rhythm": "descrição do ritmo geral",
  "instructions_general": "instruções gerais de edição em 2-3 frases",
  "cuts": [
    {
      "index": 1,
      "start": 0,
      "end": 3,
      "label": "Gancho",
      "phase": 1,
      "type": "smash_cut",
      "description": "descrição da ação do clip",
      "camera": "câmera principal ou selfie",
      "movement": "handheld",
      "text_overlay": "texto animado ou null",
      "audio_note": "nota de áudio ou null",
      "transition_to_next": "tipo de transição",
      "is_rehook": false
    }
  ],
  "broll_suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "music_mood": "mood da música (ex: energético, dramático, motivacional)",
  "caption_style": "estilo das legendas (ex: subtítulos grandes em negrito, sem legenda, estilo karaoke)",
  "export_settings": {
    "resolucao": "1080x1920",
    "fps": "30",
    "formato": "MP4 H.264",
    "aspect_ratio": "9:16"
  }
}`

  const resposta = await cliente.messages.create({
    model: MODELO,
    max_tokens: 4096,
    system: SYSTEM_CORTES,
    messages: [{ role: 'user', content: prompt }],
  })

  const textoResposta = resposta.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  const jsonLimpo = textoResposta
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  try {
    return JSON.parse(jsonLimpo) as RespostaCuts
  } catch {
    throw new Error(`Claude retornou JSON inválido no plano de cortes: ${jsonLimpo.slice(0, 200)}`)
  }
}
