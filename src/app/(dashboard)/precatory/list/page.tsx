"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { columnsPrecatory } from "@/components/tables/columns/precatory"
import { DataTable } from "@/components/tables/dataTable"
import { CircleDollarSign, Plus, Clock, CheckCircle2, ListFilter } from "lucide-react"
import { Precatory } from "@/utils/types"
import PrecatoryForm from "@/components/forms/precatory"
import { precatoriesService } from "@/services/precatories"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PdfUploadButton } from "@/components/layout/pdf-upload-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { AttachmentsPanel } from "@/components/precatory/AttachmentsPanel"

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function ListPrecatory() {
  const router = useRouter()
  const [data, setData] = useState<Precatory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPrecatory, setEditingPrecatory] = useState<Precatory | null>(null)
  const [attachmentsPrecatory, setAttachmentsPrecatory] = useState<Precatory | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await precatoriesService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const columns = columnsPrecatory(setEditingPrecatory, fetchData, setAttachmentsPrecatory)

  const emNegociacao = data.filter(p => p.stage?.toLowerCase().includes("andamento") || p.stage?.toLowerCase().includes("negociacao") || p.stage?.toLowerCase().includes("negociação") || p.status === "em_negociacao").length
  const concluidos  = data.filter(p => p.stage?.toLowerCase().includes("conclu")).length
  const valorTotal  = data.reduce((s, p) => s + (p.requested_amount ?? 0), 0)

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="border rounded-2xl p-6 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-8 w-8 text-[#248A61]" strokeWidth={2} />
            <div>
              <h1 className="text-2xl font-bold text-[#1a384c]">Precatórios</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? "Carregando..." : `${data.length} precatório${data.length !== 1 ? "s" : ""} cadastrado${data.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PdfUploadButton onSuccess={fetchData} />
            <Link href="/precatory/new">
              <Button className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90 gap-2">
                <Plus className="h-4 w-4" />
                Novo Precatório
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de resumo */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-[#248A61]/10 rounded-lg">
                <ListFilter className="h-5 w-5 text-[#248A61]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-[#1a384c]">{data.length}</p>
              </div>
            </div>
            <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Em Negociação</p>
                <p className="text-xl font-bold text-yellow-600">{emNegociacao}</p>
              </div>
            </div>
            <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Concluídos</p>
                <p className="text-xl font-bold text-emerald-600">{concluidos}</p>
              </div>
            </div>
            <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-[#248A61]/10 rounded-lg">
                <CircleDollarSign className="h-5 w-5 text-[#248A61]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Valor Total</p>
                <p className="text-base font-bold text-[#248A61]">{formatCents(valorTotal)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="border rounded-2xl bg-white">
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-base font-semibold text-[#1a384c]">Lista de Precatórios</h2>
          </div>
          <div className="px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-400">Carregando...</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={data}
                filterPlaceholder="Buscar por nome, número..."
                onRowClick={(row) => router.push(`/precatory/${row.id}`)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Painel de anexos */}
      {attachmentsPrecatory && (
        <AttachmentsPanel
          precatoryId={attachmentsPrecatory.id}
          precatoryName={attachmentsPrecatory.name}
          open={!!attachmentsPrecatory}
          onClose={() => setAttachmentsPrecatory(null)}
        />
      )}

      {/* Dialog edição */}
      <Dialog
        open={!!editingPrecatory}
        onOpenChange={(open) => { if (!open) setEditingPrecatory(null) }}
      >
        <DialogContent className="w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="text-2xl font-semibold flex items-center gap-2 mb-2">
                <CircleDollarSign strokeWidth={3} className="text-[#248A61]" />
                <span className="text-[#1a384c]">Editar Precatório</span>
              </div>
              <Separator className="my-3" />
            </DialogTitle>
          </DialogHeader>
          {editingPrecatory && (
            <PrecatoryForm
              defaultValues={editingPrecatory}
              onSuccess={() => {
                setEditingPrecatory(null)
                fetchData()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
