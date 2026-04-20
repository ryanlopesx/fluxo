// Tipos centrais do FLUXO

export type EstagioFunil = 'tofu' | 'mofu' | 'bofu'
export type StatusRoteiro = 'draft' | 'approved' | 'used'

export interface Projeto {
  id: string
  name: string
  product_name: string
  target_audience: string
  voice_tone: string
  product_description: string
  keywords: string[]
  news_categories: string[]
  color: string
  created_at: number
  updated_at: number
}

export interface ProjetoInput {
  name: string
  product_name: string
  target_audience: string
  voice_tone: string
  product_description: string
  keywords: string[]
  news_categories: string[]
  color: string
}

// Estrutura de checklist dos 10 pontos
export interface ChecklistItens {
  gancho_tem_dado_ou_promessa: boolean
  contexto_descreve_dor: boolean
  resolucao_tem_metodo_nomeado: boolean
  final_gera_custo_de_inacao: boolean
  testou_variacoes_de_gancho: boolean
  tem_rehook_no_meio: boolean
  escondeu_resultado_ate_o_final: boolean
  nao_voltou_pra_info_anterior: boolean
  tem_assinatura_visual: boolean
  assistiria_ate_o_fim: boolean
}

export interface Roteiro {
  id: string
  project_id: string
  funnel_stage: EstagioFunil
  title: string
  // Fase 1 — Gancho
  hook: string
  hook_alt1: string
  hook_alt2: string
  // Fase 2 — Contexto e identificação
  context: string
  // Fase 3 — Resolução com método
  resolution: string
  rehook: string
  method_name: string
  // Fase 4 — Custo da inação
  cost_of_inaction: string
  cta: string
  // Roteiro completo com timestamps
  full_script: string
  // Métricas de qualidade
  checklist_score: number
  checklist_items: ChecklistItens
  // Fonte de notícia (opcional)
  news_source_title: string | null
  news_source_url: string | null
  status: StatusRoteiro
  created_at: number
}

export interface RoteiroInput {
  project_id: string
  funnel_stage: EstagioFunil
  tema_personalizado?: string
  news_source_title?: string
  news_source_url?: string
}

// Plano de cortes de vídeo
export interface Corte {
  index: number
  start: number
  end: number
  label: string
  phase: 1 | 2 | 3 | 4
  type: string
  description: string
  camera: string
  movement: string
  text_overlay: string | null
  audio_note: string | null
  transition_to_next: string
  is_rehook: boolean
}

export interface PlanoCuts {
  id: string
  title: string
  script_id: string | null
  user_prompt: string
  video_duration: number
  style: string
  total_duration: number
  rhythm: string
  instructions_general: string
  cuts: Corte[]
  broll_suggestions: string[]
  music_mood: string
  caption_style: string
  export_settings: Record<string, string>
  created_at: number
}

export interface PlanoCutsInput {
  title: string
  script_id?: string
  user_prompt: string
  video_duration: number
  style: string
  contexto_roteiro?: string
}

// Notícia
export interface Noticia {
  title: string
  description: string
  url: string
  source: string
  published_at: string
  image_url?: string
}

// Estatísticas do dashboard
export interface Estatisticas {
  total_projetos: number
  total_roteiros: number
  total_aprovados: number
  total_usados: number
  por_estagio: {
    tofu: number
    mofu: number
    bofu: number
  }
}

// Labels dos estágios do funil
export const ESTAGIO_LABELS: Record<EstagioFunil, string> = {
  tofu: 'TOFU',
  mofu: 'MOFU',
  bofu: 'BOFU',
}

export const ESTAGIO_DESCRICAO: Record<EstagioFunil, string> = {
  tofu: 'Topo de Funil — Alcance massivo',
  mofu: 'Meio de Funil — Conecta ao produto',
  bofu: 'Fundo de Funil — Conversão direta',
}

export const ESTAGIO_CORES: Record<EstagioFunil, string> = {
  tofu: '#4B8FE8',
  mofu: '#D98C00',
  bofu: '#1DB954',
}

// Segmentos da linha do tempo viral
export const SEGMENTOS_TIMELINE = [
  { inicio: 0, fim: 3, label: 'Gancho', descricao: 'Gancho chocante — para o dedo', cor: '#3B82F6', fase: 1 },
  { inicio: 3, fim: 8, label: 'Contexto', descricao: '3 frases de dor, sem fuga', cor: '#F59E0B', fase: 2 },
  { inicio: 8, fim: 18, label: 'Resolução', descricao: 'Método com nome próprio', cor: '#10B981', fase: 3 },
  { inicio: 18, fim: 22, label: 'RE-HOOK', descricao: 'Segunda informação chocante', cor: '#8B5CF6', fase: 3, isRehook: true },
  { inicio: 22, fim: 35, label: 'Condução', descricao: 'Build up pro desfecho', cor: '#34D399', fase: 3 },
  { inicio: 35, fim: 40, label: 'Desfecho', descricao: 'Custo da inação', cor: '#FBBF24', fase: 4 },
] as const

export const CHECKLIST_10_PONTOS = [
  { id: 'gancho_tem_dado_ou_promessa', texto: 'O gancho tem dado, contradição ou promessa nos primeiros 3s?' },
  { id: 'contexto_descreve_dor', texto: 'O meio 1 descreve uma dor que a pessoa reconhece?' },
  { id: 'resolucao_tem_metodo_nomeado', texto: 'O meio 2 entrega método com nome próprio?' },
  { id: 'final_gera_custo_de_inacao', texto: 'O final gera custo de inação ou só agradece?' },
  { id: 'testou_variacoes_de_gancho', texto: 'Testei pelo menos 2 ganchos diferentes?' },
  { id: 'tem_rehook_no_meio', texto: 'Tem re-hook no meio pra segurar quem está cansando?' },
  { id: 'escondeu_resultado_ate_o_final', texto: 'Escondi o resultado final até o último segundo?' },
  { id: 'nao_voltou_pra_info_anterior', texto: 'NÃO voltei pra informação que já tinha dado?' },
  { id: 'tem_assinatura_visual', texto: 'Tem minha assinatura visual (roupa, ambiente, ângulo)?' },
  { id: 'assistiria_ate_o_fim', texto: 'Se eu visse de um desconhecido, assistiria até o fim?' },
] as const

export const SETE_ERROS = [
  { numero: '01', titulo: 'Enrolação pra entregar a info', descricao: 'Dá pra dizer em 20s, não diga em 40. Cada segundo a mais é um usuário a menos.' },
  { numero: '02', titulo: 'Gancho fraco ou genérico', descricao: '"Hoje eu vou falar sobre..." mata o vídeo antes de começar. O gancho é um ataque.' },
  { numero: '03', titulo: 'Voltar atrás na história', descricao: '"Como eu falei antes..." faz a pessoa perder o ritmo e desistir.' },
  { numero: '04', titulo: 'Revelar o resultado cedo', descricao: 'Mostrou o resultado nos 3s? A pessoa deslizou. Segurar a curiosidade é segurar a atenção.' },
  { numero: '05', titulo: 'Falar sem método', descricao: '"Crie conteúdo bom" não é método. Dê nome próprio ao framework. Nome gera autoridade.' },
  { numero: '06', titulo: 'Edição que distrai', descricao: 'Se a edição chama mais atenção que a fala, a fala morre. A edição serve à mensagem.' },
  { numero: '07', titulo: 'Postar sem testar', descricao: 'Sem teste de gancho é sorte. Grave 3 versões, use Reels Teste, publique o vencedor.' },
] as const
