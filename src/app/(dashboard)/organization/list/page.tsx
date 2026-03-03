"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/tables/dataTable"
import { columnsOrganization } from "@/components/tables/columns/organization"
import { Organization } from "@/utils/types"
import { organizationsService } from "@/services/organizations"
import { AppDialog } from "@/components/layout/app-dialog"
import FormOrganization from "@/components/forms/form-organization"
import { Building2 } from "lucide-react"

export default function ListOrganizations() {
  const router = useRouter()
  const [data, setData] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await organizationsService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const columns = columnsOrganization()

  return (
    <div className="border rounded-2xl p-6 bg-white">
      <section className="mx-auto lg:max-w-[90%]">
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-semibold flex items-center space-x-2">
            <Building2 strokeWidth={3} className="text-[#248A61]" />
            <h1 className="text-[#1a384c]">Organizações</h1>
          </div>
          <AppDialog
            title="Nova Organização"
            trigger="Nova Organização"
            content={<FormOrganization onSuccess={fetchData} />}
          />
        </div>
        <hr />
        {loading ? (
          <p className="text-center text-gray-400 py-10">Carregando...</p>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            filterPlaceholder="Buscar organização..."
            onRowClick={(row) => router.push(`/organization/${row.id}`)}
          />
        )}
      </section>
    </div>
  )
}
