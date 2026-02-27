export type Precatory = {
  id: number
  name: string
  number: string
  origin: string
  document_number: string
  protocol_date: string
  proposal_year: number
  requested_amount: number
  inclusion_source: string
  stage: string
  base_date_update?: string
  nature_of_credit?: string
  judgment_date?: string
  request_type?: string
  payment_type?: string
  remarks?: string
  petitioner_id?: number
  defendant_id?: number
  value_principal_cents?: number
  value_interest_cents?: number
  value_costs_cents?: number
  user_id?: number
  created_at: string
  updated_at: string
}

export type Petitioner = {
  id: number
  name: string
  person_type: 'pf' | 'pj'
  registration_number: string
  gender?: 'male' | 'female' | 'other' | null
  birth_date?: string | null
  mother_name?: string | null
  father_name?: string | null
  death_date?: string | null
  company_name?: string | null
  foundation_name?: string | null
  code?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export type Defendant = {
  id: number
  name: string
  registration_number?: string
  entity_type?: string
  code?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
}

export type Dependant = {
  id: number
  name: string
  birth_date?: string
  gender?: 'male' | 'female' | 'other'
  registration_number?: string
  email?: string
  phone?: string
  petitioner_id: number
  created_at: string
  updated_at: string
}