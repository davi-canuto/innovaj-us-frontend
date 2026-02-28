"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { petitionersService } from "@/services/petitioners"
import { Petitioner } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import FormPetitioner from "@/components/forms/form-petitioner"
import { ArrowLeft, Pencil, User, Phone, Calendar } from "lucide-react"

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR")
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-[#1a384c]">{value || "—"}</span>
    </div>
  )
}

export default function PetitionerShowPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [petitioner, setPetitioner] = useState<Petitioner | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await petitionersService.getById(Number(id))
      setPetitioner(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-center h-64">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (notFound || !petitioner) {
    return (
      <div className="border rounded-2xl p-6 bg-white flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500 text-lg">Credor não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/claimant/list")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const isPF = petitioner.person_type === "pf"
  const displayName = petitioner.company_name || petitioner.name

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
                onClick={() => router.push("/claimant/list")}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Credores
              </Button>
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-[#248A61]" strokeWidth={2.5} />
                <div>
                  <h1 className="text-2xl font-bold text-[#1a384c]">{displayName}</h1>
                  {petitioner.company_name && petitioner.name && (
                    <p className="text-sm text-gray-500 mt-0.5">{petitioner.name}</p>
                  )}
                </div>
                <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {isPF ? "Pessoa Física" : "Pessoa Jurídica"}
                </span>
                {petitioner.death_date && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    Falecido
                  </span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identificação */}
          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <User className="h-5 w-5 text-[#248A61]" />
                Identificação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-4">
              <InfoRow label={isPF ? "CPF" : "CNPJ"} value={petitioner.registration_number} />
              <InfoRow label="Tipo" value={isPF ? "Pessoa Física" : "Pessoa Jurídica"} />
              {petitioner.code && <InfoRow label="Código interno" value={petitioner.code} />}
              {petitioner.gender && (
                <InfoRow
                  label="Gênero"
                  value={{ male: "Masculino", female: "Feminino", other: "Outro" }[petitioner.gender]}
                />
              )}
            </CardContent>
          </Card>

          {/* Contato */}
          <Card className="border rounded-2xl bg-white">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <Phone className="h-5 w-5 text-[#248A61]" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 gap-4">
              <InfoRow label="E-mail" value={petitioner.email} />
              <InfoRow label="Telefone" value={petitioner.phone} />
            </CardContent>
          </Card>
        </div>

        {/* Datas */}
        <Card className="border rounded-2xl bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
              <Calendar className="h-5 w-5 text-[#248A61]" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {isPF && <InfoRow label="Nascimento" value={formatDate(petitioner.birth_date)} />}
            {isPF && petitioner.death_date && (
              <InfoRow label="Óbito" value={formatDate(petitioner.death_date)} />
            )}
            {petitioner.mother_name && <InfoRow label="Nome da mãe" value={petitioner.mother_name} />}
            {petitioner.father_name && <InfoRow label="Nome do pai" value={petitioner.father_name} />}
            <Separator className="col-span-2 md:col-span-4" />
            <InfoRow label="Cadastrado em" value={formatDate(petitioner.created_at)} />
            <InfoRow label="Atualizado em" value={formatDate(petitioner.updated_at)} />
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editing} onOpenChange={(open) => { if (!open) setEditing(false) }}>
        <DialogContent className="w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="text-2xl font-semibold flex items-center gap-2 mb-2">
                <User strokeWidth={3} className="text-[#248A61]" />
                <span className="text-[#1a384c]">Editar Credor</span>
              </div>
              <Separator className="my-3" />
            </DialogTitle>
          </DialogHeader>
          <FormPetitioner
            defaultValues={petitioner}
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
