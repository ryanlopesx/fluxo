export const dynamic = 'force-dynamic'
import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function gerarSRT(legendas: { inicio: number; fim: number; texto: string }[]) {
  return legendas.map((l, i) => {
    const fmt = (s: number) => {
      const h = Math.floor(s / 3600).toString().padStart(2, '0')
      const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
      const sec = Math.floor(s % 60).toString().padStart(2, '0')
      const ms = Math.round((s % 1) * 1000).toString().padStart(3, '0')
      return `${h}:${m}:${sec},${ms}`
    }
    return `${i + 1}\n${fmt(l.inicio)} --> ${fmt(l.fim)}\n${l.texto}`
  }).join('\n\n')
}

export async function POST(req: Request) {
  try {
    const { frames, duracao, roteiro, estilo = 'dinâmico' } = await req.json()

    if (!frames || frames.length === 0) {
      return NextResponse.json({ error: 'Frames obrigatórios' }, { status: 400 })
    }

    const conteudoFrames: Anthropic.ImageBlockParam[] = frames.map((f: { data: string; tempo: number }) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: 'image/jpeg' as const,
        data: f.data.includes(',') ? f.data.split(',')[1] : f.data,
      },
    }))

    const legendaTempo = frames.map((f: { tempo: number }, i: number) => `Frame ${i + 1}: ${f.tempo.toFixed(1)}s`).join(', ')

    const prompt = `Você é um editor profissional de Reels e vídeos curtos para redes sociais.

Analise estes ${frames.length} frames do vídeo (${legendaTempo}) com duração total de ${duracao.toFixed(0)}s e estilo "${estilo}".
${roteiro ? `\nRoteiro/script fornecido pelo criador:\n${roteiro}\n` : ''}

Retorne APENAS um JSON válido com esta estrutura:
{
  "cortes": [
    {
      "index": 1,
      "inicio": 0,
      "fim": 4.5,
      "tipo": "gancho|desenvolvimento|rehook|cta",
      "descricao": "O que acontece neste trecho",
      "camera": "frontal|lateral|plongée|perfil",
      "texto_tela": "Texto sugerido para aparecer na tela (ou vazio)",
      "transicao": "corte seco|fade|zoom in|zoom out"
    }
  ],
  "legendas": [
    {
      "inicio": 0.0,
      "fim": 2.5,
      "texto": "Texto da legenda aqui"
    }
  ],
  "instrucoes": "Instruções gerais de edição em 2-3 frases",
  "musica": "Sugestão de estilo musical",
  "dicas_edicao": ["dica 1", "dica 2", "dica 3"]
}

Regras:
- Cortes devem cobrir toda a duração do vídeo sem gaps
- Legendas devem cobrir toda a fala visível com timing preciso (máximo 7 palavras por legenda)
- ${roteiro ? 'Use o roteiro fornecido para gerar legendas mais precisas' : 'Infira as legendas pelo contexto visual dos frames'}
- Siga a estrutura viral: Gancho (0-3s) → Desenvolvimento → Re-hook (meio) → CTA (final)
- Legendas em português, curtas e impactantes`

    const resposta = await cliente.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: [
          ...conteudoFrames,
          { type: 'text', text: prompt },
        ],
      }],
    })

    const texto = resposta.content[0].type === 'text' ? resposta.content[0].text : ''
    const match = texto.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Resposta inválida da IA')

    const analise = JSON.parse(match[0])
    const srt = gerarSRT(analise.legendas || [])

    return NextResponse.json({ data: { ...analise, srt } })
  } catch (e) {
    console.error('[POST /api/cuts/analyze]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
