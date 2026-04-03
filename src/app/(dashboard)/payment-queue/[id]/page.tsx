"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { paymentQueuesService } from "@/services/paymentQueues"
import { precatoriesService } from "@/services/precatories"
import { PaymentQueue, PaymentQueueEntry, Precatory } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  ListOrdered,
  ArrowLeft,
  Plus,
  Trash2,
  Search,
} from "lucide-react"

const PRIORITY_STYLES: Record<string, string> = {
  super: "bg-purple-100 text-purple-800",
  alimentar: "bg-blue-100 text-blue-800",
  comum: "bg-gray-100 text-gray-700",
}

const PRIORITY_LABELS: Record<string, string> = {
  super: "SUPER",
  alimentar: "ALIMENTAR",
  comum: "COMUM",
}

function formatCents(cents?: number | null) {
  if (cents == null || cents === 0) return "—"
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function PaymentQueueShowPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [queue, setQueue] = useState<PaymentQueue | null>(null)
  const [entries, setEntries] = useState<PaymentQueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [addingEntry, setAddingEntry] = useState(false)
  const [allPrecatories, setAllPrecatories] = useState<Precatory[]>([])
  const [search, setSearch] = useState("")
  const [selectedPrecatoryId, setSelectedPrecatoryId] = useState("")
  const [addingLoading, setAddingLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [queueData, entriesData] = await Promise.all([
        paymentQueuesService.getById(Number(id)),
        paymentQueuesService.getEntries(Number(id)),
      ])
      setQueue(queueData)
      setEntries(Array.isArray(entriesData) ? entriesData : [])
    } catch {
      toast.error("Erro ao carregar fila")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    precatoriesService.getAll()
      .then((r) => setAllPrecatories(Array.isArray(r) ? r : []))
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleAddEntry() {
    if (!selectedPrecatoryId) {
      toast.error("Selecione um precatório")
      return
    }
    setAddingLoading(true)
    try {
      await paymentQueuesService.addEntry(Number(id), {
        precatory_id: parseInt(selectedPrecatoryId),
        position: entries.length + 1,
      })
      toast.success("Precatório adicionado à fila")
      setAddingEntry(false)
      setSelectedPrecatoryId("")
      setSearch("")
      load()
    } catch {
      toast.error("Erro ao adicionar")
    } finally {
      setAddingLoading(false)
    }
  }

  async function handleRemoveEntry(entryId: number) {
    if (!confirm("Remover da fila?")) return
    try {
      await paymentQueuesService.removeEntry(Number(id), entryId)
      toast.success("Removido da fila")
      load()
    } catch {
      toast.error("Erro ao remover")
    }
  }

  async function handlePositionChange(entryId: number, newPosition: number) {
    try {
      await paymentQueuesService.updateEntry(Number(id), entryId, { position: newPosition })
      load()
    } catch {
      toast.error("Erro ao atualizar posição")
    }
  }

  const sortedEntries = [...entries].sort((a, b) => a.position - b.position)

  const filteredPrecatories = allPrecatories.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.number?.toLowerCase().includes(q) ||
      p.document_number?.toLowerCase().includes(q)
    )
  })

  const alreadyInQueue = new Set(entries.map((e) => e.precatory_id))

  if (loading) {
    return (
      <div className="border rounded-2xl p-12 bg-white flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!queue) {
    return (
      <div className="border rounded-2xl p-12 bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Fila não encontrada.</p>
        <Button variant="outline" onClick={() => router.push("/payment-queue")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="border rounded-2xl p-6 bg-white">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-[#1a384c] -ml-2 mb-4"
            onClick={() => router.push("/payment-queue")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Filas de Pagamento
          </Button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ListOrdered className="h-7 w-7 text-[#248A61]" strokeWidth={2.5} />
              <div>
                <h1 className="text-2xl font-bold text-[#1a384c]">{queue.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">Ano: {queue.year} · {sortedEntries.length} precatórios</p>
              </div>
            </div>
            <Button
              className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90"
              onClick={() => setAddingEntry(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Precatório
            </Button>
          </div>
          {queue.description && (
            <p className="text-sm text-gray-500 mt-3">{queue.description}</p>
          )}
        </div>

        {/* Tabela */}
        <Card className="border rounded-2xl bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-semibold text-[#1a384c]">
              Lista Ordem Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {sortedEntries.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
                <ListOrdered className="h-10 w-10" />
                <p>Nenhum precatório nesta fila.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium w-20">Posição</th>
                      <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Credor</th>
                      <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Natureza</th>
                      <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Data Autuação</th>
                      <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Processo Adm.</th>
                      <th className="text-right py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor Atual</th>
                      <th className="text-left py-3 pr-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Prioridade</th>
                      <th className="py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEntries.map((entry) => {
                      const p = entry.precatory
                      const priorityLevel = p?.priority_level ?? "comum"
                      const lastValue = p?.last_value_history
                      return (
                        <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 pr-3">
                            <Input
                              type="number"
                              className="w-16 h-8 text-center"
                              defaultValue={entry.position}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val !== entry.position) {
                                  handlePositionChange(entry.id, val)
                                }
                              }}
                            />
                          </td>
                          <td className="py-3 pr-3">
                            <button
                              className="text-left hover:underline text-[#1a384c] font-medium"
                              onClick={() => router.push(`/precatory/${entry.precatory_id}`)}
                            >
                              {p?.petitioner?.name ?? p?.name ?? `Precatório #${entry.precatory_id}`}
                            </button>
                          </td>
                          <td className="py-3 pr-3 text-gray-600">{p?.nature_of_credit ?? "—"}</td>
                          <td className="py-3 pr-3 text-gray-600">{formatDate(p?.filing_date)}</td>
                          <td className="py-3 pr-3 text-gray-600">{p?.administrative_process ?? "—"}</td>
                          <td className="py-3 pr-3 text-right font-semibold text-[#248A61]">
                            {lastValue ? formatCents(lastValue.amount_cents) : formatCents(p?.requested_amount)}
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${PRIORITY_STYLES[priorityLevel]}`}>
                              {PRIORITY_LABELS[priorityLevel]}
                            </span>
                          </td>
                          <td className="py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-400 hover:text-red-600"
                              onClick={() => handleRemoveEntry(entry.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* Dialog adicionar precatório */}
      <Dialog open={addingEntry} onOpenChange={setAddingEntry}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#1a384c]">Adicionar Precatório à Fila</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border rounded-lg px-3">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                className="flex-1 py-2 text-sm outline-none bg-transparent"
                placeholder="Buscar por nome, número ou documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={selectedPrecatoryId} onValueChange={setSelectedPrecatoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o precatório" />
              </SelectTrigger>
              <SelectContent>
                {filteredPrecatories
                  .filter((p) => !alreadyInQueue.has(p.id))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} {p.number ? `· ${p.number}` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddingEntry(false)}>Cancelar</Button>
              <Button
                className="bg-[#1a384c] text-white"
                onClick={handleAddEntry}
                disabled={addingLoading}
              >
                {addingLoading ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
