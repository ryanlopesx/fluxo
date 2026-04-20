export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { dbProjetos } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function GET() {
  try {
    const projetos = dbProjetos.listar()

    // Inclui contagem de roteiros em cada projeto
    const projetosComContagem = projetos.map(p => ({
      ...p,
      total_roteiros: dbProjetos.contarRoteiros(p.id as string),
    }))

    return NextResponse.json({ data: projetosComContagem })
  } catch (erro) {
    console.error('[GET /api/projects]', erro)
    return NextResponse.json({ error: 'Erro ao listar projetos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, product_name, target_audience, voice_tone, product_description, keywords, news_categories, color } = body

    if (!name || !product_name || !target_audience) {
      return NextResponse.json({ error: 'Campos obrigatórios: name, product_name, target_audience' }, { status: 400 })
    }

    const agora = Date.now()
    const id = nanoid()

    dbProjetos.criar({
      id,
      name,
      product_name,
      target_audience,
      voice_tone: voice_tone || 'educativo',
      product_description: product_description || '',
      keywords: JSON.stringify(keywords || []),
      news_categories: JSON.stringify(news_categories || []),
      color: color || '#6366F1',
      created_at: agora,
      updated_at: agora,
    })

    const projeto = dbProjetos.buscarPorId(id)
    return NextResponse.json({ data: projeto }, { status: 201 })
  } catch (erro) {
    console.error('[POST /api/projects]', erro)
    return NextResponse.json({ error: 'Erro ao criar projeto' }, { status: 500 })
  }
}
