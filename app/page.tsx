export const dynamic = 'force-dynamic'

import { buscarEstatisticas, dbRoteiros, dbProjetos } from '@/lib/db'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  const stats = buscarEstatisticas()
  const recentes = dbRoteiros.listarRecentes(5)
  const projetos = dbProjetos.listar().slice(0, 3).map(p => ({
    ...p,
    total_roteiros: dbProjetos.contarRoteiros(p.id as string),
  }))

  return <DashboardClient stats={stats} recentes={recentes} projetos={projetos} />
}
