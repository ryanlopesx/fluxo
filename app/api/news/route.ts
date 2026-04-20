export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { buscarNoticias } from '@/lib/news'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || 'agronegócio'
    const noticias = await buscarNoticias(query)
    return NextResponse.json({ data: noticias })
  } catch (erro) {
    console.error('[GET /api/news]', erro)
    return NextResponse.json({ error: 'Erro ao buscar notícias' }, { status: 500 })
  }
}
