export const dynamic = 'force-dynamic'
import Anthropic from '@anthropic-ai/sdk'

const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Você é um coach de produção de vídeo, especialista em Reels. Estou te mostrando meu espaço de gravação pela câmera ao vivo.

Converse comigo de forma natural e direta, como um amigo que entende de produção. Sem formalidade.

FORMATO OBRIGATÓRIO: Escreva APENAS texto corrido. PROIBIDO usar: asterisco (*), cerquilha (#), traço no início de linha (-), ponto de lista (•), underline (_), markdown de qualquer tipo. Se usar qualquer um desses caracteres, a resposta será rejeitada. Escreva como se fosse uma mensagem de WhatsApp.

Regras de conteúdo:
Máximo 3 frases por resposta. Seja objetivo.
Fale na segunda pessoa, como se estivesse na sala comigo.
Comece pelo problema mais urgente que você vê agora.
Se eu fizer uma pergunta, responda ela diretamente primeiro.
Se o ambiente melhorou, reconheça antes de sugerir o próximo passo.
Uma ação por vez. Não sobrecarregue.
Tom: descontraído mas preciso. Como um colega experiente.`

export async function POST(req: Request) {
  try {
    const { frame, historico = [], mensagemUsuario = '' } = await req.json()

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
          text: mensagemUsuario
            ? mensagemUsuario
            : historico.length === 0
            ? 'Olá! Estou mostrando meu espaço de gravação. O que você vê? Por onde começo?'
            : 'Aqui está como está agora. Melhorei alguma coisa?',
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
