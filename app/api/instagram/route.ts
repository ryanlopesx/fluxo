import { NextResponse } from 'next/server'
import { buscarTrending, buscarPorHashtag, buscarReelsDePerfil, instagramConfigurado } from '@/lib/instagram'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const modo = searchParams.get('mode') || 'trending'
  const query = searchParams.get('q') || ''
  const perfil = searchParams.get('profile') || ''
  const quantidade = Number(searchParams.get('limit') || '12')

  // Verifica configuração antes de tentar qualquer coisa
  if (!instagramConfigurado()) {
    return NextResponse.json({
      error: 'Instagram não configurado. Adicione INSTAGRAM_USERNAME e INSTAGRAM_PASSWORD no .env.local',
      configurado: false,
    }, { status: 200 })
  }

  try {
    switch (modo) {
      case 'trending': {
        const keywords = query ? query.split(',').map(k => k.trim()) : ['reels', 'marketing']
        const data = await buscarTrending(keywords, quantidade)
        return NextResponse.json({ data, configurado: true })
      }

      case 'hashtag': {
        if (!query) return NextResponse.json({ error: 'Parâmetro q é obrigatório para mode=hashtag' }, { status: 400 })
        const posts = await buscarPorHashtag(query, quantidade)
        return NextResponse.json({ data: posts, configurado: true })
      }

      case 'profile': {
        if (!perfil) return NextResponse.json({ error: 'Parâmetro profile é obrigatório para mode=profile' }, { status: 400 })
        const reels = await buscarReelsDePerfil(perfil, quantidade)
        return NextResponse.json({ data: reels, configurado: true })
      }

      default:
        return NextResponse.json({ error: 'mode inválido. Use: trending, hashtag, profile' }, { status: 400 })
    }
  } catch (erro) {
    console.error('[GET /api/instagram]', erro)
    const mensagem = erro instanceof Error ? erro.message : 'Erro ao buscar dados do Instagram'

    // Erros comuns com mensagens amigáveis
    if (mensagem.includes('login') || mensagem.includes('checkpoint')) {
      return NextResponse.json({
        error: 'Falha no login do Instagram. Verifique as credenciais ou resolva o checkpoint na conta.',
        configurado: true,
      }, { status: 401 })
    }

    return NextResponse.json({ error: mensagem, configurado: true }, { status: 500 })
  }
}
