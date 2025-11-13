export type Precatory = {
  id: string
  name: string
  number: string
  origin: string
  document_number: string
  protocol_date: string
  proposal_year: number
  requested_amount: number
  inclusion_source: number
  stage: string
  created_at: string
  updated_at: string
}

export type Petitioner = {
  id: string
  name: string
  person_type: number
  registration_number: string
  gender: number | null
  birth_date: string | null
  mother_name: string | null
  father_name: string | null
  death_date: string | null
  company_name: string | null
  foundation_name: string | null
  code: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}