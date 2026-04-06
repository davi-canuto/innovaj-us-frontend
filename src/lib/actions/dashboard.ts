'use server'

import { getToken, clearSessionAndRedirect } from './auth'

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

export interface DashboardStats {
  total: number
  emNegociacao: number
  negociados: number
  concluidos: number
  cancelados: number
  totalRpvs: number
  // Financeiro
  valorTotalCarteira: number    // ganhoAtualizado + desembolsadoTotal
  desembolsadoTotal: number     // soma de disbursement - costs de todas as negociações
  ganhoEstimado: number         // negotiated_amount - disbursement - costs
  ganhoAtualizado: number       // current_value - disbursement - costs
  totalNegociacoes: number
  // Previsão por ano (4 anos a partir do atual)
  previsaoPorAno: { year: number; valor: number }[]
}

export interface ChartData {
  emNegociacao: number
  negociados: number
  concluidos: number
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

function getStatus(p: any): string {
  // Usa campo status novo se existir, senão cai para stage legado
  if (p.status) return p.status
  const stage = (p.stage ?? '').toLowerCase()
  if (stage.includes('andamento') || stage.includes('negociacao') || stage.includes('negociação')) return 'em_negociacao'
  if (stage.includes('negociado')) return 'negociado'
  if (stage.includes('finalizado') || stage.includes('concluído') || stage.includes('concluido')) return 'concluido'
  if (stage.includes('cancelado')) return 'cancelado'
  return 'em_negociacao'
}

function buildStats(precatories: any[]): DashboardStats {
  const currentYear = new Date().getFullYear()

  const negociacoes = precatories.filter((p: any) => p.is_negotiated)

  // Desembolsado = disbursement - costs (valor líquido investido)
  const desembolsadoTotal = negociacoes.reduce((acc: number, p: any) => {
    const desembolso = (p.disbursement_cents || 0) - (p.costs_cents || 0)
    return acc + Math.max(0, desembolso)
  }, 0)

  // Ganho Estimado = negotiated_amount - disbursement - costs
  const ganhoEstimado = negociacoes.reduce((acc: number, p: any) => {
    if (!p.negotiated_amount_cents || !p.disbursement_cents) return acc
    return acc + p.negotiated_amount_cents - p.disbursement_cents - (p.costs_cents ?? 0)
  }, 0)

  // Ganho Atualizado = current_value - disbursement - costs
  const ganhoAtualizado = negociacoes.reduce((acc: number, p: any) => {
    if (!p.current_value_cents || !p.disbursement_cents) return acc
    return acc + p.current_value_cents - p.disbursement_cents - (p.costs_cents ?? 0)
  }, 0)

  // Valor Total da Carteira = ganho atualizado + desembolsado total
  const valorTotalCarteira = ganhoAtualizado + desembolsadoTotal

  // Previsão por ano: agrupa precatórios pelo ano de previsão de pagamento
  const previsaoPorAno = [0, 1, 2, 3].map((offset) => {
    const year = currentYear + offset
    const valor = negociacoes
      .filter((p: any) => {
        if (p.payment_forecast_year) return p.payment_forecast_year === year
        if (p.payment_forecast_date) {
          return new Date(p.payment_forecast_date).getFullYear() === year
        }
        return false
      })
      .reduce((acc: number, p: any) => acc + (p.current_value_cents || p.negotiated_amount_cents || 0), 0)
    return { year, valor }
  })

  return {
    total: precatories.length,
    emNegociacao: precatories.filter((p: any) => getStatus(p) === 'em_negociacao').length,
    negociados: precatories.filter((p: any) => getStatus(p) === 'negociado').length,
    concluidos: precatories.filter((p: any) => getStatus(p) === 'concluido').length,
    cancelados: precatories.filter((p: any) => getStatus(p) === 'cancelado').length,
    totalRpvs: precatories.filter((p: any) => p.is_rpv).length,
    valorTotalCarteira,
    desembolsadoTotal,
    ganhoEstimado,
    ganhoAtualizado,
    totalNegociacoes: negociacoes.length,
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

export async function getDashboardData(): Promise<{ stats: DashboardStats; chart: ChartData; precatories: any[] }> {
  try {
    const precatories = await fetchPrecatories()
    const stats = buildStats(precatories)

    const chart: ChartData = {
      emNegociacao: stats.emNegociacao,
      negociados: stats.negociados,
      concluidos: stats.concluidos,
      cancelados: stats.cancelados,
    }

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
    const stats = buildStats(precatories)
    return {
      emNegociacao: stats.emNegociacao,
      negociados: stats.negociados,
      concluidos: stats.concluidos,
      cancelados: stats.cancelados,
    }
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return { emNegociacao: 0, negociados: 0, concluidos: 0, cancelados: 0 }
  }
}
