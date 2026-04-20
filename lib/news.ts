import type { Noticia } from '@/types'

// Notícias mock realistas para fallback — sobre agro, pet, negócios, saúde animal
const MOCK_NOTICIAS: Noticia[] = [
  {
    title: 'Custo da ração animal sobe 18% no primeiro trimestre e produtores buscam alternativas',
    description: 'Alta no preço do milho e da soja pressiona custos de produção. Especialistas recomendam diversificação alimentar como estratégia de redução de custos.',
    url: '#',
    source: 'AgroNewsHub',
    published_at: new Date(Date.now() - 86400000).toISOString(),
    image_url: undefined,
  },
  {
    title: 'Moringa oleifera ganha espaço na suplementação animal em propriedades do interior',
    description: 'Pesquisas mostram que o uso da Moringa pode reduzir em até 30% os custos com suplementação proteica em rebanhos bovinos.',
    url: '#',
    source: 'Campo Digital',
    published_at: new Date(Date.now() - 172800000).toISOString(),
    image_url: undefined,
  },
  {
    title: 'Mercado pet cresce 14% em 2024 e demanda por produtos naturais lidera expansão',
    description: 'Donos de animais de estimação buscam cada vez mais opções naturais e sem conservantes artificiais para a alimentação de seus pets.',
    url: '#',
    source: 'PetBusiness Brasil',
    published_at: new Date(Date.now() - 259200000).toISOString(),
    image_url: undefined,
  },
  {
    title: 'Nutrição funcional para bovinos: estudo aponta ganho de peso 22% maior com protocolos naturais',
    description: 'Universidade Federal do Mato Grosso publica pesquisa sobre eficiência de suplementos naturais em comparação ao sistema convencional.',
    url: '#',
    source: 'Ciência Rural',
    published_at: new Date(Date.now() - 345600000).toISOString(),
    image_url: undefined,
  },
  {
    title: 'Exportações do agronegócio batem recorde e produtor rural busca mais eficiência operacional',
    description: 'Momento favorável do mercado exige que produtores reduzam custos internos para maximizar margem. Consultores indicam revisão da cadeia de insumos.',
    url: '#',
    source: 'Valor Econômico Rural',
    published_at: new Date(Date.now() - 432000000).toISOString(),
    image_url: undefined,
  },
  {
    title: 'Pequenos produtores rurais adotam redes sociais para venda direta e ampliam receita em 40%',
    description: 'Instagram e TikTok se tornaram canais fundamentais de venda direta para produtores rurais que antes dependiam apenas de atravessadores.',
    url: '#',
    source: 'Empreendedor Rural',
    published_at: new Date(Date.now() - 518400000).toISOString(),
    image_url: undefined,
  },
  {
    title: 'Anvisa regulamenta novos suplementos naturais para uso veterinário no Brasil',
    description: 'Novas diretrizes ampliam o mercado de suplementos naturais para animais, abrindo espaço para produtos à base de plantas medicinais.',
    url: '#',
    source: 'Vet News Brasil',
    published_at: new Date(Date.now() - 604800000).toISOString(),
    image_url: undefined,
  },
  {
    title: 'Conteúdo educativo sobre agronegócio no Instagram atinge 500 milhões de visualizações em 2024',
    description: 'Criadores de conteúdo do agro lideram engajamento entre nichos especializados. Reels sobre produção e nutrição animal são os mais assistidos.',
    url: '#',
    source: 'Social Media Agro',
    published_at: new Date(Date.now() - 691200000).toISOString(),
    image_url: undefined,
  },
]

async function buscarGNews(query: string, apiKey: string): Promise<Noticia[]> {
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=pt&country=br&max=8&apikey=${apiKey}`
  const resp = await fetch(url, { next: { revalidate: 3600 } })
  if (!resp.ok) throw new Error(`GNews: ${resp.status}`)
  const data = await resp.json() as { articles: Array<{ title: string; description: string; url: string; source: { name: string }; publishedAt: string; image: string }> }
  return data.articles.map(a => ({
    title: a.title,
    description: a.description,
    url: a.url,
    source: a.source.name,
    published_at: a.publishedAt,
    image_url: a.image,
  }))
}

async function buscarNewsData(query: string, apiKey: string): Promise<Noticia[]> {
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&country=br&language=portuguese&size=8`
  const resp = await fetch(url, { next: { revalidate: 3600 } })
  if (!resp.ok) throw new Error(`NewsData: ${resp.status}`)
  const data = await resp.json() as { results: Array<{ title: string; description: string; link: string; source_id: string; pubDate: string; image_url?: string }> }
  return (data.results || []).map(a => ({
    title: a.title,
    description: a.description || '',
    url: a.link,
    source: a.source_id,
    published_at: a.pubDate,
    image_url: a.image_url,
  }))
}

async function buscarTheNewsApi(query: string, apiKey: string): Promise<Noticia[]> {
  const url = `https://api.thenewsapi.com/v1/news/all?api_token=${apiKey}&search=${encodeURIComponent(query)}&language=pt&limit=8`
  const resp = await fetch(url, { next: { revalidate: 3600 } })
  if (!resp.ok) throw new Error(`TheNewsAPI: ${resp.status}`)
  const data = await resp.json() as { data: Array<{ title: string; description: string; url: string; source: string; published_at: string; image_url?: string }> }
  return (data.data || []).map(a => ({
    title: a.title,
    description: a.description || '',
    url: a.url,
    source: a.source,
    published_at: a.published_at,
    image_url: a.image_url,
  }))
}

async function buscarGoogleRss(query: string): Promise<Noticia[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
  const resp = await fetch(url, { next: { revalidate: 3600 } })
  if (!resp.ok) throw new Error(`Google RSS: ${resp.status}`)
  const xml = await resp.text()

  // Parser simples de RSS sem dependência externa
  const items: Noticia[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
    const item = match[1]
    const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(item) || /<title>(.*?)<\/title>/.exec(item))?.[1] || ''
    const url = (/<link>(.*?)<\/link>/.exec(item))?.[1] || ''
    const desc = (/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(item) || /<description>(.*?)<\/description>/.exec(item))?.[1] || ''
    const pub = (/<pubDate>(.*?)<\/pubDate>/.exec(item))?.[1] || ''
    const src = (/<source[^>]*>(.*?)<\/source>/.exec(item))?.[1] || 'Google News'
    if (title && url) items.push({ title, description: desc, url, source: src, published_at: pub })
  }
  return items
}

export async function buscarNoticias(query: string): Promise<Noticia[]> {
  const gnewsKey = process.env.GNEWS_API_KEY
  const newsdataKey = process.env.NEWSDATA_API_KEY
  const theNewsKey = process.env.THE_NEWS_API_KEY

  // Tenta cada provider em ordem, com fallback
  const providers = [
    gnewsKey ? () => buscarGNews(query, gnewsKey) : null,
    newsdataKey ? () => buscarNewsData(query, newsdataKey) : null,
    theNewsKey ? () => buscarTheNewsApi(query, theNewsKey) : null,
    () => buscarGoogleRss(query),
  ].filter(Boolean) as Array<() => Promise<Noticia[]>>

  for (const provider of providers) {
    try {
      const noticias = await provider()
      if (noticias.length > 0) return noticias
    } catch {
      // Tenta o próximo provider
      continue
    }
  }

  // Fallback: filtra mock por relevância da query
  const queryLower = query.toLowerCase()
  const filtradas = MOCK_NOTICIAS.filter(n =>
    n.title.toLowerCase().includes(queryLower) ||
    n.description.toLowerCase().includes(queryLower)
  )
  return filtradas.length > 0 ? filtradas : MOCK_NOTICIAS.slice(0, 5)
}
