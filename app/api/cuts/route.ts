export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { gerarPlanoCuts } from '@/lib/cuts'
import { dbCuts, dbRoteiros } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function GET() {
  try {
    const planos = dbCuts.listar()
    return NextResponse.json({ data: planos })
  } catch (erro) {
    console.error('[GET /api/cuts]', erro)
    return NextResponse.json({ error: 'Erro ao listar planos de corte' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, script_id, user_prompt, video_duration, style } = body

    if (!user_prompt || !video_duration) {
      return NextResponse.json({ error: 'user_prompt e video_duration são obrigatórios' }, { status: 400 })
    }

    // Se vinculado a um roteiro, passa o contexto completo
    let contextoRoteiro: string | undefined
    if (script_id) {
      const roteiro = dbRoteiros.buscarPorId(script_id)
      if (roteiro) {
        contextoRoteiro = `Título: ${roteiro.title}\nEstágio: ${roteiro.funnel_stage}\nGancho: ${roteiro.hook}\nContexto: ${roteiro.context}\nMétodo: ${roteiro.method_name}\nResolução: ${roteiro.resolution}\nRe-hook: ${roteiro.rehook}\nCusto da inação: ${roteiro.cost_of_inaction}`
      }
    }

    const resultado = await gerarPlanoCuts({
      user_prompt,
      video_duration: Number(video_duration),
      style: style || 'dinâmico',
      contexto_roteiro: contextoRoteiro,
    })

    const id = nanoid()
    const agora = Date.now()

    dbCuts.criar({
      id,
      title: title || `Plano ${new Date().toLocaleDateString('pt-BR')}`,
      script_id: script_id || null,
      user_prompt,
      video_duration: Number(video_duration),
      style: style || 'dinâmico',
      cuts: JSON.stringify(resultado.cuts),
      total_duration: resultado.total_duration,
      rhythm: resultado.rhythm,
      instructions_general: resultado.instructions_general,
      broll_suggestions: JSON.stringify(resultado.broll_suggestions),
      music_mood: resultado.music_mood,
      caption_style: resultado.caption_style,
      export_settings: JSON.stringify(resultado.export_settings),
      created_at: agora,
    })

    return NextResponse.json({ data: { ...resultado, id, created_at: agora } }, { status: 201 })
  } catch (erro) {
    console.error('[POST /api/cuts]', erro)
    const mensagem = erro instanceof Error ? erro.message : 'Erro na geração do plano de cortes'
    return NextResponse.json({ error: mensagem }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    dbCuts.deletar(id)
    return NextResponse.json({ data: { ok: true } })
  } catch (erro) {
    console.error('[DELETE /api/cuts]', erro)
    return NextResponse.json({ error: 'Erro ao deletar plano' }, { status: 500 })
  }
}
