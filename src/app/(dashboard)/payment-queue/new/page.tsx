"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { paymentQueuesService } from "@/services/paymentQueues"
import { defendantsService } from "@/services/defendants"
import { Defendant } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ListOrdered, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function PaymentQueueNewPage() {
  const router = useRouter()
  const [defendants, setDefendants] = useState<Defendant[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    defendant_id: "",
    description: "",
  })

  useEffect(() => {
    defendantsService.getAll()
      .then((r) => setDefendants(Array.isArray(r) ? r : []))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors: string[] = []
    if (!form.name.trim()) errors.push("Nome da fila")
    if (!form.year) errors.push("Ano")
    if (!form.defendant_id) errors.push("Devedor")
    if (errors.length > 0) {
      toast.error(`Campos obrigatórios: ${errors.join(", ")}`)
      return
    }
    setLoading(true)
    try {
      const result = await paymentQueuesService.create({
        name: form.name,
        year: parseInt(form.year),
        defendant_id: parseInt(form.defendant_id),
        description: form.description || undefined,
      })
      toast.success("Fila criada!")
      router.push(`/payment-queue/${result.id}`)
    } catch {
      toast.error("Erro ao criar fila")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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
        <div className="flex items-center gap-3">
          <ListOrdered className="h-7 w-7 text-[#248A61]" strokeWidth={2.5} />
          <h1 className="text-2xl font-bold text-[#1a384c]">Nova Fila de Pagamento</h1>
        </div>
      </div>

      <Card className="border rounded-2xl bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold text-[#1a384c]">Dados da Fila</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Nome da Fila *</label>
                <Input
                  placeholder="Ex: Lajes 2025 — Em Pagamento"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Ano *</label>
                <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o ano" /></SelectTrigger>
                  <SelectContent>
                    {[2026, 2025, 2024, 2023, 2022].map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Devedor *</label>
              <Select value={form.defendant_id} onValueChange={(v) => setForm({ ...form, defendant_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o devedor" /></SelectTrigger>
                <SelectContent>
                  {defendants.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
              <Input
                placeholder="Observações sobre esta fila"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#1a384c] text-white py-6 font-bold"
                disabled={loading}
              >
                {loading ? "Criando..." : "Criar Fila"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
