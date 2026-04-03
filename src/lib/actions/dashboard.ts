'use server'

import { getToken, clearSessionAndRedirect } from './auth'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

export interface DashboardStats {
  total: number
  finalizados: number
  emAndamento: number
  cancelados: number
  pendentes: number
  valorTotal: number
  desembolsado30Dias: number
  totalRpvs: number
  totalNegociacoes: number
  valorCarteiraNegociacoes: number
  lucroEstimadoNegociacoes: number
}

export interface ChartData {
  emAndamento: number
  finalizados: number
  cancelados: number
}

async function fetchPrecatories() {
  const token = await getToken()

  const response = await fetch(`${API_URL}/precatories`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (response.status === 401) {
    await clearSessionAndRedirect()
  }
  if (!response.ok) return []
  return response.json()
}

function buildStats(precatories: any[]): DashboardStats {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const finalizados = precatories.filter((p: any) =>
    p.stage?.toLowerCase().includes('finalizado') ||
    p.stage?.toLowerCase().includes('concluído')
  )
  const negociacoes = precatories.filter((p: any) => p.is_negotiated)

  // Lucro Estimado = negotiated_amount - disbursement - costs (alinhado com a planilha InnovaJUS)
  const totalNegociado = negociacoes.reduce((acc: number, p: any) => acc + (p.negotiated_amount_cents || 0), 0)
  const totalDesembolso = negociacoes.reduce((acc: number, p: any) => acc + (p.disbursement_cents || 0), 0)
  const totalCustas = negociacoes.reduce((acc: number, p: any) => acc + (p.costs_cents || 0), 0)

  return {
    total: precatories.length,
    finalizados: finalizados.length,
    emAndamento: precatories.filter((p: any) => p.stage?.toLowerCase().includes('andamento')).length,
    cancelados: precatories.filter((p: any) => p.stage?.toLowerCase().includes('cancelado')).length,
    pendentes: precatories.filter((p: any) => p.stage?.toLowerCase().includes('pendente')).length,
    valorTotal: precatories.reduce((acc: number, p: any) => acc + (p.requested_amount || 0), 0),
    desembolsado30Dias: finalizados
      .filter((p: any) => {
        const updatedAt = p.updated_at ? new Date(p.updated_at) : null
        return updatedAt && updatedAt >= thirtyDaysAgo
      })
      .reduce((acc: number, p: any) => acc + (p.requested_amount || 0), 0),
    totalRpvs: precatories.filter((p: any) => p.is_rpv).length,
    totalNegociacoes: negociacoes.length,
    valorCarteiraNegociacoes: negociacoes.reduce((acc: number, p: any) => acc + (p.current_value_cents || 0), 0),
    lucroEstimadoNegociacoes: totalNegociado - totalDesembolso - totalCustas,
  }
}

const EMPTY_STATS: DashboardStats = {
  total: 0, finalizados: 0, emAndamento: 0, cancelados: 0, pendentes: 0,
  valorTotal: 0, desembolsado30Dias: 0,
  totalRpvs: 0, totalNegociacoes: 0, valorCarteiraNegociacoes: 0, lucroEstimadoNegociacoes: 0,
}

export async function getDashboardData(): Promise<{ stats: DashboardStats; chart: ChartData; precatories: any[] }> {
  try {
    const precatories = await fetchPrecatories()
    const stats = buildStats(precatories)

    const chart: ChartData = {
      emAndamento: stats.emAndamento,
      finalizados: stats.finalizados,
      cancelados: stats.cancelados,
    }

    return { stats, chart, precatories }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      stats: EMPTY_STATS,
      chart: { emAndamento: 0, finalizados: 0, cancelados: 0 },
      precatories: [],
    }
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const precatories = await fetchPrecatories()
    return buildStats(precatories)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return EMPTY_STATS
  }
}

export async function getChartData(): Promise<ChartData> {
  try {
    const precatories = await fetchPrecatories()
    return {
      emAndamento: precatories.filter((p: any) => p.stage?.toLowerCase().includes('andamento')).length,
      finalizados: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('finalizado') ||
        p.stage?.toLowerCase().includes('concluído')
      ).length,
      cancelados: precatories.filter((p: any) => p.stage?.toLowerCase().includes('cancelado')).length,
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return { emAndamento: 0, finalizados: 0, cancelados: 0 }
  }
}
