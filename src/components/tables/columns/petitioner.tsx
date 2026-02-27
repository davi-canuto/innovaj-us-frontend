"use client"

import { Button } from "@/components/ui/button"
import { Petitioner } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Edit, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { petitionersService } from "@/services/petitioners"

export function columnsPetitioner(onEdit: (petitioner: Petitioner) => void): ColumnDef<Petitioner>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome / Empresa",
      cell: ({ row }) => {
        const petitioner = row.original
        const displayName = petitioner.company_name || petitioner.name
        return (
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "registration_number",
      header: "CPF / CNPJ",
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const petitioner = row.original

        const handleDelete = async () => {
          if (!confirm(`Deseja deletar ${petitioner.name}?`)) return
          try {
            await petitionersService.delete(petitioner.id)
            toast.success("Credor deletado com sucesso")
            window.location.reload()
          } catch {
            toast.error("Erro ao deletar credor. Tente novamente.")
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
              <DropdownMenuItem onClick={() => onEdit(petitioner)} className="cursor-pointer">
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
