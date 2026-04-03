"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { precatoriesService } from "@/services/precatories"
import { petitionersService } from "@/services/petitioners"
import { defendantsService } from "@/services/defendants"
import { valueHistoriesService } from "@/services/valueHistories"
import { Precatory, Petitioner, Defendant, PrecatoryValueHistory } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PrecatoryForm from "@/components/forms/precatory"
import { toast } from "sonner"
import {
  CircleDollarSign,
  ArrowLeft,
  Pencil,
  User,
  Landmark,
  Calendar,
  FileText,
  DollarSign,
  History,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react"

const INCLUSION_SOURCE_LABELS: Record<string, string> = {
  court_order: "Ordem Judicial",
  rpv_conversion: "Conversão de RPV",
  administrative_request: "Requisição Administrativa",
  system_generated: "Gerado pelo Sistema",
}

const STAGE_STYLES: Record<string, string> = {
  "Em andamento": "bg-yellow-100 text-yellow-800",
  "Concluído": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
  "Pendente": "bg-gray-100 text-gray-700",
}

const PRIORITY_STYLES: Record<string, string> = {
  super: "bg-purple-100 text-purple-800",
  alimentar: "bg-blue-100 text-blue-800",
  comum: "bg-gray-100 text-gray-700",
}

const PRIORITY_LABELS: Record<string, string> = {
  super: "Superprioridade",
  alimentar: "Alimentar",
  comum: "Comum",
}

function formatCurrency(value?: number | null) {
  if (value == null) return "—"
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatCents(cents?: number | null) {
  if (cents == null || cents === 0) return "—"
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR")
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-[#1a384c]">{value || "—"}</span>
    </div>
  )
}

function ValueHistorySection({ precatoryId }: { precatoryId: number }) {
  const [histories, setHistories] = useState<PrecatoryValueHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newDate, setNewDate] = useState<Date | undefined>(new Date())
  const [newAmount, setNewAmount] = useState("")
  const [newNotes, setNewNotes] = useState("")

  async function loadHistories() {
    setLoading(true)
    try {
      const data = await valueHistoriesService.getAll(precatoryId)
      setHistories(Array.isArray(data) ? data : [])
    } catch {
      setHistories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precatoryId])

  async function handleAdd() {
    if (!newDate || !newAmount) {
      toast.error("Data e valor são obrigatórios")
      return
    }
    setSubmitting(true)
    try {
      await valueHistoriesService.create(precatoryId, {
        reference_date: newDate.toISOString().split('T')[0],
        amount_cents: Math.round(parseFloat(newAmount) * 100),
        notes: newNotes || undefined,
      })
      toast.success("Valor registrado!")
      setAdding(false)
      setNewDate(new Date())
      setNewAmount("")
      setNewNotes("")
      loadHistories()
    } catch {
      toast.error("Erro ao registrar valor")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(historyId: number) {
    try {
      await valueHistoriesService.delete(precatoryId, historyId)
      toast.success("Registro removido")
      loadHistories()
    } catch {
      toast.error("Erro ao remover registro")
    }
  }

  const sorted = [...histories].sort(
    (a, b) => new Date(b.reference_date).getTime() - new Date(a.reference_date).getTime()
  )
  const latest = sorted[0]

  return (
    <Card className="border rounded-2xl bg-white">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
            <History className="h-5 w-5 text-[#248A61]" />
            Histórico de Valores
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Registrar valor
          </Button>
        </div>
        {latest && (
          <div className="mt-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#248A61]" />
            <span className="text-sm text-gray-500">Valor mais recente ({formatDate(latest.reference_date)}):</span>
            <span className="text-base font-bold text-[#248A61]">{formatCents(latest.amount_cents)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {adding && (
          <div className="mb-4 p-4 border rounded-xl bg-gray-50 space-y-3">
            <p className="text-sm font-medium text-[#1a384c]">Novo registro de valor</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Data de Referência</label>
                <DatePicker selected={newDate} onSelect={setNewDate} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Valor (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Observações</label>
                <Input
                  placeholder="Opcional"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancelar</Button>
              <Button
                size="sm"
                className="bg-[#1a384c] text-white"
                onClick={handleAdd}
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Carregando histórico...</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Nenhum valor registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Data</th>
                  <th className="text-right py-2 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Valor</th>
                  <th className="text-left py-2 pr-4 text-xs text-gray-500 uppercase tracking-wide font-medium">Observações</th>
                  <th className="py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((h, i) => (
                  <tr key={h.id} className={`border-b last:border-0 ${i === 0 ? "bg-green-50" : ""}`}>
                    <td className="py-2 pr-4 font-medium text-[#1a384c]">{formatDate(h.reference_date)}</td>
                    <td className="py-2 pr-4 text-right font-semibold text-[#248A61]">{formatCents(h.amount_cents)}</td>
                    <td className="py-2 pr-4 text-gray-500">{h.notes || "—"}</td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(h.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
  )
}

export default function PrecatoryShowPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [precatory, setPrecatory] = useState<Precatory | null>(null)
  const [petitioner, setPetitioner] = useState<Petitioner | null>(null)
  const [defendant, setDefendant] = useState<Defendant | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await precatoriesService.getById(Number(id))
      setPrecatory(data)

      if (data.petitioner_id) {
        petitionersService.getById(data.petitioner_id).then(setPetitioner).catch(() => {})
      }
      if (data.defendant_id) {
        defendantsService.getById(data.defendant_id).then(setDefendant).catch(() => {})
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-center h-64">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (notFound || !precatory) {
    return (
      <div className="border rounded-2xl p-6 bg-white flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500 text-lg">Precatório não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/precatory/list")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const stageStyle = STAGE_STYLES[precatory.stage] ?? "bg-gray-100 text-gray-700"

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="border rounded-2xl p-6 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit text-gray-500 hover:text-[#1a384c] -ml-2"
                onClick={() => router.push("/precatory/list")}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Precatórios
              </Button>
              <div className="flex items-center gap-3 flex-wrap">
                <CircleDollarSign className="h-8 w-8 text-[#248A61]" strokeWidth={2.5} />
                <div>
                  <h1 className="text-2xl font-bold text-[#1a384c]">{precatory.name}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Nº {precatory.number || "—"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stageStyle}`}>
                  {precatory.stage}
                </span>
                {precatory.priority_level && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_STYLES[precatory.priority_level]}`}>
                    {PRIORITY_LABELS[precatory.priority_level]}
                  </span>
                )}
                {precatory.is_rpv && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">RPV</span>
                )}
                {precatory.is_negotiated && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Negociado</span>
                )}
              </div>
            </div>
            <Button
              className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90 shrink-0"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Histórico de Valores */}
        <ValueHistorySection precatoryId={Number(id)} />

        {/* Valores */}
        <Card className="border rounded-2xl bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
              <DollarSign className="h-5 w-5 text-[#248A61]" />
              Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Valor Requerido</span>
                <span className="text-xl font-bold text-[#248A61]">
                  {formatCents(precatory.requested_amount)}
                </span>
              </div>
              <InfoRow label="Principal" value={formatCents(precatory.value_principal_cents)} />
              <InfoRow label="Juros" value={formatCents(precatory.value_interest_cents)} />
              <InfoRow label="Custas" value={formatCents(precatory.value_costs_cents)} />
            </div>
            {(precatory.fee_percentage != null || precatory.has_contract != null) && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {precatory.fee_percentage != null && (
                    <InfoRow label="Honorários (%)" value={`${precatory.fee_percentage}%`} />
                  )}
                  <InfoRow label="Contrato" value={precatory.has_contract ? "Sim" : "Não"} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* RPV — só mostra se is_rpv */}
        {precatory.is_rpv && (
          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <CircleDollarSign className="h-5 w-5 text-orange-500" />
                Dados da RPV
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <InfoRow label="Valor a Pagar" value={formatCents(precatory.rpv_amount_cents)} />
                <InfoRow label="H. Sucumbência" value={formatCents(precatory.succumbence_fee_cents)} />
                <InfoRow label="H. Contratuais" value={formatCents(precatory.contractual_fee_cents)} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Negociação — só mostra se is_negotiated */}
        {precatory.is_negotiated && (
          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Dados da Negociação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InfoRow label="Valor Negociado" value={formatCents(precatory.negotiated_amount_cents)} />
                <InfoRow label="Desembolso" value={formatCents(precatory.disbursement_cents)} />
                <InfoRow label="Custas" value={formatCents(precatory.costs_cents)} />
                <InfoRow label="Valor Atual" value={formatCents(precatory.current_value_cents)} />
              </div>
              {precatory.payment_forecast_date && (
                <>
                  <Separator className="my-4" />
                  <InfoRow label="Previsão de Pagamento" value={formatDate(precatory.payment_forecast_date)} />
                </>
              )}
              {precatory.disbursement_cents && precatory.current_value_cents && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Lucro Estimado</span>
                      <span className="text-base font-bold text-[#248A61]">
                        {formatCents(
                          precatory.current_value_cents -
                          precatory.disbursement_cents -
                          (precatory.costs_cents ?? 0)
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Partes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <User className="h-5 w-5 text-[#248A61]" />
                Credor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {petitioner ? (
                <>
                  <InfoRow label="Nome" value={petitioner.company_name || petitioner.name} />
                  <InfoRow label="CPF / CNPJ" value={petitioner.registration_number} />
                  {petitioner.birth_date && <InfoRow label="Data de Nascimento" value={formatDate(petitioner.birth_date)} />}
                  {petitioner.email && <InfoRow label="E-mail" value={petitioner.email} />}
                  {petitioner.phone && <InfoRow label="Telefone" value={petitioner.phone} />}
                </>
              ) : (
                <p className="text-sm text-gray-400">Nenhum credor vinculado</p>
              )}
            </CardContent>
          </Card>

          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <Landmark className="h-5 w-5 text-[#248A61]" />
                Devedor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {defendant ? (
                <>
                  <InfoRow label="Nome" value={defendant.name} />
                  {defendant.registration_number && (
                    <InfoRow label="CNPJ" value={defendant.registration_number} />
                  )}
                  {defendant.email && <InfoRow label="E-mail" value={defendant.email} />}
                  {defendant.phone && <InfoRow label="Telefone" value={defendant.phone} />}
                </>
              ) : (
                <p className="text-sm text-gray-400">Nenhum devedor vinculado</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Identificação + Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <FileText className="h-5 w-5 text-[#248A61]" />
                Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-4">
              <InfoRow label="Número" value={precatory.number} />
              <InfoRow label="Origem" value={precatory.origin} />
              <InfoRow label="Nº Documento" value={precatory.document_number} />
              <InfoRow label="Ano da Proposta" value={precatory.proposal_year?.toString()} />
              <InfoRow
                label="Fonte de Inclusão"
                value={INCLUSION_SOURCE_LABELS[precatory.inclusion_source] ?? precatory.inclusion_source}
              />
              <InfoRow label="Natureza do Crédito" value={precatory.nature_of_credit ?? "—"} />
              {precatory.administrative_process && (
                <InfoRow label="Processo Adm." value={precatory.administrative_process} />
              )}
              {precatory.pje_process && (
                <InfoRow label="Processo PJE 2º" value={precatory.pje_process} />
              )}
            </CardContent>
          </Card>

          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <Calendar className="h-5 w-5 text-[#248A61]" />
                Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 gap-4">
              <InfoRow label="Data do Protocolo" value={formatDate(precatory.protocol_date)} />
              {precatory.filing_date && (
                <InfoRow label="Data de Autuação" value={formatDate(precatory.filing_date)} />
              )}
              <InfoRow label="Data-base de Atualização" value={formatDate(precatory.base_date_update)} />
              <InfoRow label="Trânsito em Julgado" value={formatDate(precatory.judgment_date)} />
              {precatory.payment_forecast_date && (
                <InfoRow label="Previsão de Pagamento" value={formatDate(precatory.payment_forecast_date)} />
              )}
              <Separator />
              <InfoRow label="Criado em" value={formatDate(precatory.created_at)} />
              <InfoRow label="Atualizado em" value={formatDate(precatory.updated_at)} />
            </CardContent>
          </Card>
        </div>

        {/* Observações */}
        {precatory.remarks && (
          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold text-[#1a384c]">Observações</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{precatory.remarks}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editing} onOpenChange={(open) => { if (!open) setEditing(false) }}>
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
          <PrecatoryForm
            defaultValues={precatory}
            onSuccess={() => {
              setEditing(false)
              load()
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
