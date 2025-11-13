"use client"

import { Button } from "@/components/ui/button"
import { Precatory } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Edit, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columnsPrecatory: ColumnDef<Precatory>[] = [
  {
    accessorKey: "name",
    header: "Favorecido",
    cell: ({ row }) => {
      const precatory = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{precatory.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "requested_amount",
    header: "Valor Requerido",
    cell: ({ row }) => {
      const precatory = row.original
      return <span>R$ {precatory.requested_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
    },
  },
  {
    accessorKey: "stage",
    header: "Etapa",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const precatory = row.original
      const handleDelete = async () => {
        if (confirm(`Deseja deletar ${precatory.name}?`)) {
          await fetch(`/api/precatories/${precatory.id}`, { method: "DELETE" })
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
