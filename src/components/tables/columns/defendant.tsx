"use client"

import { Button } from "@/components/ui/button"
import { Defendant } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Edit, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { defendantsService } from "@/services/defendants"

export function columnsDefendant(onEdit: (defendant: Defendant) => void): ColumnDef<Defendant>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome / Razão Social",
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

        const handleDelete = async () => {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <span className="sr-only">Abrir menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(defendant)} className="cursor-pointer">
                Editar <Edit />
              </DropdownMenuItem>
              <hr />
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer">
                Deletar <Trash2 className="text-red-700" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
