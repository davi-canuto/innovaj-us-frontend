import { columnsPrecatory } from "@/components/tables/columns/precatory"
import { DataTable } from "@/components/tables/dataTable"
import {
  List,
} from "lucide-react"
import { Precatory } from "@/utils/types"
import { getToken } from "@/lib/actions/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL

async function getData(): Promise<Precatory[]> {
  try {
    const token = await getToken()

    const response = await fetch(`${API_URL}/precatories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch precatories:', response.status)
      return []
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching precatories:', error)
    return []
  }
}


export default async function ListPrecatory() {
  const data = await getData()

  return (
    <>
      <div className="border rounded-2xl p-6 bg-white">
        <section className="mx-auto lg:max-w-[90%]">
          <div className=" flex items-center justify-between  mb-6  "  >
            <div className="text-3xl font-semibold flex items-center space-x-2">
               <List strokeWidth={3} className=" text-[#248A61] " />
            <h1 className=" text-[#1a384c]"> Precatórios</h1>
            </div>
            <Link href="/precatory/new">
              <Button className="bg-[#1a384c] text-white hover:bg-[#1a384c]">
                Novo Precatório
              </Button>
            </Link>
          </div>
          <hr />
          <DataTable columns={columnsPrecatory} data={data} />
        </section>
      </div>



    </>
  )
}
