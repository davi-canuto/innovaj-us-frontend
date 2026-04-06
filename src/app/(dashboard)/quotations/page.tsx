"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { precatoriesService } from "@/services/precatories"
import { buildQuotation } from "@/services/quotations"
import { Precatory, Quotation } from "@/utils/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

function formatCents(cents?: number | null) {
  if (cents == null) return "—"
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function QuotationRow({ quotation, onNavigate }: { quotation: Quotation; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Header do card */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Tag className="h-4 w-4 text-[#248A61] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#1a384c]">{quotation.precatory_name}</p>
            <p className="text-xs text-gray-500">{quotation.precatory_number} · {quotation.defendant_name ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Valor Requerido</p>
            <p className="text-sm font-bold text-[#248A61]">{formatCents(quotation.face_value_cents)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-[#1a384c]"
            onClick={(e) => { e.stopPropagation(); onNavigate() }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Tabela de faixas expandida */}
      {expanded && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Ano Previsto</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Faixa Baixa</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Faixa Média</th>
                <th className="text-right py-2 text-xs text-gray-500 uppercase tracking-wide font-medium">Faixa Alta</th>
              </tr>
            </thead>
            <tbody>
              {quotation.ranges.map((range) => {
                const isForecast = quotation.payment_forecast_year === range.year
                return (
                  <tr
                    key={range.year}
                    className={`border-b last:border-0 ${isForecast ? "bg-green-50" : ""}`}
                  >
                    <td className="py-2 pr-4 font-medium text-[#1a384c]">
                      {range.label}
                      {isForecast && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Previsão</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <span className="text-gray-500 text-xs mr-1">{range.percentages[0]}%</span>
                      <span className="font-semibold text-[#1a384c]">{formatCents(range.values[0])}</span>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <span className="text-gray-500 text-xs mr-1">{range.percentages[1]}%</span>
                      <span className="font-semibold text-indigo-700">{formatCents(range.values[1])}</span>
                    </td>
                    <td className="py-2 text-right">
                      <span className="text-gray-500 text-xs mr-1">{range.percentages[2]}%</span>
                      <span className="font-semibold text-emerald-700">{formatCents(range.values[2])}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-3">
            Valores calculados sobre o valor requerido ({formatCents(quotation.face_value_cents)}) para cada faixa percentual por ano de pagamento previsto.
          </p>
        </div>
      )}
    </div>
  )
}

export default function QuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    precatoriesService.getAll()
      .then((data) => {
        const all: Precatory[] = Array.isArray(data) ? data : []
        // Apenas precatórios em negociação geram cotações
        const emNegociacao = all.filter((p) => {
          if (p.status) return p.status === "em_negociacao"
          const stage = (p.stage ?? "").toLowerCase()
          return stage.includes("andamento") || stage.includes("negociacao") || stage.includes("negociação")
        })
        setQuotations(emNegociacao.map(buildQuotation))
      })
      .catch(() => setQuotations([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-7 w-7 text-[#248A61]" strokeWidth={2.5} />
          <div>
            <h1 className="text-2xl font-bold text-[#1a384c]">Cotações</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Propostas geradas a partir dos precatórios em negociação
            </p>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <Card className="border rounded-2xl bg-white">
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ano Atual (2026)</p>
              <p>50% · 55% · 60%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">+1 Ano (2027)</p>
              <p>40% · 45% · 50%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">+2 Anos (2028)</p>
              <p>30% · 35% · 40%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">+3 Anos ou mais (2029+)</p>
              <p>25% · 30% · 35%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cotações */}
      <Card className="border rounded-2xl bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold text-[#1a384c]">
            Precatórios em Negociação
            <span className="ml-2 text-sm font-normal text-gray-400">({quotations.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-gray-400 text-center py-8">Carregando...</p>
          ) : quotations.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
              <Tag className="h-10 w-10" />
              <p>Nenhum precatório em negociação.</p>
              <p className="text-xs text-center">Precatórios com status &quot;Em Negociação&quot; aparecem aqui automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotations.map((q) => (
                <QuotationRow
                  key={q.precatory_id}
                  quotation={q}
                  onNavigate={() => router.push(`/precatory/${q.precatory_id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
