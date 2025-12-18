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

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const token = await getToken()

    const response = await fetch(`${API_URL}/precatories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        total: 0,
        finalizados: 0,
        emAndamento: 0,
        valorTotal: 0,
        desembolsado30Dias: 0,
      }
    }

    const precatories = await response.json()

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
      desembolsado30Dias: 0,
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
    const token = await getToken()

    const response = await fetch(`${API_URL}/precatories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        emAndamento: 0,
        finalizados: 0,
        cancelados: 0,
      }
    }

    const precatories = await response.json()

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
