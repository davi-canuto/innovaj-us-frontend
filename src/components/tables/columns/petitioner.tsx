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

export const columnsPetitioner: ColumnDef<Petitioner>[] = [

  {
    accessorKey: "name",
    header: "Nome / Empresa",
    cell: ({ row }) => {
      const petitioner = row.original
      const displayName =
        petitioner.company_name ||
        petitioner.name

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
        if (confirm(`Deseja deletar ${petitioner.name}?`)) {
          try {
            const response = await fetch(`/api/petitioners/${petitioner.id}`, {
              method: "DELETE",
              credentials: 'include'
            })

            if (!response.ok) {
              if (response.status === 401) {
                toast.error("Sessão expirada. Faça login novamente.")
                setTimeout(() => {
                  window.location.href = '/login'
                }, 1500)
                return
              }

              const error = await response.json().catch(() => ({ message: "Erro ao deletar" }))
              toast.error(error.message || "Erro ao deletar requerente")
              return
            }

            toast.success("Requerente deletado com sucesso")
            window.location.reload()
          } catch (error) {
            toast.error("Erro ao deletar requerente. Tente novamente.")
          }
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
            <DropdownMenuItem className="cursor-pointer">Editar <Edit /></DropdownMenuItem>
            <hr></hr>
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer"> Deletar <Trash2 className="text-red-700" /></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
]
