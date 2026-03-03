"use client"

import { Button } from "@/components/ui/button"
import { Organization } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { organizationsService } from "@/services/organizations"

export function columnsOrganization(): ColumnDef<Organization>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "registration_number",
      header: "CNPJ",
      cell: ({ row }) => <span>{row.original.registration_number || "—"}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Criado em",
      cell: ({ row }) => (
        <span>{new Date(row.original.created_at).toLocaleDateString("pt-BR")}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const org = row.original

        const handleDelete = async (e: React.MouseEvent) => {
          e.stopPropagation()
          if (!confirm(`Deseja deletar "${org.name}"?`)) return
          try {
            await organizationsService.delete(org.id)
            toast.success("Organização deletada com sucesso")
            window.location.reload()
          } catch {
            toast.error("Erro ao deletar organização. Tente novamente.")
          }
        }

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              onClick={handleDelete}
              title="Deletar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
