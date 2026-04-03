"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { paymentQueuesService } from "@/services/paymentQueues"
import { PaymentQueue } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListOrdered, Plus, Trash2, Calendar, Landmark } from "lucide-react"
import { toast } from "sonner"

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function PaymentQueueListPage() {
  const router = useRouter()
  const [queues, setQueues] = useState<PaymentQueue[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const data = await paymentQueuesService.getAll()
      setQueues(Array.isArray(data) ? data : [])
    } catch {
      setQueues([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("Excluir esta fila?")) return
    try {
      await paymentQueuesService.delete(id)
      toast.success("Fila removida")
      load()
    } catch {
      toast.error("Erro ao remover fila")
    }
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListOrdered className="h-7 w-7 text-[#248A61]" strokeWidth={2.5} />
          <div>
            <h1 className="text-2xl font-bold text-[#1a384c]">Filas de Pagamento</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gerencie a ordem de prioridade por devedor</p>
          </div>
        </div>
        <Button
          className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90"
          onClick={() => router.push("/payment-queue/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Fila
        </Button>
      </div>

      {loading ? (
        <div className="border rounded-2xl p-12 bg-white flex items-center justify-center">
          <p className="text-gray-400">Carregando...</p>
        </div>
      ) : queues.length === 0 ? (
        <div className="border rounded-2xl p-12 bg-white flex flex-col items-center justify-center gap-4">
          <ListOrdered className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Nenhuma fila cadastrada ainda.</p>
          <Button
            variant="outline"
            onClick={() => router.push("/payment-queue/new")}
          >
            Criar primeira fila
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queues.map((q) => (
            <Card
              key={q.id}
              className="border rounded-2xl bg-white cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/payment-queue/${q.id}`)}
            >
              <CardHeader className="border-b pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-[#1a384c] leading-tight">{q.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-600 shrink-0"
                    onClick={(e) => handleDelete(q.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>Ano: <strong>{q.year}</strong></span>
                </div>
                {q.defendant && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Landmark className="h-3.5 w-3.5 text-gray-400" />
                    <span>{q.defendant.name}</span>
                  </div>
                )}
                {q.description && (
                  <p className="text-xs text-gray-400 mt-1">{q.description}</p>
                )}
                <p className="text-xs text-gray-400">Criado em {formatDate(q.created_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
