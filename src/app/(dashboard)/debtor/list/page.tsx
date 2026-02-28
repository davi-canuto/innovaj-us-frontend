"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/tables/dataTable"
import { columnsDefendant } from "@/components/tables/columns/defendant"
import { Defendant } from "@/utils/types"
import { defendantsService } from "@/services/defendants"
import { AppDialog } from "@/components/layout/app-dialog"
import FormDebtor from "@/components/forms/form-debtor"
import { Landmark } from "lucide-react"

export default function ListDefendants() {
  const router = useRouter()
  const [data, setData] = useState<Defendant[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await defendantsService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const columns = columnsDefendant()

  return (
    <div className="border rounded-2xl p-6 bg-white">
      <section className="mx-auto lg:max-w-[90%]">
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-semibold flex items-center space-x-2">
            <Landmark strokeWidth={3} className="text-[#248A61]" />
            <h1 className="text-[#1a384c]">Devedores</h1>
          </div>
          <AppDialog
            title="Novo Devedor"
            trigger="Novo Devedor"
            content={<FormDebtor onSuccess={fetchData} />}
          />
        </div>
        <hr />
        {loading ? (
          <p className="text-center text-gray-400 py-10">Carregando...</p>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            filterPlaceholder="Buscar devedor..."
            onRowClick={(row) => router.push(`/debtor/${row.id}`)}
          />
        )}
      </section>
    </div>
  )
}
