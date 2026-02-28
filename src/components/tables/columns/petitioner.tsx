"use client"

import { Button } from "@/components/ui/button"
import { Petitioner } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { petitionersService } from "@/services/petitioners"

export function columnsPetitioner(): ColumnDef<Petitioner>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome / Empresa",
      cell: ({ row }) => {
        const petitioner = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{petitioner.company_name || petitioner.name}</span>
            {petitioner.company_name && petitioner.name && (
              <span className="text-xs text-gray-400">{petitioner.name}</span>
            )}
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

        const handleDelete = async (e: React.MouseEvent) => {
          e.stopPropagation()
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
