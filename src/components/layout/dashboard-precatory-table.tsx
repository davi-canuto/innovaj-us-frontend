"use client"

import { columnsPrecatory } from "@/components/tables/columns/precatory"
import { DataTable } from "@/components/tables/dataTable"
import { Precatory } from "@/utils/types"

export function DashboardPrecatoryTable({ data }: { data: Precatory[] }) {
  // No dashboard a edição não é suportada — onEdit é no-op
  const columns = columnsPrecatory(() => {})
  return <DataTable columns={columns} data={data} />
}
