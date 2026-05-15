export const STATUS_LABELS: Record<string, string> = {
  em_negociacao: "Em Negociação",
  negociado: "Negociado",
  concluido: "Concluído",
  cancelado: "Cancelado",
}

export const STATUS_STYLES: Record<string, string> = {
  em_negociacao: "bg-yellow-100 text-yellow-800",
  negociado: "bg-indigo-100 text-indigo-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
}

export const PRECATORY_STATUS_OPTIONS = [
  { value: "em_negociacao", label: "Em Negociação" },
  { value: "negociado", label: "Negociado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
] as const
