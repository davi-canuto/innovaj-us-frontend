"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { organizationsService } from "@/services/organizations"
import { Organization, OrganizationUser } from "@/utils/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import FormOrganization from "@/components/forms/form-organization"
import { ArrowLeft, Pencil, Building2, Users, Calendar, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

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

function RoleBadge({ role }: { role: OrganizationUser["role"] }) {
  const isAdmin = role?.name === "admin"
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isAdmin ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}`}>
      {isAdmin ? "Admin" : "Membro"}
    </span>
  )
}

export default function OrganizationShowPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationUser[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [addingMember, setAddingMember] = useState(false)

  // Formulário de novo membro
  const [newUserId, setNewUserId] = useState("")
  const [newRoleId, setNewRoleId] = useState("")
  const [submittingMember, setSubmittingMember] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [orgData, membersData] = await Promise.all([
        organizationsService.getById(Number(id)),
        organizationsService.getMembers(Number(id)),
      ])
      setOrg(orgData)
      setMembers(Array.isArray(membersData) ? membersData : [])
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddMember() {
    if (!newUserId || !newRoleId) return
    setSubmittingMember(true)
    try {
      await organizationsService.addMember(Number(id), {
        user_id: Number(newUserId),
        role_id: Number(newRoleId),
      })
      toast.success("Membro adicionado com sucesso!")
      setAddingMember(false)
      setNewUserId("")
      setNewRoleId("")
      const membersData = await organizationsService.getMembers(Number(id))
      setMembers(Array.isArray(membersData) ? membersData : [])
    } catch {
      // erro já exibido pelo api.ts
    } finally {
      setSubmittingMember(false)
    }
  }

  async function handleRemoveMember(memberId: number, userName?: string) {
    if (!confirm(`Deseja remover ${userName ?? "este membro"} da organização?`)) return
    try {
      await organizationsService.removeMember(Number(id), memberId)
      toast.success("Membro removido com sucesso!")
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    } catch {
      // erro já exibido pelo api.ts
    }
  }

  if (loading) {
    return (
      <div className="border rounded-2xl p-6 bg-white flex items-center justify-center h-64">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (notFound || !org) {
    return (
      <div className="border rounded-2xl p-6 bg-white flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500 text-lg">Organização não encontrada.</p>
        <Button variant="outline" onClick={() => router.push("/organization/list")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a lista
        </Button>
      </div>
    )
  }

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
                onClick={() => router.push("/organization/list")}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Organizações
              </Button>
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-[#248A61]" strokeWidth={2.5} />
                <h1 className="text-2xl font-bold text-[#1a384c]">{org.name}</h1>
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

        {/* Identificação */}
        <Card className="border rounded-2xl bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
              <Building2 className="h-5 w-5 text-[#248A61]" />
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-4">
            <InfoRow label="Nome" value={org.name} />
            <InfoRow label="CNPJ" value={org.registration_number || "—"} />
          </CardContent>
        </Card>

        {/* Membros */}
        <Card className="border rounded-2xl bg-white">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
                <Users className="h-5 w-5 text-[#248A61]" />
                Membros ({members.length})
              </CardTitle>
              <Button
                size="sm"
                className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90"
                onClick={() => setAddingMember(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Membro
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2 px-0">
            {members.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhum membro cadastrado.</p>
            ) : (
              <Table>
                <TableHeader className="bg-[#FAFAFA]">
                  <TableRow>
                    <TableHead className="font-semibold text-[#1a384c] text-xs uppercase tracking-wide">Nome</TableHead>
                    <TableHead className="font-semibold text-[#1a384c] text-xs uppercase tracking-wide">E-mail</TableHead>
                    <TableHead className="font-semibold text-[#1a384c] text-xs uppercase tracking-wide">Role</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.user?.name ?? `Usuário #${member.user_id}`}</TableCell>
                      <TableCell>{member.user?.email ?? "—"}</TableCell>
                      <TableCell><RoleBadge role={member.role} /></TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleRemoveMember(member.id, member.user?.name)}
                          title="Remover membro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Datas */}
        <Card className="border rounded-2xl bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a384c]">
              <Calendar className="h-5 w-5 text-[#248A61]" />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-4">
            <InfoRow label="Cadastrado em" value={formatDate(org.created_at)} />
            <InfoRow label="Atualizado em" value={formatDate(org.updated_at)} />
          </CardContent>
        </Card>
      </div>

      {/* Dialog Editar Organização */}
      <Dialog open={editing} onOpenChange={(open) => { if (!open) setEditing(false) }}>
        <DialogContent className="w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="text-2xl font-semibold flex items-center gap-2 mb-2">
                <Building2 strokeWidth={3} className="text-[#248A61]" />
                <span className="text-[#1a384c]">Editar Organização</span>
              </div>
              <Separator className="my-3" />
            </DialogTitle>
          </DialogHeader>
          <FormOrganization
            defaultValues={org}
            onSuccess={() => {
              setEditing(false)
              load()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Membro */}
      <Dialog open={addingMember} onOpenChange={(open) => { if (!open) setAddingMember(false) }}>
        <DialogContent className="w-[90%] max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="text-2xl font-semibold flex items-center gap-2 mb-2">
                <UserPlus strokeWidth={3} className="text-[#248A61]" />
                <span className="text-[#1a384c]">Adicionar Membro</span>
              </div>
              <Separator className="my-3" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1a384c]">ID do Usuário *</label>
              <Input
                type="number"
                placeholder="Ex: 42"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1a384c]">Role *</label>
              <Select value={newRoleId} onValueChange={setNewRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">Membro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                className="bg-[#1a384c] text-white hover:bg-[#1a384c]/90"
                disabled={!newUserId || !newRoleId || submittingMember}
                onClick={handleAddMember}
              >
                {submittingMember ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
