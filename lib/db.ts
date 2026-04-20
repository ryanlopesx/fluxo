// Banco de dados SQLite usando o módulo nativo do Node.js v22+ (node:sqlite)
// Sem dependências nativas externas — funciona em qualquer ambiente com Node 22+
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import path from 'path'
import fs from 'fs'

// Helper para cast seguro de valores desconhecidos para o tipo SQLInputValue
const v = (val: unknown): SQLInputValue => val as SQLInputValue

// Singleton que sobrevive ao HMR em desenvolvimento
const globalForDb = global as typeof global & { db?: DatabaseSync }

function criarBanco(): DatabaseSync {
  // DATA_DIR env var allows persistent disk on Render (/var/data)
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data')

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const db = new DatabaseSync(path.join(dataDir, 'fluxo.db'))

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      voice_tone TEXT NOT NULL,
      product_description TEXT NOT NULL,
      keywords TEXT NOT NULL DEFAULT '[]',
      news_categories TEXT NOT NULL DEFAULT '[]',
      color TEXT NOT NULL DEFAULT '#6366F1',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scripts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      funnel_stage TEXT NOT NULL,
      title TEXT NOT NULL,
      hook TEXT NOT NULL DEFAULT '',
      hook_alt1 TEXT NOT NULL DEFAULT '',
      hook_alt2 TEXT NOT NULL DEFAULT '',
      context TEXT NOT NULL DEFAULT '',
      resolution TEXT NOT NULL DEFAULT '',
      rehook TEXT NOT NULL DEFAULT '',
      method_name TEXT NOT NULL DEFAULT '',
      cost_of_inaction TEXT NOT NULL DEFAULT '',
      cta TEXT NOT NULL DEFAULT '',
      full_script TEXT NOT NULL DEFAULT '',
      checklist_score INTEGER NOT NULL DEFAULT 0,
      checklist_items TEXT NOT NULL DEFAULT '{}',
      news_source_title TEXT,
      news_source_url TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cut_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      script_id TEXT,
      user_prompt TEXT NOT NULL,
      video_duration INTEGER NOT NULL,
      style TEXT NOT NULL,
      cuts TEXT NOT NULL DEFAULT '[]',
      total_duration INTEGER NOT NULL DEFAULT 0,
      rhythm TEXT NOT NULL DEFAULT '',
      instructions_general TEXT NOT NULL DEFAULT '',
      broll_suggestions TEXT NOT NULL DEFAULT '[]',
      music_mood TEXT NOT NULL DEFAULT '',
      caption_style TEXT NOT NULL DEFAULT '',
      export_settings TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL
    );
  `)

  return db
}

export function getDb(): DatabaseSync {
  if (!globalForDb.db) {
    globalForDb.db = criarBanco()
  }
  return globalForDb.db
}

// Helpers para projetos
export const dbProjetos = {
  listar: () => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as Record<string, unknown>[]
    return rows.map(parsearProjeto)
  },

  buscarPorId: (id: string) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Record<string, unknown> | undefined
    return row ? parsearProjeto(row) : null
  },

  criar: (data: Record<string, unknown>) => {
    const db = getDb()
    db.prepare(`
      INSERT INTO projects (id, name, product_name, target_audience, voice_tone, product_description, keywords, news_categories, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(v(data.id), v(data.name), v(data.product_name), v(data.target_audience), v(data.voice_tone), v(data.product_description), v(data.keywords), v(data.news_categories), v(data.color), v(data.created_at), v(data.updated_at))
  },

  atualizar: (id: string, data: Record<string, unknown>) => {
    const db = getDb()
    db.prepare(`
      UPDATE projects SET
        name = ?, product_name = ?, target_audience = ?, voice_tone = ?,
        product_description = ?, keywords = ?, news_categories = ?, color = ?, updated_at = ?
      WHERE id = ?
    `).run(v(data.name), v(data.product_name), v(data.target_audience), v(data.voice_tone), v(data.product_description), v(data.keywords), v(data.news_categories), v(data.color), v(data.updated_at), id)
  },

  deletar: (id: string) => {
    const db = getDb()
    db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  },

  contarRoteiros: (id: string) => {
    const db = getDb()
    const row = db.prepare('SELECT COUNT(*) as total FROM scripts WHERE project_id = ?').get(id) as { total: number }
    return row.total
  },
}

// Helpers para roteiros
export const dbRoteiros = {
  listar: (projectId?: string) => {
    const db = getDb()
    const rows = projectId
      ? db.prepare('SELECT * FROM scripts WHERE project_id = ? ORDER BY created_at DESC').all(projectId) as Record<string, unknown>[]
      : db.prepare('SELECT * FROM scripts ORDER BY created_at DESC').all() as Record<string, unknown>[]
    return rows.map(parsearRoteiro)
  },

  listarRecentes: (limite: number) => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM scripts ORDER BY created_at DESC LIMIT ?').all(limite) as Record<string, unknown>[]
    return rows.map(parsearRoteiro)
  },

  buscarPorId: (id: string) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM scripts WHERE id = ?').get(id) as Record<string, unknown> | undefined
    return row ? parsearRoteiro(row) : null
  },

  criar: (data: Record<string, unknown>) => {
    const db = getDb()
    db.prepare(`
      INSERT INTO scripts (
        id, project_id, funnel_stage, title, hook, hook_alt1, hook_alt2,
        context, resolution, rehook, method_name, cost_of_inaction, cta,
        full_script, checklist_score, checklist_items,
        news_source_title, news_source_url, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      v(data.id), v(data.project_id), v(data.funnel_stage), v(data.title),
      v(data.hook), v(data.hook_alt1), v(data.hook_alt2),
      v(data.context), v(data.resolution), v(data.rehook), v(data.method_name),
      v(data.cost_of_inaction), v(data.cta), v(data.full_script),
      v(data.checklist_score), v(data.checklist_items),
      v(data.news_source_title), v(data.news_source_url), v(data.status), v(data.created_at)
    )
  },

  atualizarStatus: (id: string, status: string) => {
    const db = getDb()
    db.prepare('UPDATE scripts SET status = ? WHERE id = ?').run(status, id)
  },

  deletar: (id: string) => {
    const db = getDb()
    db.prepare('DELETE FROM scripts WHERE id = ?').run(id)
  },
}

// Helpers para planos de corte
export const dbCuts = {
  listar: () => {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM cut_plans ORDER BY created_at DESC').all() as Record<string, unknown>[]
    return rows.map(parsearCutPlan)
  },

  buscarPorId: (id: string) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM cut_plans WHERE id = ?').get(id) as Record<string, unknown> | undefined
    return row ? parsearCutPlan(row) : null
  },

  criar: (data: Record<string, unknown>) => {
    const db = getDb()
    db.prepare(`
      INSERT INTO cut_plans (
        id, title, script_id, user_prompt, video_duration, style,
        cuts, total_duration, rhythm, instructions_general,
        broll_suggestions, music_mood, caption_style, export_settings, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      v(data.id), v(data.title), v(data.script_id), v(data.user_prompt),
      v(data.video_duration), v(data.style), v(data.cuts), v(data.total_duration),
      v(data.rhythm), v(data.instructions_general), v(data.broll_suggestions),
      v(data.music_mood), v(data.caption_style), v(data.export_settings), v(data.created_at)
    )
  },

  deletar: (id: string) => {
    const db = getDb()
    db.prepare('DELETE FROM cut_plans WHERE id = ?').run(id)
  },
}

// Estatísticas do dashboard
export function buscarEstatisticas() {
  const db = getDb()

  const projetos = (db.prepare('SELECT COUNT(*) as n FROM projects').get() as { n: number }).n
  const roteiros = (db.prepare('SELECT COUNT(*) as n FROM scripts').get() as { n: number }).n
  const aprovados = (db.prepare("SELECT COUNT(*) as n FROM scripts WHERE status = 'approved'").get() as { n: number }).n
  const usados = (db.prepare("SELECT COUNT(*) as n FROM scripts WHERE status = 'used'").get() as { n: number }).n

  const porEstagio = {
    tofu: (db.prepare("SELECT COUNT(*) as n FROM scripts WHERE funnel_stage = 'tofu'").get() as { n: number }).n,
    mofu: (db.prepare("SELECT COUNT(*) as n FROM scripts WHERE funnel_stage = 'mofu'").get() as { n: number }).n,
    bofu: (db.prepare("SELECT COUNT(*) as n FROM scripts WHERE funnel_stage = 'bofu'").get() as { n: number }).n,
  }

  return { total_projetos: projetos, total_roteiros: roteiros, total_aprovados: aprovados, total_usados: usados, por_estagio: porEstagio }
}

// Parsers — desserializam JSON armazenado no SQLite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsearProjeto(row: Record<string, unknown>): any {
  return {
    ...row,
    keywords: JSON.parse(row.keywords as string || '[]'),
    news_categories: JSON.parse(row.news_categories as string || '[]'),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsearRoteiro(row: Record<string, unknown>): any {
  return {
    ...row,
    checklist_items: JSON.parse(row.checklist_items as string || '{}'),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsearCutPlan(row: Record<string, unknown>): any {
  return {
    ...row,
    cuts: JSON.parse(row.cuts as string || '[]'),
    broll_suggestions: JSON.parse(row.broll_suggestions as string || '[]'),
    export_settings: JSON.parse(row.export_settings as string || '{}'),
  }
}
