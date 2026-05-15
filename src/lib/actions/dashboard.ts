'use server'

import { getToken, clearSessionAndRedirect } from './auth'
import type { PortfolioSummary, RecebimentoPorAno } from '@/utils/types'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

export interface DashboardStats {
  total: number
  emNegociacao: number
  negociados: number
  concluidos: number
  cancelados: number
  totalRpvs: number
  valorTotalCarteira: number
  desembolsadoTotal: number
  ganhoEstimado: number
  ganhoAtualizado: number
  totalNegociacoes: number
  previsaoPorAno: { year: number; valor: number; ganhoEstimado: number; ganhoAtualizado: number; quantidade: number }[]
}

export interface ChartData {
  emNegociacao: number
  negociados: number
  concluidos: number
  cancelados: number
}

async function fetchPortfolio(): Promise<PortfolioSummary> {
  const token = await getToken()

  const response = await fetch(`${API_URL}/dashboard/portfolio`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (response.status === 401) {
    await clearSessionAndRedirect()
  }

  if (!response.ok) {
    throw new Error(`Dashboard portfolio error: ${response.status}`)
  }

  return response.json()
}

async function fetchPrecatories() {
  const token = await getToken()

  const response = await fetch(`${API_URL}/precatories`, {
    headers: {
      Authorization: `Bearer ${token}`,
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

function portfolioToStats(portfolio: PortfolioSummary): DashboardStats {
  const previsaoPorAno = portfolio.recebimentos_por_ano.map((r) => ({
    year: r.ano,
    valor: r.valor_total_cents,
    ganhoEstimado: r.ganho_estimado_total_cents,
    ganhoAtualizado: r.ganho_atualizado_total_cents,
    quantidade: r.quantidade,
  }))

  return {
    total: portfolio.total_precatories,
    totalRpvs: portfolio.total_rpvs,
    emNegociacao: 0,
    negociados: 0,
    concluidos: 0,
    cancelados: 0,
    totalNegociacoes: 0,
    valorTotalCarteira: portfolio.valor_total_carteira_cents,
    desembolsadoTotal: portfolio.valor_desembolsado_total_cents,
    ganhoEstimado: portfolio.ganho_estimado_total_cents,
    ganhoAtualizado: portfolio.ganho_atualizado_total_cents,
    previsaoPorAno,
  }
}

const EMPTY_STATS: DashboardStats = {
  total: 0,
  emNegociacao: 0,
  negociados: 0,
  concluidos: 0,
  cancelados: 0,
  totalRpvs: 0,
  valorTotalCarteira: 0,
  desembolsadoTotal: 0,
  ganhoEstimado: 0,
  ganhoAtualizado: 0,
  totalNegociacoes: 0,
  previsaoPorAno: [],
}

export async function getPortfolioYears(): Promise<RecebimentoPorAno[]> {
  try {
    const token = await getToken()

    const response = await fetch(`${API_URL}/dashboard/portfolio/years`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) return []

    const data: PortfolioSummary = await response.json()
    return data.recebimentos_por_ano ?? []
  } catch {
    return []
  }
}

export async function getDashboardData(): Promise<{ stats: DashboardStats; chart: ChartData; precatories: any[] }> {
  try {
    const [portfolio, precatories] = await Promise.all([fetchPortfolio(), fetchPrecatories()])
    const baseStats = portfolioToStats(portfolio)

    const emNegociacao = (precatories as any[]).filter((p) => p.status === 'em_negociacao').length
    const negociados = (precatories as any[]).filter((p) => p.status === 'negociado').length
    const concluidos = (precatories as any[]).filter((p) => p.status === 'concluido').length
    const cancelados = (precatories as any[]).filter((p) => p.status === 'cancelado').length
    const totalNegociacoes = (precatories as any[]).filter((p) => p.is_negotiated).length

    const stats: DashboardStats = {
      ...baseStats,
      emNegociacao,
      negociados,
      concluidos,
      cancelados,
      totalNegociacoes,
    }

    const chart: ChartData = { emNegociacao, negociados, concluidos, cancelados }

    return { stats, chart, precatories }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      stats: EMPTY_STATS,
      chart: { emNegociacao: 0, negociados: 0, concluidos: 0, cancelados: 0 },
      precatories: [],
    }
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [portfolio, precatories] = await Promise.all([fetchPortfolio(), fetchPrecatories()])
    const baseStats = portfolioToStats(portfolio)

    const emNegociacao = (precatories as any[]).filter((p) => p.status === 'em_negociacao').length
    const negociados = (precatories as any[]).filter((p) => p.status === 'negociado').length
    const concluidos = (precatories as any[]).filter((p) => p.status === 'concluido').length
    const cancelados = (precatories as any[]).filter((p) => p.status === 'cancelado').length
    const totalNegociacoes = (precatories as any[]).filter((p) => p.is_negotiated).length

    return { ...baseStats, emNegociacao, negociados, concluidos, cancelados, totalNegociacoes }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return EMPTY_STATS
  }
}

export async function getChartData(): Promise<ChartData> {
  try {
    const precatories = await fetchPrecatories()
    return {
      emNegociacao: (precatories as any[]).filter((p) => p.status === 'em_negociacao').length,
      negociados: (precatories as any[]).filter((p) => p.status === 'negociado').length,
      concluidos: (precatories as any[]).filter((p) => p.status === 'concluido').length,
      cancelados: (precatories as any[]).filter((p) => p.status === 'cancelado').length,
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return { emNegociacao: 0, negociados: 0, concluidos: 0, cancelados: 0 }
  }
}
