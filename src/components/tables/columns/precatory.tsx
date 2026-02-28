"use client"

import { Button } from "@/components/ui/button"
import { Precatory } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { precatoriesService } from "@/services/precatories"

function PrecatoryActions({
  precatory,
  onEdit,
}: {
  precatory: Precatory
  onEdit: (p: Precatory) => void
}) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Deseja deletar ${precatory.name}?`)) return
    try {
      await precatoriesService.delete(precatory.id)
      toast.success("Precatório deletado com sucesso")
      window.location.reload()
    } catch {
      toast.error("Erro ao deletar precatório. Tente novamente.")
    }
  }

  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
        onClick={(e) => { e.stopPropagation(); onEdit(precatory) }}
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </Button>
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
}

export function columnsPrecatory(onEdit: (precatory: Precatory) => void): ColumnDef<Precatory>[] {
  return [
    {
      accessorKey: "name",
      header: "Favorecido",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "requested_amount",
      header: "Valor Requerido",
      cell: ({ row }) => (
        <span>
          R$ {row.original.requested_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: "stage",
      header: "Etapa",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <PrecatoryActions precatory={row.original} onEdit={onEdit} />,
    },
  ]
}
