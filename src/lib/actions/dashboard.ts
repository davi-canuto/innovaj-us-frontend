'use server'

import { getToken } from './auth'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

export interface DashboardStats {
  total: number
  finalizados: number
  emAndamento: number
  valorTotal: number
  desembolsado30Dias: number
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

  if (!response.ok) return []
  return response.json()
}

export async function getDashboardData(): Promise<{ stats: DashboardStats; chart: ChartData; precatories: any[] }> {
  try {
    const precatories = await fetchPrecatories()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const stats: DashboardStats = {
      total: precatories.length,
      finalizados: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('finalizado') ||
        p.stage?.toLowerCase().includes('concluído')
      ).length,
      emAndamento: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('andamento')
      ).length,
      valorTotal: precatories.reduce((acc: number, p: any) =>
        acc + (p.requested_amount || 0), 0
      ),
      desembolsado30Dias: precatories
        .filter((p: any) => {
          const isFinalizado =
            p.stage?.toLowerCase().includes('finalizado') ||
            p.stage?.toLowerCase().includes('concluído')
          const updatedAt = p.updated_at ? new Date(p.updated_at) : null
          return isFinalizado && updatedAt && updatedAt >= thirtyDaysAgo
        })
        .reduce((acc: number, p: any) => acc + (p.requested_amount || 0), 0),
    }

    const chart: ChartData = {
      emAndamento: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('andamento')
      ).length,
      finalizados: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('finalizado') ||
        p.stage?.toLowerCase().includes('concluído')
      ).length,
      cancelados: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('cancelado')
      ).length,
    }

    return { stats, chart, precatories }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      stats: { total: 0, finalizados: 0, emAndamento: 0, valorTotal: 0, desembolsado30Dias: 0 },
      chart: { emAndamento: 0, finalizados: 0, cancelados: 0 },
      precatories: [],
    }
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const precatories = await fetchPrecatories()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const stats = {
      total: precatories.length,
      finalizados: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('finalizado') ||
        p.stage?.toLowerCase().includes('concluído')
      ).length,
      emAndamento: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('andamento')
      ).length,
      valorTotal: precatories.reduce((acc: number, p: any) =>
        acc + (p.requested_amount || 0), 0
      ),
      desembolsado30Dias: precatories
        .filter((p: any) => {
          const isFinalizado =
            p.stage?.toLowerCase().includes('finalizado') ||
            p.stage?.toLowerCase().includes('concluído')
          const updatedAt = p.updated_at ? new Date(p.updated_at) : null
          return isFinalizado && updatedAt && updatedAt >= thirtyDaysAgo
        })
        .reduce((acc: number, p: any) => acc + (p.requested_amount || 0), 0),
    }

    return stats
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      total: 0,
      finalizados: 0,
      emAndamento: 0,
      valorTotal: 0,
      desembolsado30Dias: 0,
    }
  }
}

export async function getChartData(): Promise<ChartData> {
  try {
    const precatories = await fetchPrecatories()

    return {
      emAndamento: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('andamento')
      ).length,
      finalizados: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('finalizado') ||
        p.stage?.toLowerCase().includes('concluído')
      ).length,
      cancelados: precatories.filter((p: any) =>
        p.stage?.toLowerCase().includes('cancelado')
      ).length,
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return {
      emAndamento: 0,
      finalizados: 0,
      cancelados: 0,
    }
  }
}
