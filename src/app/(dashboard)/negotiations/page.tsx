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

function calcProfitCents(p: Precatory): number | null {
  if (!p.negotiated_amount_cents || !p.disbursement_cents) return null
  return p.negotiated_amount_cents - p.disbursement_cents - (p.costs_cents ?? 0)
}

function calcRentabilidadeMes(p: Precatory): number | null {
  const profit = calcProfitCents(p)
  if (profit == null || !p.disbursement_cents || !p.created_at) return null
  const months = Math.max(
    1,
    (new Date().getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  return (profit / p.disbursement_cents / months) * 100
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

  const totalDisbursement = negotiations.reduce((s, p) => s + (p.disbursement_cents ?? 0), 0)
  const totalCurrentValue = negotiations.reduce((s, p) => s + (p.current_value_cents ?? 0), 0)
  const totalProfit = negotiations.reduce((s, p) => {
    if (!p.negotiated_amount_cents || !p.disbursement_cents) return s
    return s + p.negotiated_amount_cents - p.disbursement_cents - (p.costs_cents ?? 0)
  }, 0)

  const validRents = negotiations
    .map(calcRentabilidadeMes)
    .filter((v): v is number => v !== null)
  const avgRent = validRents.length > 0
    ? validRents.reduce((s, v) => s + v, 0) / validRents.length
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5 flex items-start gap-3">
            <Wallet className="h-8 w-8 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Desembolsado</p>
              <p className="text-xl font-bold text-[#1a384c] mt-1">{formatCents(totalDisbursement)}</p>
            </div>
          </CardContent>
        </Card>
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
            <DollarSign className="h-8 w-8 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Lucro Estimado</p>
              <p className={`text-xl font-bold mt-1 ${totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCents(totalProfit)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5 flex items-start gap-3">
            <Percent className="h-8 w-8 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rent. Média / Mês</p>
              <p className="text-xl font-bold text-[#1a384c] mt-1">
                {avgRent != null ? `${avgRent.toFixed(2)}%` : "—"}
              </p>
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
              <p className="text-xs text-center">Para cadastrar, crie um precatório e marque "Precatório negociado/comprado".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Nome</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor Orig.</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Negociado</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Desembolso</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Custas</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor Atual</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Lucro</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Rent./Mês</th>
                    <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Previsão Pagto.</th>
                    <th className="py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {negotiations.map((p) => {
                    const profit = calcProfitCents(p)
                    const rent = calcRentabilidadeMes(p)
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 pr-3 font-medium text-[#1a384c]">{p.name}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">{formatCents(p.requested_amount)}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">{formatCents(p.negotiated_amount_cents)}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">{formatCents(p.disbursement_cents)}</td>
                        <td className="py-3 pr-3 text-right text-gray-600">{formatCents(p.costs_cents)}</td>
                        <td className="py-3 pr-3 text-right font-semibold text-[#248A61]">{formatCents(p.current_value_cents)}</td>
                        <td className={`py-3 pr-3 text-right font-semibold ${profit != null && profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {formatCents(profit)}
                        </td>
                        <td className="py-3 pr-3 text-right text-gray-600">
                          {rent != null ? `${rent.toFixed(2)}%` : "—"}
                        </td>
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
