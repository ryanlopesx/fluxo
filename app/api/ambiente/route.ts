export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPT = `Você é um especialista em produção de vídeos para Reels e conteúdo vertical para redes sociais.

Analise DETALHADAMENTE esta imagem do ambiente de gravação e forneça um guia completo de produção.

Retorne APENAS um JSON válido com esta estrutura exata:
{
  "score": <número 0-10>,
  "resumo": "<avaliação geral em 2 frases>",
  "iluminacao": {
    "nota": <1-10>,
    "avaliacao": "<descrição do que viu na imagem>",
    "problemas": ["<problema 1>", "<problema 2>"],
    "solucoes": ["<solução 1>", "<solução 2>", "<solução 3>"]
  },
  "camera": {
    "posicao_ideal": "<onde posicionar a câmera neste ambiente>",
    "altura": "<altura recomendada em relação ao rosto>",
    "angulo": "<ângulo ideal>",
    "distancia": "<distância do sujeito>",
    "enquadramento": "<tipo de enquadramento recomendado>"
  },
  "fundo": {
    "nota": <1-10>,
    "avaliacao": "<o que está no fundo e como afeta o vídeo>",
    "elementos_remover": ["<item 1>", "<item 2>"],
    "elementos_adicionar": ["<item 1>", "<item 2>"],
    "posicao_ideal": "<onde o criador deve se posicionar neste ambiente>"
  },
  "audio": {
    "nota": <1-10>,
    "avaliacao": "<análise do ambiente para captura de áudio>",
    "problemas": ["<eco/reverb/barulho externo>"],
    "solucoes": ["<solução de áudio 1>", "<solução 2>"]
  },
  "iluminacao_setup": {
    "tipo_detectado": "<natural/artificial/misto>",
    "setup_recomendado": "<ring light / softbox / luz janela etc>",
    "posicao_luz": "<onde colocar a iluminação principal>",
    "luz_fill": "<onde colocar luz de preenchimento>",
    "horario_ideal": "<se luz natural, qual horário>",
    "produtos_baratos": ["<produto acessível 1>", "<produto 2>"]
  },
  "cenario": {
    "estilo_detectado": "<home office / sala / externo / estúdio etc>",
    "adequacao": "<como este cenário funciona para Reels>",
    "transformacoes": ["<transformação 1>", "<transformação 2>"],
    "props_sugeridos": ["<prop 1>", "<prop 2>", "<prop 3>"]
  },
  "checklist": [
    { "item": "Fundo limpo e organizado", "ok": <true/false>, "acao": "<o que fazer>" },
    { "item": "Iluminação no rosto (sem sombra)", "ok": <true/false>, "acao": "<o que fazer>" },
    { "item": "Câmera na altura dos olhos", "ok": <true/false>, "acao": "<o que fazer>" },
    { "item": "Espaço sem eco", "ok": <true/false>, "acao": "<o que fazer>" },
    { "item": "Enquadramento vertical 9:16", "ok": <true/false>, "acao": "<o que fazer>" },
    { "item": "Sem distração ao fundo", "ok": <true/false>, "acao": "<o que fazer>" }
  ],
  "prioridades": ["<ação mais urgente>", "<segunda prioridade>", "<terceira>"]
}`

export async function POST(req: Request) {
  try {
    const { imagem, tipo } = await req.json()

    if (!imagem) {
      return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 })
    }

    // Remove prefixo data:image/...;base64, se presente
    const base64 = imagem.includes(',') ? imagem.split(',')[1] : imagem
    const mediaType = imagem.includes('image/png') ? 'image/png'
      : imagem.includes('image/webp') ? 'image/webp'
      : 'image/jpeg'

    const resposta = await cliente.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: tipo === 'video_frame'
              ? PROMPT + '\n\nEsta é um frame de um vídeo do ambiente de gravação.'
              : PROMPT,
          },
        ],
      }],
    })

    const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Resposta inválida da IA')

    const analise = JSON.parse(jsonMatch[0])
    return NextResponse.json({ data: analise })
  } catch (erro) {
    console.error('[POST /api/ambiente]', erro)
    return NextResponse.json({ error: String(erro) }, { status: 500 })
  }
}
