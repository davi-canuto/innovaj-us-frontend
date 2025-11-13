import { columnsPetitioner } from "@/components/tables/columns/petitioner"
import { DataTable } from "@/components/tables/dataTable"
import {
  List,
} from "lucide-react"
import { Petitioner } from "@/utils/types"
import FormPetitioner from "@/components/forms/form-petitioner"
import { AppDialog } from "@/components/layout/app-dialog"


async function getData(): Promise<Petitioner[]> {
  return [
    {
      id: "1",
      name: "João da Silva",
      person_type: 0,
      registration_number: "123.456.789-00",
      gender: 1,
      birth_date: "1980-04-15",
      mother_name: "Maria da Silva",
      father_name: "Carlos da Silva",
      death_date: null,
      company_name: null,
      foundation_name: null,
      code: "PT-001",
      phone: "+55 84 98877-6655",
      email: "joao.silva@example.com",
      created_at: "2025-02-10T09:00:00Z",
      updated_at: "2025-03-01T10:30:00Z"
    },
    {
      id: "2",
      name: "Empresa ABC Ltda",
      person_type: 1,
      registration_number: "12.345.678/0001-90",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: "Empresa ABC Ltda",
      foundation_name: null,
      code: "PT-002",
      phone: "+55 11 4002-8922",
      email: "contato@empresaabc.com.br",
      created_at: "2024-11-12T14:00:00Z",
      updated_at: "2025-01-18T16:45:00Z"
    },
    {
      id: "3",
      name: "Fundação Vida Plena",
      person_type: 1,
      registration_number: "45.678.912/0001-32",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: null,
      foundation_name: "Fundação Vida Plena",
      code: "PT-003",
      phone: "+55 21 97777-1234",
      email: "contato@vidaplena.org.br",
      created_at: "2023-06-05T11:00:00Z",
      updated_at: "2024-08-22T15:00:00Z"
    },
    {
      id: "4",
      name: "Maria Oliveira",
      person_type: 0,
      registration_number: "987.654.321-00",
      gender: 2,
      birth_date: "1992-09-10",
      mother_name: "Ana Oliveira",
      father_name: "Pedro Oliveira",
      death_date: null,
      company_name: null,
      foundation_name: null,
      code: "PT-004",
      phone: "+55 31 98888-7766",
      email: "maria.oliveira@example.com",
      created_at: "2025-01-05T12:00:00Z",
      updated_at: "2025-02-20T14:30:00Z"
    },
    {
      id: "5",
      name: "Carlos Santos",
      person_type: 0,
      registration_number: "321.654.987-00",
      gender: 1,
      birth_date: "1985-07-22",
      mother_name: "Lúcia Santos",
      father_name: "José Santos",
      death_date: null,
      company_name: null,
      foundation_name: null,
      code: "PT-005",
      phone: "+55 41 99777-6655",
      email: "carlos.santos@example.com",
      created_at: "2024-10-12T10:00:00Z",
      updated_at: "2025-01-30T09:45:00Z"
    },
    {
      id: "6",
      name: "Empresa XYZ S.A.",
      person_type: 1,
      registration_number: "98.765.432/0001-55",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: "Empresa XYZ S.A.",
      foundation_name: null,
      code: "PT-006",
      phone: "+55 21 4004-5678",
      email: "contato@xyz.com.br",
      created_at: "2024-07-15T09:00:00Z",
      updated_at: "2024-12-01T12:00:00Z"
    },
    {
      id: "7",
      name: "Fundação Esperança",
      person_type: 1,
      registration_number: "56.789.123/0001-40",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: null,
      foundation_name: "Fundação Esperança",
      code: "PT-007",
      phone: "+55 11 97777-8899",
      email: "contato@fundacaoesperanca.org",
      created_at: "2023-08-20T11:30:00Z",
      updated_at: "2024-09-05T15:00:00Z"
    },
    {
      id: "8",
      name: "Ana Paula Lima",
      person_type: 0,
      registration_number: "654.321.987-00",
      gender: 2,
      birth_date: "1990-12-01",
      mother_name: "Clara Lima",
      father_name: "Marcos Lima",
      death_date: null,
      company_name: null,
      foundation_name: null,
      code: "PT-008",
      phone: "+55 51 98888-4455",
      email: "ana.lima@example.com",
      created_at: "2024-09-10T10:00:00Z",
      updated_at: "2025-01-15T12:30:00Z"
    },
    {
      id: "9",
      name: "Bruno Fernandes",
      person_type: 0,
      registration_number: "741.852.963-00",
      gender: 1,
      birth_date: "1988-03-15",
      mother_name: "Patrícia Fernandes",
      father_name: "Roberto Fernandes",
      death_date: null,
      company_name: null,
      foundation_name: null,
      code: "PT-009",
      phone: "+55 61 97777-5566",
      email: "bruno.fernandes@example.com",
      created_at: "2024-05-20T09:00:00Z",
      updated_at: "2025-02-01T11:15:00Z"
    },
    {
      id: "10",
      name: "Empresa Delta Ltda",
      person_type: 1,
      registration_number: "23.456.789/0001-10",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: "Empresa Delta Ltda",
      foundation_name: null,
      code: "PT-010",
      phone: "+55 31 4002-1234",
      email: "contato@deltaltda.com.br",
      created_at: "2024-01-05T08:30:00Z",
      updated_at: "2024-12-20T14:00:00Z"
    },
    {
      id: "11",
      name: "Fundação Horizonte",
      person_type: 1,
      registration_number: "67.890.123/0001-22",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: null,
      foundation_name: "Fundação Horizonte",
      code: "PT-011",
      phone: "+55 21 98888-7788",
      email: "contato@fundacaohorizonte.org",
      created_at: "2023-11-12T11:00:00Z",
      updated_at: "2024-10-15T16:00:00Z"
    },
    {
      id: "12",
      name: "Lucas Martins",
      person_type: 0,
      registration_number: "963.852.741-00",
      gender: 1,
      birth_date: "1995-05-05",
      mother_name: "Marina Martins",
      father_name: "Carlos Martins",
      death_date: null,
      company_name: null,
      foundation_name: null,
      code: "PT-012",
      phone: "+55 41 97777-3322",
      email: "lucas.martins@example.com",
      created_at: "2024-03-10T09:00:00Z",
      updated_at: "2025-02-05T12:00:00Z"
    },
    {
      id: "13",
      name: "Carla Souza",
      person_type: 0,
      registration_number: "852.963.741-00",
      gender: 2,
      birth_date: "1982-08-30",
      mother_name: "Rosana Souza",
      father_name: "Fábio Souza",
      death_date: null,
      company_name: null,
      foundation_name: null,
      code: "PT-013",
      phone: "+55 51 98888-9988",
      email: "carla.souza@example.com",
      created_at: "2023-12-01T10:00:00Z",
      updated_at: "2024-11-20T14:00:00Z"
    },
    {
      id: "14",
      name: "Empresa Gama S.A.",
      person_type: 1,
      registration_number: "78.901.234/0001-33",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: "Empresa Gama S.A.",
      foundation_name: null,
      code: "PT-014",
      phone: "+55 11 4004-5678",
      email: "contato@gama.com.br",
      created_at: "2024-02-05T09:30:00Z",
      updated_at: "2025-01-10T11:45:00Z"
    },
    {
      id: "15",
      name: "Fundação Vida Nova",
      person_type: 1,
      registration_number: "34.567.890/0001-44",
      gender: null,
      birth_date: null,
      mother_name: null,
      father_name: null,
      death_date: null,
      company_name: null,
      foundation_name: "Fundação Vida Nova",
      code: "PT-015",
      phone: "+55 21 97777-5566",
      email: "contato@vidanova.org",
      created_at: "2023-05-20T11:00:00Z",
      updated_at: "2024-07-10T15:00:00Z"
    },
  ]
}


export default async function ListPetitioners() {
  const data = await getData()

  return (
    <>
      <div className="border rounded-2xl p-6 bg-white">
        <section className="mx-auto lg:max-w-[90%]">
          <div className=" flex items-center justify-between  mb-6  "  >
            <div className="text-3xl font-semibold flex items-center space-x-2">
               <List strokeWidth={3} className=" text-[#248A61] " />
            <h1 className=" text-[#1a384c]"> Credores</h1>
            </div>
              <AppDialog
        title="Novo Credor"
        trigger="Novo Credor"
        content={<FormPetitioner />}
      />
          </div>
          <hr />
          <DataTable columns={columnsPetitioner} data={data} />
        </section>
      </div>

   
   
    </>
  )
}

