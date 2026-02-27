"use client"

import { useEffect, useState, useCallback } from "react"
import { DataTable } from "@/components/tables/dataTable"
import { columnsDefendant } from "@/components/tables/columns/defendant"
import { Defendant } from "@/utils/types"
import { defendantsService } from "@/services/defendants"
import { AppDialog } from "@/components/layout/app-dialog"
import FormDebtor from "@/components/forms/form-debtor"
import { Landmark } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export default function ListDefendants() {
  const [data, setData] = useState<Defendant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDefendant, setEditingDefendant] = useState<Defendant | null>(null)

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = columnsDefendant(setEditingDefendant)

  return (
    <>
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
            <DataTable columns={columns} data={data} />
          )}
        </section>
      </div>

      <Dialog
        open={!!editingDefendant}
        onOpenChange={(open) => { if (!open) setEditingDefendant(null) }}
      >
        <DialogContent className="w-[90%]">
          <DialogHeader>
            <DialogTitle>
              <div className="text-3xl font-semibold flex items-center space-x-2 mb-2">
                <Landmark strokeWidth={3} className="text-[#248A61]" />
                <h1 className="text-[#1a384c]">Editar Devedor</h1>
              </div>
              <Separator className="my-4" />
            </DialogTitle>
          </DialogHeader>
          {editingDefendant && (
            <FormDebtor
              defaultValues={editingDefendant}
              onSuccess={() => {
                setEditingDefendant(null)
                fetchData()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
