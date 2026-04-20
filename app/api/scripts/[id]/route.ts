import { NextResponse } from 'next/server'
import { dbRoteiros } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const roteiro = dbRoteiros.buscarPorId(id)
    if (!roteiro) return NextResponse.json({ error: 'Roteiro não encontrado' }, { status: 404 })
    return NextResponse.json({ data: roteiro })
  } catch (erro) {
    console.error('[GET /api/scripts/:id]', erro)
    return NextResponse.json({ error: 'Erro ao buscar roteiro' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const roteiro = dbRoteiros.buscarPorId(id)
    if (!roteiro) return NextResponse.json({ error: 'Roteiro não encontrado' }, { status: 404 })

    const body = await req.json()
    if (body.status) {
      dbRoteiros.atualizarStatus(id, body.status)
    }

    return NextResponse.json({ data: dbRoteiros.buscarPorId(id) })
  } catch (erro) {
    console.error('[PATCH /api/scripts/:id]', erro)
    return NextResponse.json({ error: 'Erro ao atualizar roteiro' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    dbRoteiros.deletar(id)
    return NextResponse.json({ data: { ok: true } })
  } catch (erro) {
    console.error('[DELETE /api/scripts/:id]', erro)
    return NextResponse.json({ error: 'Erro ao deletar roteiro' }, { status: 500 })
  }
}
