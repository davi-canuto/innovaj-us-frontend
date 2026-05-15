"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { FileDown, Loader2 } from "lucide-react"
import { quotationsApiService, QuotationTabela, QuotationFaixa } from "@/services/quotations"
import { cn } from "@/lib/utils"

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

type SelectedCell = { ano: number; faixa: QuotationFaixa }

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ModalCotacao({
  precatoryId,
  precatoryName,
  paymentForecastYear,
  open,
  onClose,
}: {
  precatoryId: number
  precatoryName: string
  paymentForecastYear: number | null | undefined
  open: boolean
  onClose: () => void
}) {
  const [tabela, setTabela] = useState<QuotationTabela | null>(null)
  const [loadingTabela, setLoadingTabela] = useState(false)
  const [selected, setSelected] = useState<SelectedCell | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelected(null)
    setTabela(null)
    setLoadingTabela(true)
    quotationsApiService.getTabela(precatoryId)
      .then(setTabela)
      .catch(() => toast.error("Não foi possível carregar a tabela de cotação."))
      .finally(() => setLoadingTabela(false))
  }, [open, precatoryId])

  const linhasExibidas = tabela?.tabela ?? []

  function selectCell(ano: number, faixa: QuotationFaixa) {
    setSelected((prev) =>
      prev?.ano === ano && prev.faixa.porcentagem === faixa.porcentagem ? null : { ano, faixa }
    )
  }

  async function handleDownload() {
    if (!selected) return
    setDownloading(true)
    try {
      const blob = await quotationsApiService.downloadPdf(precatoryId, selected.ano, selected.faixa.porcentagem)
      const safeName = precatoryName.replace(/[^a-zA-Z0-9À-ú\s]/g, "").trim().toUpperCase()
      triggerDownload(blob, `PROPOSTA-INNOVAJUS-${safeName}.pdf`)
    } catch {
      toast.error("Não foi possível gerar o PDF.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#1a384c]">
            Cotação — {precatoryName}
          </DialogTitle>
        </DialogHeader>

        {loadingTabela ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : !tabela ? null : (
          <div className="space-y-5">
            {/* Metadados */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              {tabela.defendant_name && (
                <span><span className="font-medium text-[#1a384c]">Devedor:</span> {tabela.defendant_name}</span>
              )}
              {tabela.data_base && (
                <span>
                  <span className="font-medium text-[#1a384c]">Valor base:</span>{" "}
                  {formatCents(tabela.valor_base_cents)}{" "}
                  <span className="text-xs text-gray-400">
                    em {new Date(tabela.data_base + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </span>
              )}
              {paymentForecastYear && (
                <span><span className="font-medium text-[#1a384c]">Previsão de pagamento:</span> {paymentForecastYear}</span>
              )}
            </div>

            <p className="text-xs text-gray-400">
              Clique em um valor para selecionar a faixa que irá na proposta. Clique novamente para desmarcar.
            </p>

            {/* Tabela de seleção */}
            <div className="space-y-4">
              {linhasExibidas.map((linha) => {
                const isForecast = paymentForecastYear === linha.ano
                return (
                <div key={linha.ano} className={cn(isForecast && "rounded-xl ring-2 ring-[#248A61]/40 p-3 -mx-1")}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {linha.label} · {linha.ano}
                    </p>
                    {isForecast && (
                      <span className="text-xs bg-[#248A61] text-white font-semibold px-2 py-0.5 rounded-full">
                        Previsão de pagamento
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {linha.faixas.map((faixa) => {
                      const isSelected = selected?.ano === linha.ano && selected.faixa.porcentagem === faixa.porcentagem
                      return (
                        <button
                          key={faixa.porcentagem}
                          onClick={() => selectCell(linha.ano, faixa)}
                          className={cn(
                            "rounded-xl border p-4 text-left transition-all",
                            isSelected
                              ? "border-[#248A61] bg-[#248A61]/5 ring-2 ring-[#248A61]/30"
                              : "border-gray-200 hover:border-[#248A61]/50 hover:bg-gray-50"
                          )}
                        >
                          <p className="text-xs font-semibold text-gray-400 mb-1">{faixa.porcentagem}%</p>
                          <p className={cn(
                            "text-base font-bold",
                            isSelected ? "text-[#248A61]" : "text-[#1a384c]"
                          )}>
                            {formatCents(faixa.valor_cents)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
                )
              })}
            </div>

            {/* Rodapé */}
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-gray-400">
                {selected
                  ? `Proposta: ${selected.ano} · ${selected.faixa.porcentagem}% · ${formatCents(selected.faixa.valor_cents)}`
                  : "Nenhuma faixa selecionada"}
              </p>
              <Button
                disabled={!selected || downloading}
                onClick={handleDownload}
                className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90 gap-2"
              >
                {downloading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <FileDown className="h-4 w-4" />}
                Baixar Proposta
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
