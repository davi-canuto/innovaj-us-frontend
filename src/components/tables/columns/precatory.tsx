"use client"

import { Button } from "@/components/ui/button"
import { Precatory } from "@/utils/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2, Pencil, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"
import { precatoriesService } from "@/services/precatories"

const STAGE_STYLES: Record<string, string> = {
  "Em andamento": "bg-yellow-100 text-yellow-800",
  "Concluído":    "bg-emerald-100 text-emerald-800",
  "Cancelado":    "bg-red-100 text-red-800",
  "Pendente":     "bg-gray-100 text-gray-600",
}

const PRIORITY_STYLES: Record<string, string> = {
  super:     "bg-purple-100 text-purple-800",
  alimentar: "bg-blue-100 text-blue-800",
  comum:     "bg-gray-100 text-gray-600",
}

const PRIORITY_LABELS: Record<string, string> = {
  super:     "Super",
  alimentar: "Alimentar",
  comum:     "Comum",
}

function formatCents(cents?: number | null) {
  if (cents == null || cents === 0) return "—"
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function PrecatoryActions({
  precatory,
  onEdit,
  onDeleted,
}: {
  precatory: Precatory
  onEdit: (p: Precatory) => void
  onDeleted: () => void
}) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Deseja deletar "${precatory.name}"?`)) return
    try {
      await precatoriesService.delete(precatory.id)
      toast.success("Precatório deletado com sucesso")
      onDeleted()
    } catch {
      toast.error("Erro ao deletar precatório.")
    }
  }

  return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
        onClick={(e) => { e.stopPropagation(); onEdit(precatory) }}
        title="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
        onClick={handleDelete}
        title="Deletar"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export function columnsPrecatory(
  onEdit: (precatory: Precatory) => void,
  onDeleted?: () => void,
): ColumnDef<Precatory>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-[#248A61]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Precatório
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex flex-col gap-1 py-0.5">
            <span className="font-semibold text-[#1a384c]">{p.name}</span>
            {p.number && (
              <span className="text-xs text-gray-400 font-mono">{p.number}</span>
            )}
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {p.is_rpv && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">RPV</span>
              )}
              {p.is_negotiated && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">Negociado</span>
              )}
              {p.priority_level && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${PRIORITY_STYLES[p.priority_level]}`}>
                  {PRIORITY_LABELS[p.priority_level]}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: "parties",
      header: "Credor / Devedor",
      cell: ({ row }) => {
        const p = row.original
        const petitioner = p.petitioner
        const defendant = p.defendant
        if (!petitioner && !defendant) return <span className="text-gray-400 text-sm">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {petitioner && (
              <span className="text-sm text-[#1a384c] font-medium">{petitioner.name || petitioner.company_name}</span>
            )}
            {defendant && (
              <span className="text-xs text-gray-500">{defendant.name}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "requested_amount",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-[#248A61]"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const p = row.original
        const lastValue = p.last_value_history
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[#248A61]">
              {formatCents(p.requested_amount)}
            </span>
            {lastValue && (
              <span className="text-xs text-gray-400">
                Atual: {formatCents(lastValue.amount_cents)}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "filing_date",
      header: "Autuação",
      cell: ({ row }) => {
        const d = row.original.filing_date || row.original.protocol_date
        if (!d) return <span className="text-gray-400">—</span>
        return (
          <span className="text-sm text-gray-600">
            {new Date(d).toLocaleDateString("pt-BR")}
          </span>
        )
      },
    },
    {
      accessorKey: "stage",
      header: "Estágio",
      cell: ({ row }) => {
        const stage = row.original.stage
        const style = STAGE_STYLES[stage] ?? "bg-gray-100 text-gray-600"
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${style}`}>
            {stage || "—"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <PrecatoryActions
          precatory={row.original}
          onEdit={onEdit}
          onDeleted={onDeleted ?? (() => window.location.reload())}
        />
      ),
    },
  ]
}
