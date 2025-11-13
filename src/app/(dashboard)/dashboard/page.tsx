import { DashboardCards } from "@/components/layout/dashboard-cards";
import { columnsPrecatory } from "@/components/tables/columns/precatory";
import { DataTable } from "@/components/tables/dataTable";
import { Precatory } from "@/utils/types";
import { List } from "lucide-react";
import { DashboardChart } from "@/components/layout/dashboard-chart";

async function getData(): Promise<Precatory[]> {
  return [
    {
      id: "1",
      name: "João da Silva",
      number: "PR-001",
      origin: "Tribunal Regional",
      document_number: "DOC-12345",
      protocol_date: "2025-02-01",
      proposal_year: 2025,
      requested_amount: 15000.50,
      inclusion_source: 1,
      stage: "Em andamento",
      created_at: "2025-02-01T09:00:00Z",
      updated_at: "2025-02-10T12:00:00Z"
    },
    {
      id: "2",
      name: "Maria Oliveira",
      number: "PR-002",
      origin: "Tribunal Regional",
      document_number: "DOC-12346",
      protocol_date: "2025-01-15",
      proposal_year: 2025,
      requested_amount: 25000.00,
      inclusion_source: 2,
      stage: "Concluído",
      created_at: "2025-01-15T10:00:00Z",
      updated_at: "2025-01-30T15:00:00Z"
    },
    {
      id: "3",
      name: "Empresa ABC Ltda",
      number: "PR-003",
      origin: "Tribunal Federal",
      document_number: "DOC-12347",
      protocol_date: "2024-11-20",
      proposal_year: 2024,
      requested_amount: 50000.75,
      inclusion_source: 1,
      stage: "Em andamento",
      created_at: "2024-11-20T11:30:00Z",
      updated_at: "2025-01-10T14:00:00Z"
    },
    {
      id: "4",
      name: "Fundação Vida Plena",
      number: "PR-004",
      origin: "Tribunal Estadual",
      document_number: "DOC-12348",
      protocol_date: "2023-12-05",
      proposal_year: 2023,
      requested_amount: 80000.00,
      inclusion_source: 2,
      stage: "Em andamento",
      created_at: "2023-12-05T09:15:00Z",
      updated_at: "2024-01-20T12:00:00Z"
    },
    {
      id: "5",
      name: "Carlos Santos",
      number: "PR-005",
      origin: "Tribunal Regional",
      document_number: "DOC-12349",
      protocol_date: "2025-03-01",
      proposal_year: 2025,
      requested_amount: 12000.00,
      inclusion_source: 1,
      stage: "Em andamento",
      created_at: "2025-03-01T08:00:00Z",
      updated_at: "2025-03-05T11:00:00Z"
    },

  ]
}
export default async function Home() {
  const data = await getData()

  return (
    <>
      <DashboardCards />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        <div className="border rounded-2xl p-6 bg-white">
          <section className="mx-auto lg:max-w-[90%]">
            <div className=" flex items-center justify-between  mb-6"  >
              <div className="text-3xl font-semibold flex items-center space-x-2">
                <List strokeWidth={3} className=" text-[#248A61] " />
                <h1 className=" text-[#1a384c]"> Precatórios</h1>
              </div>

            </div>
            <hr />
            <DataTable columns={columnsPrecatory} data={data} />
          </section>
        </div>
        <DashboardChart />

      </div>

    </>


  );
}
