"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { precatoriesService } from "@/services/precatories"
import { Precatory } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ExternalLink, Wallet, BarChart3, DollarSign, Percent } from "lucide-react"

function formatCents(cents?: number | null) {
  if (cents == null || cents === 0) return "—"
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR")
}

function formatPercent(value?: number | null) {
  if (value == null) return "—"
  return `${value.toFixed(2)}%`
}

// Ganho Estimado = negotiated_amount - disbursement - costs
function calcGanhoEstimado(p: Precatory): number | null {
  if (!p.negotiated_amount_cents || !p.disbursement_cents) return null
  return p.negotiated_amount_cents - p.disbursement_cents - (p.costs_cents ?? 0)
}

// Ganho Atualizado = current_value - disbursement - costs
function calcGanhoAtualizado(p: Precatory): number | null {
  if (!p.current_value_cents || !p.disbursement_cents) return null
  return p.current_value_cents - p.disbursement_cents - (p.costs_cents ?? 0)
}

// Rentabilidade Estimada = ganho estimado / desembolsado * 100
function calcRentabilidadeEstimada(p: Precatory): number | null {
  const ganho = calcGanhoEstimado(p)
  const desembolsado = (p.disbursement_cents ?? 0) - (p.costs_cents ?? 0)
  if (ganho == null || desembolsado <= 0) return null
  return (ganho / desembolsado) * 100
}

// Rentabilidade Atualizada = ganho atualizado / desembolsado * 100
function calcRentabilidadeAtualizada(p: Precatory): number | null {
  const ganho = calcGanhoAtualizado(p)
  const desembolsado = (p.disbursement_cents ?? 0) - (p.costs_cents ?? 0)
  if (ganho == null || desembolsado <= 0) return null
  return (ganho / desembolsado) * 100
}

// % do valor negociado sobre o face value
function calcPercentFaceValue(p: Precatory): number | null {
  if (!p.negotiated_amount_cents || !p.requested_amount) return null
  return (p.negotiated_amount_cents / p.requested_amount) * 100
}

export default function NegotiationsPage() {
  const router = useRouter()
  const [negotiations, setNegotiations] = useState<Precatory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    precatoriesService.getAll()
      .then((data) => {
        const all = Array.isArray(data) ? data : []
        setNegotiations(all.filter((p: Precatory) => p.is_negotiated))
      })
      .catch(() => setNegotiations([]))
      .finally(() => setLoading(false))
  }, [])

  const desembolsadoTotal = negotiations.reduce((s, p) => {
    const d = (p.disbursement_cents ?? 0) - (p.costs_cents ?? 0)
    return s + Math.max(0, d)
  }, 0)

  const totalCurrentValue = negotiations.reduce((s, p) => s + (p.current_value_cents ?? 0), 0)

  const totalGanhoEstimado = negotiations.reduce((s, p) => {
    const g = calcGanhoEstimado(p)
    return g != null ? s + g : s
  }, 0)

  const totalGanhoAtualizado = negotiations.reduce((s, p) => {
    const g = calcGanhoAtualizado(p)
    return g != null ? s + g : s
  }, 0)

  const rentEstimadas = negotiations.map(calcRentabilidadeEstimada).filter((v): v is number => v !== null)
  const avgRentEstimada = rentEstimadas.length > 0
    ? rentEstimadas.reduce((s, v) => s + v, 0) / rentEstimadas.length
    : null

  const rentAtualizadas = negotiations.map(calcRentabilidadeAtualizada).filter((v): v is number => v !== null)
  const avgRentAtualizada = rentAtualizadas.length > 0
    ? rentAtualizadas.reduce((s, v) => s + v, 0) / rentAtualizadas.length
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-indigo-500" strokeWidth={2.5} />
          <div>
            <h1 className="text-2xl font-bold text-[#1a384c]">Negociações</h1>
            <p className="text-sm text-gray-500 mt-0.5">Portfólio de precatórios comprados e negociados</p>
          </div>
        </div>
        <Button
          className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90"
          onClick={() => router.push("/precatory/new")}
        >
          Nova Negociação
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5 flex items-start gap-3">
            <Wallet className="h-8 w-8 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Valor Desembolsado</p>
              <p className="text-xl font-bold text-[#1a384c] mt-1">{formatCents(desembolsadoTotal)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Disbursement − Custas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5 flex items-start gap-3">
            <DollarSign className="h-8 w-8 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Ganho Estimado</p>
              <p className={`text-xl font-bold mt-1 ${totalGanhoEstimado >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCents(totalGanhoEstimado)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Rent. média: {avgRentEstimada != null ? `${avgRentEstimada.toFixed(2)}%` : "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5 flex items-start gap-3">
            <BarChart3 className="h-8 w-8 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Ganho Atualizado</p>
              <p className={`text-xl font-bold mt-1 ${totalGanhoAtualizado >= 0 ? "text-purple-600" : "text-red-600"}`}>
                {formatCents(totalGanhoAtualizado)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Rent. média: {avgRentAtualizada != null ? `${avgRentAtualizada.toFixed(2)}%` : "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards secundários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5 flex items-start gap-3">
            <BarChart3 className="h-8 w-8 text-[#248A61] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Valor Atual da Carteira</p>
              <p className="text-xl font-bold text-[#248A61] mt-1">{formatCents(totalCurrentValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5 flex items-start gap-3">
            <Percent className="h-8 w-8 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rentabilidade Estimada / Atualizada</p>
              <p className="text-xl font-bold text-[#1a384c] mt-1">
                {avgRentEstimada != null ? `${avgRentEstimada.toFixed(2)}%` : "—"}
                {avgRentAtualizada != null && (
                  <span className="text-sm text-purple-600 ml-2">/ {avgRentAtualizada.toFixed(2)}%</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Estimada / Atualizada (médias)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border rounded-2xl bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold text-[#1a384c]">Portfólio</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <p className="text-gray-400 text-center py-8">Carregando...</p>
          ) : negotiations.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
              <TrendingUp className="h-10 w-10" />
              <p>Nenhuma negociação cadastrada.</p>
              <p className="text-xs text-center">Para cadastrar, crie um precatório e marque &quot;Precatório negociado/comprado&quot;.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Nome</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor Requerido</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Negociado</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">% Requerido</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Desembolso</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Honorários</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor Atual</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Ganho Est.</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Rent. Est.</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Ganho Atual.</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Rent. Atual.</th>
                    <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Previsão</th>
                    <th className="py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {negotiations.map((p) => {
                    const ganhoEst = calcGanhoEstimado(p)
                    const ganhoAtual = calcGanhoAtualizado(p)
                    const rentEst = calcRentabilidadeEstimada(p)
                    const rentAtual = calcRentabilidadeAtualizada(p)
                    const pctFace = calcPercentFaceValue(p)
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 pr-3 font-medium text-[#1a384c]">{p.name}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">{formatCents(p.requested_amount)}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">{formatCents(p.negotiated_amount_cents)}</td>
                        <td className="py-3 pr-3 text-right text-amber-600 font-medium">{formatPercent(pctFace)}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">{formatCents(p.disbursement_cents)}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">
                          {p.fee_percentage ? `${p.fee_percentage}%` : "—"}
                        </td>
                        <td className="py-3 pr-3 text-right font-semibold text-[#248A61]">{formatCents(p.current_value_cents)}</td>
                        <td className={`py-3 pr-3 text-right font-semibold ${ganhoEst != null && ganhoEst >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {formatCents(ganhoEst)}
                        </td>
                        <td className="py-3 pr-3 text-right text-emerald-700">{formatPercent(rentEst)}</td>
                        <td className={`py-3 pr-3 text-right font-semibold ${ganhoAtual != null && ganhoAtual >= 0 ? "text-purple-600" : "text-red-600"}`}>
                          {formatCents(ganhoAtual)}
                        </td>
                        <td className="py-3 pr-3 text-right text-purple-700">{formatPercent(rentAtual)}</td>
                        <td className="py-3 pr-3 text-gray-600">{formatDate(p.payment_forecast_date)}</td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-[#1a384c]"
                            onClick={() => router.push(`/precatory/${p.id}`)}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
