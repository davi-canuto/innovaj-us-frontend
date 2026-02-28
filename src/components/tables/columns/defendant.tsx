"use client"

import { Button } from "@/components/ui/button"
import { Defendant } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { defendantsService } from "@/services/defendants"

export function columnsDefendant(): ColumnDef<Defendant>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome / Razão Social",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "registration_number",
      header: "CNPJ",
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const defendant = row.original

        const handleDelete = async (e: React.MouseEvent) => {
          e.stopPropagation()
          if (!confirm(`Deseja deletar "${defendant.name}"?`)) return
          try {
            await defendantsService.delete(defendant.id)
            toast.success("Devedor deletado com sucesso")
            window.location.reload()
          } catch {
            toast.error("Erro ao deletar devedor. Tente novamente.")
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
