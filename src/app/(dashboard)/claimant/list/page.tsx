"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { columnsPetitioner } from "@/components/tables/columns/petitioner"
import { DataTable } from "@/components/tables/dataTable"
import { Users } from "lucide-react"
import { Petitioner } from "@/utils/types"
import { AppDialog } from "@/components/layout/app-dialog"
import FormPetitioner from "@/components/forms/form-petitioner"
import { petitionersService } from "@/services/petitioners"

export default function ListPetitioners() {
  const router = useRouter()
  const [data, setData] = useState<Petitioner[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await petitionersService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const columns = columnsPetitioner()

  return (
    <div className="border rounded-2xl p-6 bg-white">
      <section className="mx-auto lg:max-w-[90%]">
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-semibold flex items-center space-x-2">
            <Users strokeWidth={3} className="text-[#248A61]" />
            <h1 className="text-[#1a384c]">Credores</h1>
          </div>
          <AppDialog
            title="Novo Credor"
            trigger="Novo Credor"
            content={<FormPetitioner onSuccess={fetchData} />}
          />
        </div>
        <hr />
        {loading ? (
          <p className="text-center text-gray-400 py-10">Carregando...</p>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            filterPlaceholder="Buscar credor..."
            onRowClick={(row) => router.push(`/claimant/${row.id}`)}
          />
        )}
      </section>
    </div>
  )
}
