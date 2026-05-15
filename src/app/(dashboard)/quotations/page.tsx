"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { precatoriesService } from "@/services/precatories"
import { Precatory } from "@/utils/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, ExternalLink, FileDown } from "lucide-react"
import { ModalCotacao } from "@/components/precatory/ModalCotacao"

function formatCents(cents?: number | null) {
  if (cents == null) return "—"
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function QuotationsPage() {
  const router = useRouter()
  const [precatories, setPrecatories] = useState<Precatory[]>([])
  const [loading, setLoading] = useState(true)
  const [cotacaoFor, setCotacaoFor] = useState<Precatory | null>(null)

  useEffect(() => {
    precatoriesService.getAll()
      .then((data) => {
        const all: Precatory[] = Array.isArray(data) ? data : []
        setPrecatories(all.filter((p) => p.status === "em_negociacao"))
      })
      .catch(() => setPrecatories([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-7 w-7 text-[#248A61]" strokeWidth={2.5} />
          <div>
            <h1 className="text-2xl font-bold text-[#1a384c]">Cotações</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gere propostas para precatórios em negociação
            </p>
          </div>
        </div>
      </div>

      <Card className="border rounded-2xl bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold text-[#1a384c]">
            Precatórios em Negociação
            <span className="ml-2 text-sm font-normal text-gray-400">({precatories.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <p className="text-gray-400 text-center py-8">Carregando...</p>
          ) : precatories.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
              <Tag className="h-10 w-10" />
              <p>Nenhum precatório em negociação.</p>
              <p className="text-xs text-center">Precatórios com status &quot;Em Negociação&quot; aparecem aqui automaticamente.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {precatories.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Tag className="h-4 w-4 text-[#248A61] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1a384c] truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.number} · {p.defendant?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Valor Requerido</p>
                      <p className="text-sm font-bold text-[#248A61]">{formatCents(p.requested_amount)}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90 gap-1.5"
                      onClick={() => setCotacaoFor(p)}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Gerar Proposta
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#1a384c]"
                      onClick={() => router.push(`/precatory/${p.id}`)}
                      title="Ver precatório"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {cotacaoFor && (
        <ModalCotacao
          precatoryId={cotacaoFor.id}
          precatoryName={cotacaoFor.name}
          paymentForecastYear={cotacaoFor.payment_forecast_year ?? null}
          open={!!cotacaoFor}
          onClose={() => setCotacaoFor(null)}
        />
      )}
    </div>
  )
}
