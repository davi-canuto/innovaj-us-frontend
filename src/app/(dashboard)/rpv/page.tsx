"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { precatoriesService } from "@/services/precatories"
import { Precatory } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, Plus, ExternalLink } from "lucide-react"

function formatCents(cents?: number | null) {
  if (cents == null || cents === 0) return "—"
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function RpvListPage() {
  const router = useRouter()
  const [rpvs, setRpvs] = useState<Precatory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    precatoriesService.getAll()
      .then((data) => {
        const all = Array.isArray(data) ? data : []
        setRpvs(all.filter((p: Precatory) => p.is_rpv))
      })
      .catch(() => setRpvs([]))
      .finally(() => setLoading(false))
  }, [])

  const totalRpvAmount = rpvs.reduce((sum, r) => sum + (r.rpv_amount_cents ?? 0), 0)
  const totalSuccumbence = rpvs.reduce((sum, r) => sum + (r.succumbence_fee_cents ?? 0), 0)
  const totalContractual = rpvs.reduce((sum, r) => sum + (r.contractual_fee_cents ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-7 w-7 text-orange-500" strokeWidth={2.5} />
          <div>
            <h1 className="text-2xl font-bold text-[#1a384c]">RPVs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Requisições de Pequeno Valor</p>
          </div>
        </div>
        <Button
          className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90"
          onClick={() => router.push("/precatory/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo RPV
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total de RPVs</p>
            <p className="text-2xl font-bold text-[#1a384c] mt-1">{rpvs.length}</p>
          </CardContent>
        </Card>
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Valor a Pagar</p>
            <p className="text-xl font-bold text-[#248A61] mt-1">{formatCents(totalRpvAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">H. Sucumbência Total</p>
            <p className="text-xl font-bold text-[#1a384c] mt-1">{formatCents(totalSuccumbence)}</p>
          </CardContent>
        </Card>
        <Card className="border rounded-2xl bg-white">
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">H. Contratuais Total</p>
            <p className="text-xl font-bold text-[#1a384c] mt-1">{formatCents(totalContractual)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border rounded-2xl bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold text-[#1a384c]">Lista de RPVs</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <p className="text-gray-400 text-center py-8">Carregando...</p>
          ) : rpvs.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
              <Receipt className="h-10 w-10" />
              <p>Nenhuma RPV cadastrada.</p>
              <p className="text-xs text-center">Para cadastrar uma RPV, crie um precatório e marque a opção "Este precatório é uma RPV".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Credor / Nome</th>
                    <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Nº Processo</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor Originário</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor a Pagar</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">H. Sucumbência</th>
                    <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">H. Contratuais</th>
                    <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Previsão Pagto.</th>
                    <th className="py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {rpvs.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pr-3 font-medium text-[#1a384c]">{r.name}</td>
                      <td className="py-3 pr-3 text-gray-600 font-mono text-xs">{r.number || r.administrative_process || "—"}</td>
                      <td className="py-3 pr-3 text-right text-gray-700">{formatCents(r.requested_amount)}</td>
                      <td className="py-3 pr-3 text-right font-semibold text-[#248A61]">{formatCents(r.rpv_amount_cents)}</td>
                      <td className="py-3 pr-3 text-right text-gray-700">{formatCents(r.succumbence_fee_cents)}</td>
                      <td className="py-3 pr-3 text-right text-gray-700">{formatCents(r.contractual_fee_cents)}</td>
                      <td className="py-3 pr-3 text-gray-600">{formatDate(r.payment_forecast_date)}</td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-[#1a384c]"
                          onClick={() => router.push(`/precatory/${r.id}`)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
