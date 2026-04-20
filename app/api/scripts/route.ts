import { NextResponse } from 'next/server'
import { dbRoteiros } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('project_id')
    const roteiros = dbRoteiros.listar(projectId || undefined)
    return NextResponse.json({ data: roteiros })
  } catch (erro) {
    console.error('[GET /api/scripts]', erro)
    return NextResponse.json({ error: 'Erro ao listar roteiros' }, { status: 500 })
  }
}
