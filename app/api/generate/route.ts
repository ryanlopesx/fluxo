import { NextResponse } from 'next/server'
import { gerarRoteiro } from '@/lib/claude'
import { dbProjetos, dbRoteiros } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { project_id, funnel_stage, tema_personalizado, news_source_title, news_source_url, news_source_description } = body

    if (!project_id || !funnel_stage) {
      return NextResponse.json({ error: 'project_id e funnel_stage são obrigatórios' }, { status: 400 })
    }

    const projeto = dbProjetos.buscarPorId(project_id)
    if (!projeto) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })

    // Gera o roteiro com a metodologia de 4 fases
    const resultado = await gerarRoteiro({
      funnel_stage,
      product_name: projeto.product_name as string,
      target_audience: projeto.target_audience as string,
      voice_tone: projeto.voice_tone as string,
      product_description: projeto.product_description as string,
      keywords: projeto.keywords as string[],
      tema_customizado: tema_personalizado,
      news_title: news_source_title,
      news_description: news_source_description,
    })

    // Salva no banco
    const id = nanoid()
    const agora = Date.now()

    dbRoteiros.criar({
      id,
      project_id,
      funnel_stage,
      title: resultado.title,
      hook: resultado.hook,
      hook_alt1: resultado.hook_alt1,
      hook_alt2: resultado.hook_alt2,
      context: resultado.context,
      resolution: resultado.resolution,
      rehook: resultado.rehook,
      method_name: resultado.method_name,
      cost_of_inaction: resultado.cost_of_inaction,
      cta: resultado.cta,
      full_script: resultado.full_script,
      checklist_score: resultado.checklist_score,
      checklist_items: JSON.stringify(resultado.checklist_items),
      news_source_title: news_source_title || null,
      news_source_url: news_source_url || null,
      status: 'draft',
      created_at: agora,
    })

    return NextResponse.json({ data: { ...resultado, id, project_id, funnel_stage, status: 'draft', created_at: agora } })
  } catch (erro) {
    console.error('[POST /api/generate]', erro)
    const mensagem = erro instanceof Error ? erro.message : 'Erro na geração'
    return NextResponse.json({ error: mensagem }, { status: 500 })
  }
}
