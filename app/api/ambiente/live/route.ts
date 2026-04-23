export const dynamic = 'force-dynamic'
import Anthropic from '@anthropic-ai/sdk'

const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Você é um coach de produção de vídeo ao vivo, especialista em Reels e conteúdo vertical.

Estou mostrando meu espaço de gravação em tempo real pela câmera. Analise o que você vê e converse comigo diretamente, como um coach presente na sala.

Regras:
- Fale de forma direta, curta e prática (máximo 4 frases por resposta)
- Comece sempre pelo problema mais urgente que você vê AGORA
- Use linguagem conversacional, não formal
- Se o espaço melhorou em relação à última análise, reconheça
- Dê UMA ação concreta por vez
- Não repita o que já disse nas mensagens anteriores`

export async function POST(req: Request) {
  try {
    const { frame, historico = [] } = await req.json()

    if (!frame) return new Response('Frame obrigatório', { status: 400 })

    const base64 = frame.includes(',') ? frame.split(',')[1] : frame
    const mediaType = frame.includes('image/png') ? 'image/png' : 'image/jpeg'

    // Monta o histórico de mensagens (alternando user/assistant)
    const mensagens: Anthropic.MessageParam[] = []

    for (const msg of historico) {
      if (msg.role === 'user') {
        mensagens.push({ role: 'user', content: msg.content })
      } else {
        mensagens.push({ role: 'assistant', content: msg.content })
      }
    }

    // Mensagem atual com o frame
    mensagens.push({
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        {
          type: 'text',
          text: historico.length === 0
            ? 'Olá! Estou mostrando meu espaço de gravação. O que você vê? Por onde devo começar a melhorar?'
            : 'Aqui está como está agora. O que acha? Melhorei alguma coisa?',
        },
      ],
    })

    // Streaming
    const stream = await cliente.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM,
      messages: mensagens,
      stream: true,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (erro) {
    console.error('[POST /api/ambiente/live]', erro)
    return new Response(String(erro), { status: 500 })
  }
}
