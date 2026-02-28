"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { columnsPrecatory } from "@/components/tables/columns/precatory"
import { DataTable } from "@/components/tables/dataTable"
import { List, CircleDollarSign } from "lucide-react"
import { Precatory } from "@/utils/types"
import PrecatoryForm from "@/components/forms/precatory"
import { precatoriesService } from "@/services/precatories"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PdfUploadButton } from "@/components/layout/pdf-upload-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export default function ListPrecatory() {
  const router = useRouter()
  const [data, setData] = useState<Precatory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPrecatory, setEditingPrecatory] = useState<Precatory | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await precatoriesService.getAll()
      setData(Array.isArray(result) ? result : [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = columnsPrecatory(setEditingPrecatory)

  return (
    <>
      <div className="border rounded-2xl p-6 bg-white">
        <section className="mx-auto lg:max-w-[90%]">
          <div className="flex items-center justify-between mb-6">
            <div className="text-3xl font-semibold flex items-center space-x-2">
              <List strokeWidth={3} className="text-[#248A61]" />
              <h1 className="text-[#1a384c]">Precatórios</h1>
            </div>
            <div className="flex items-center gap-2">
              <PdfUploadButton onSuccess={fetchData} />
              <Link href="/precatory/new">
                <Button className="bg-[#1a384c] text-white hover:bg-[#1a384c]">
                  Novo Precatório
                </Button>
              </Link>
            </div>
          </div>
          {loading ? (
            <p className="text-center text-gray-400 py-10">Carregando...</p>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              filterPlaceholder="Buscar precatório..."
              onRowClick={(row) => router.push(`/precatory/${row.id}`)}
            />
          )}
        </section>
      </div>

      <Dialog
        open={!!editingPrecatory}
        onOpenChange={(open) => { if (!open) setEditingPrecatory(null) }}
      >
        <DialogContent className="w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="text-3xl font-semibold flex items-center space-x-2 mb-2">
                <CircleDollarSign strokeWidth={3} className="text-[#248A61]" />
                <h1 className="text-[#1a384c]">Editar Precatório</h1>
              </div>
              <Separator className="my-4" />
            </DialogTitle>
          </DialogHeader>
          {editingPrecatory && (
            <PrecatoryForm
              defaultValues={editingPrecatory}
              onSuccess={() => {
                setEditingPrecatory(null)
                fetchData()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
