"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { precatoriesService } from "@/services/precatories"
import { petitionersService } from "@/services/petitioners"
import { defendantsService } from "@/services/defendants"
import { Precatory, Petitioner, Defendant } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import PrecatoryForm from "@/components/forms/precatory"
import {
  CircleDollarSign,
  ArrowLeft,
  Pencil,
  User,
  Landmark,
  Calendar,
  FileText,
  DollarSign,
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
              <div className="flex items-center gap-3">
                <CircleDollarSign className="h-8 w-8 text-[#248A61]" strokeWidth={2.5} />
                <div>
                  <h1 className="text-2xl font-bold text-[#1a384c]">{precatory.name}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Nº {precatory.number || "—"}</p>
                </div>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${stageStyle}`}>
                  {precatory.stage}
                </span>
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
                  {formatCurrency(precatory.requested_amount)}
                </span>
              </div>
              <InfoRow label="Principal" value={formatCents(precatory.value_principal_cents)} />
              <InfoRow label="Juros" value={formatCents(precatory.value_interest_cents)} />
              <InfoRow label="Custas" value={formatCents(precatory.value_costs_cents)} />
            </div>
          </CardContent>
        </Card>

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
              <InfoRow
                label="Natureza do Crédito"
                value={precatory.nature_of_credit ?? "—"}
              />
              {precatory.request_type && (
                <InfoRow label="Tipo de Requisição" value={precatory.request_type} />
              )}
              {precatory.payment_type && (
                <InfoRow label="Tipo de Pagamento" value={precatory.payment_type} />
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
              <InfoRow label="Data-base de Atualização" value={formatDate(precatory.base_date_update)} />
              <InfoRow label="Trânsito em Julgado" value={formatDate(precatory.judgment_date)} />
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
