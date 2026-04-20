export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { dbProjetos } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const projeto = dbProjetos.buscarPorId(id)
    if (!projeto) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    return NextResponse.json({ data: { ...projeto, total_roteiros: dbProjetos.contarRoteiros(id) } })
  } catch (erro) {
    console.error('[GET /api/projects/:id]', erro)
    return NextResponse.json({ error: 'Erro ao buscar projeto' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const projeto = dbProjetos.buscarPorId(id)
    if (!projeto) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })

    const body = await req.json()
    dbProjetos.atualizar(id, {
      name: body.name ?? projeto.name,
      product_name: body.product_name ?? projeto.product_name,
      target_audience: body.target_audience ?? projeto.target_audience,
      voice_tone: body.voice_tone ?? projeto.voice_tone,
      product_description: body.product_description ?? projeto.product_description,
      keywords: JSON.stringify(body.keywords ?? projeto.keywords),
      news_categories: JSON.stringify(body.news_categories ?? projeto.news_categories),
      color: body.color ?? projeto.color,
      updated_at: Date.now(),
    })

    return NextResponse.json({ data: dbProjetos.buscarPorId(id) })
  } catch (erro) {
    console.error('[PATCH /api/projects/:id]', erro)
    return NextResponse.json({ error: 'Erro ao atualizar projeto' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const projeto = dbProjetos.buscarPorId(id)
    if (!projeto) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    dbProjetos.deletar(id)
    return NextResponse.json({ data: { ok: true } })
  } catch (erro) {
    console.error('[DELETE /api/projects/:id]', erro)
    return NextResponse.json({ error: 'Erro ao deletar projeto' }, { status: 500 })
  }
}
