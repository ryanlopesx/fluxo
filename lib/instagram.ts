// Integração com Instagram via instagram-private-api
// Usa credenciais de uma conta Instagram para acessar dados sem a API oficial
import { IgApiClient } from 'instagram-private-api'
import path from 'path'
import fs from 'fs'

export interface PostInstagram {
  id: string
  shortcode: string
  tipo: 'feed' | 'reel' | 'carrossel'
  legenda: string
  hashtags: string[]
  curtidas: number
  comentarios: number
  visualizacoes?: number
  autor: string
  autorSeguidores?: number
  url: string
  thumbnail?: string
  publicado_em: number
  engajamento_estimado: number
}

export interface TrendingData {
  posts: PostInstagram[]
  hashtags_trending: string[]
  tema_principal: string
  insights: string[]
}

// Singleton do cliente Instagram — reutiliza sessão entre requests
const globalForIg = global as typeof global & {
  igClient?: IgApiClient
  igLoggedIn?: boolean
}

async function getClienteInstagram(): Promise<IgApiClient> {
  if (globalForIg.igClient && globalForIg.igLoggedIn) {
    return globalForIg.igClient
  }

  const usuario = process.env.INSTAGRAM_USERNAME
  const senha = process.env.INSTAGRAM_PASSWORD

  if (!usuario || !senha) {
    throw new Error('Configure INSTAGRAM_USERNAME e INSTAGRAM_PASSWORD no .env.local')
  }

  const ig = new IgApiClient()
  ig.state.generateDevice(usuario)

  // Tenta carregar sessão salva para evitar login a cada restart
  const sessaoPath = path.join(process.cwd(), 'data', 'ig-session.json')
  try {
    if (fs.existsSync(sessaoPath)) {
      const sessaoSalva = JSON.parse(fs.readFileSync(sessaoPath, 'utf-8'))
      await ig.state.deserialize(sessaoSalva)
      globalForIg.igClient = ig
      globalForIg.igLoggedIn = true
      return ig
    }
  } catch {
    // Sessão inválida ou expirada — faz novo login
  }

  // Simula comportamento de app mobile para evitar detecção
  await ig.simulate.preLoginFlow()
  await ig.account.login(usuario, senha)
  await ig.simulate.postLoginFlow()

  // Salva sessão para próximos requests
  const sessao = await ig.state.serialize()
  delete sessao.constants
  fs.writeFileSync(sessaoPath, JSON.stringify(sessao))

  globalForIg.igClient = ig
  globalForIg.igLoggedIn = true
  return ig
}

// Extrai hashtags de uma legenda
function extrairHashtags(legenda: string): string[] {
  return (legenda.match(/#[\w\u00C0-\u024F]+/g) || []).map(h => h.toLowerCase())
}

// Calcula engajamento estimado baseado em curtidas, comentários e visualizações
function calcularEngajamento(curtidas: number, comentarios: number, visualizacoes?: number): number {
  if (visualizacoes && visualizacoes > 0) {
    return Math.round(((curtidas + comentarios) / visualizacoes) * 100 * 10) / 10
  }
  return curtidas + comentarios * 3
}

// Busca posts por hashtag — ideal para MOFU (nicho + produto)
export async function buscarPorHashtag(hashtag: string, quantidade = 12): Promise<PostInstagram[]> {
  const ig = await getClienteInstagram()

  const feed = ig.feed.tags(hashtag.replace('#', ''), 'recent')
  const items = await feed.items()

  return items.slice(0, quantidade).map(item => {
    const raw = item as unknown as Record<string, unknown>
    const legenda = (raw.caption as Record<string, unknown>)?.text as string || ''
    const curtidas = raw.like_count as number || 0
    const comentarios = raw.comment_count as number || 0
    const visualizacoes = (raw.play_count || raw.view_count) as number | undefined
    const mediaType = raw.media_type as number

    return {
      id: raw.id as string,
      shortcode: raw.code as string,
      tipo: mediaType === 2 ? 'reel' : mediaType === 8 ? 'carrossel' : 'feed',
      legenda: legenda.slice(0, 300),
      hashtags: extrairHashtags(legenda),
      curtidas,
      comentarios,
      visualizacoes,
      autor: (raw.user as Record<string, string>)?.username || '',
      url: `https://www.instagram.com/p/${raw.code}/`,
      thumbnail: ((raw.image_versions2 as Record<string, unknown>)?.candidates as Array<Record<string, string>>)?.[0]?.url,
      publicado_em: (raw.taken_at as number) * 1000,
      engajamento_estimado: calcularEngajamento(curtidas, comentarios, visualizacoes),
    }
  })
}

// Busca posts trending do Explore por keyword — bom para detectar tendências do nicho
export async function buscarTrending(keywords: string[], quantidade = 15): Promise<TrendingData> {
  const ig = await getClienteInstagram()

  // Busca nas hashtags principais do nicho
  const todasHashtags = keywords.map(k => k.replace(/\s+/g, '').toLowerCase())
  const todosPostsPromises = todasHashtags.slice(0, 3).map(h => buscarPorHashtag(h, Math.ceil(quantidade / 3)).catch(() => []))

  const resultados = await Promise.all(todosPostsPromises)
  const todosPosts = resultados.flat()

  // Ordena por engajamento
  todosPosts.sort((a, b) => b.engajamento_estimado - a.engajamento_estimado)

  // Conta hashtags mais usadas para identificar tendências
  const contagemHashtags: Record<string, number> = {}
  todosPosts.forEach(post => {
    post.hashtags.forEach(h => {
      contagemHashtags[h] = (contagemHashtags[h] || 0) + 1
    })
  })

  const hashtagsTrending = Object.entries(contagemHashtags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([h]) => h)

  // Extrai insights dos posts de maior engajamento
  const topPosts = todosPosts.slice(0, 5)
  const insights: string[] = []

  if (topPosts.length > 0) {
    const mediaEngajamento = Math.round(topPosts.reduce((s, p) => s + p.engajamento_estimado, 0) / topPosts.length)
    insights.push(`Top posts do nicho têm ${mediaEngajamento}% de engajamento médio`)

    const reels = topPosts.filter(p => p.tipo === 'reel')
    if (reels.length > topPosts.length / 2) {
      insights.push('Reels dominam o formato de maior alcance neste nicho')
    }

    const hashtagsDoTop = topPosts.flatMap(p => p.hashtags).slice(0, 5)
    if (hashtagsDoTop.length > 0) {
      insights.push(`Hashtags em alta: ${hashtagsDoTop.slice(0, 3).join(', ')}`)
    }
  }

  return {
    posts: todosPosts.slice(0, quantidade),
    hashtags_trending: hashtagsTrending,
    tema_principal: keywords[0] || '',
    insights,
  }
}

// Busca reels de alta performance de um perfil específico — para benchmarking
export async function buscarReelsDePerfil(username: string, quantidade = 6): Promise<PostInstagram[]> {
  const ig = await getClienteInstagram()

  const userId = await ig.user.getIdByUsername(username)
  // userReels pode não existir em todas as versões — usa timeline do usuário como fallback
  const feedFactory = ig.feed as unknown as Record<string, unknown>
  const feed = typeof feedFactory.userReels === 'function'
    ? (feedFactory.userReels as (id: number, u: string) => { items: () => Promise<unknown[]> })(userId, username)
    : ig.feed.user(userId)
  const items = await (feed as { items: () => Promise<unknown[]> }).items()

  return items.slice(0, quantidade).map(item => {
    const raw = item as unknown as Record<string, unknown>
    const legenda = (raw.caption as Record<string, unknown>)?.text as string || ''
    const curtidas = raw.like_count as number || 0
    const comentarios = raw.comment_count as number || 0
    const visualizacoes = (raw.play_count || raw.view_count) as number | undefined

    return {
      id: raw.id as string,
      shortcode: raw.code as string,
      tipo: 'reel' as const,
      legenda: legenda.slice(0, 300),
      hashtags: extrairHashtags(legenda),
      curtidas,
      comentarios,
      visualizacoes,
      autor: username,
      url: `https://www.instagram.com/reel/${raw.code}/`,
      thumbnail: ((raw.image_versions2 as Record<string, unknown>)?.candidates as Array<Record<string, string>>)?.[0]?.url,
      publicado_em: (raw.taken_at as number) * 1000,
      engajamento_estimado: calcularEngajamento(curtidas, comentarios, visualizacoes),
    }
  })
}

// Busca sugestões de hashtags relacionadas — útil para ampliar alcance
export async function buscarHashtagsRelacionadas(hashtag: string): Promise<string[]> {
  const ig = await getClienteInstagram()
  const tagRepo = ig.tag as unknown as Record<string, unknown>

  // A API pode ter métodos diferentes dependendo da versão
  if (typeof tagRepo.info === 'function') {
    try {
      const info = await (tagRepo.info as (h: string) => Promise<unknown>)(hashtag.replace('#', ''))
      const relacionadas = (info as Record<string, unknown>).related_tags as Array<{ name: string }> | undefined
      if (relacionadas) {
        return relacionadas.map(r => `#${r.name}`).slice(0, 10)
      }
    } catch {
      // Fallback silencioso
    }
  }

  return [`#${hashtag.replace('#', '')}`]
}

// Verifica se as credenciais do Instagram estão configuradas
export function instagramConfigurado(): boolean {
  return !!(process.env.INSTAGRAM_USERNAME && process.env.INSTAGRAM_PASSWORD)
}
