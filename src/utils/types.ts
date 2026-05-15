export type PrecatoryStatus = 'em_negociacao' | 'negociado' | 'concluido' | 'cancelado'

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
  status?: PrecatoryStatus
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
  filing_date?: string
  administrative_process?: string
  pje_process?: string
  fee_percentage?: number
  fee_amount_cents?: number
  fee_spreadsheet_percentage?: number | null
  has_contract?: boolean
  percentage_of_face_value?: number
  is_rpv?: boolean
  rpv_amount_cents?: number
  succumbence_fee_cents?: number
  contractual_fee_cents?: number
  is_negotiated?: boolean
  negotiated_amount_cents?: number
  disbursement_cents?: number
  costs_cents?: number
  payment_forecast_date?: string
  payment_forecast_year?: number
  position_at_purchase?: number
  last_updated_date?: string
  current_value_cents?: number
  ganho_estimado_cents?: number | null
  ganho_atualizado_cents?: number | null
  rentabilidade_estimada?: number | null
  rentabilidade_atualizada?: number | null
  data_atualizacao?: string | null
  priority_level?: 'super' | 'alimentar' | 'comum'
  last_value_history?: PrecatoryValueHistory
  value_histories?: PrecatoryValueHistory[]
  petitioner?: Petitioner
  defendant?: Defendant
  created_at: string
  updated_at: string
}

export type PrecatoryDocument = {
  id: number
  file_name: string
  file_type: string
  file_size: number
  uploaded_by: number
  created_at: string
  download_url: string
}

export type QuotationBackend = {
  id: number
  precatory_id: number
  generated_at: string
  items: QuotationItem[]
  pdf_url: string
}

export type QuotationItem = {
  year_offset: number
  percentage: number
  calculated_value_cents: number
}

export type PortfolioSummary = {
  total_precatories: number
  total_rpvs: number
  valor_desembolsado_total_cents: number
  ganho_estimado_total_cents: number
  ganho_atualizado_total_cents: number
  valor_total_carteira_cents: number
  recebimentos_por_ano: RecebimentoPorAno[]
}

export type RecebimentoPorAno = {
  ano: number
  valor_total_cents: number
  ganho_estimado_total_cents: number
  ganho_atualizado_total_cents: number
  quantidade: number
}

export type PrecatoryValueHistory = {
  id: number
  precatory_id: number
  reference_date: string
  amount_cents: number
  notes?: string
  created_by_user_id?: number
  created_at: string
  updated_at: string
}

export type PaymentQueue = {
  id: number
  defendant_id: number
  year: number
  name: string
  description?: string
  organization_id?: number
  defendant?: Defendant
  created_at: string
  updated_at: string
}

export type PaymentQueueEntry = {
  id: number
  payment_queue_id: number
  precatory_id: number
  position: number
  notes?: string
  precatory?: Precatory & {
    priority_level: 'super' | 'alimentar' | 'comum'
    last_value_history?: PrecatoryValueHistory
  }
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
  precatories?: Precatory[]
  created_at: string
  updated_at: string
}

export type PrecatoryAttachment = {
  id: number
  display_name: string
  content_type: string
  byte_size: number
  created_at: string
  file_url: string
  download_url: string
}

export type Organization = {
  id: number
  name: string
  registration_number?: string
  created_at: string
  updated_at: string
}

export type Role = {
  id: number
  name: 'admin' | 'member'
}

export type OrganizationUser = {
  id: number
  organization_id: number
  user_id: number
  role: Role
  user?: {
    id: number
    name: string
    email: string
  }
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

// Faixas de porcentagem por ano de pagamento
// ano atual      → 50%, 55%, 60%
// ano atual + 1  → 40%, 45%, 50%
// ano atual + 2  → 30%, 35%, 40%
// ano atual + 3+ → 25%, 30%, 35%
export type QuotationRange = {
  year: number
  label: string // "2026", "2027", etc.
  percentages: [number, number, number] // [baixo, médio, alto]
  values: [number, number, number] // valores calculados em cents
}

export type Quotation = {
  precatory_id: number
  precatory_name: string
  precatory_number: string
  face_value_cents: number // requested_amount
  petitioner_name?: string
  defendant_name?: string
  payment_forecast_year?: number
  ranges: QuotationRange[]
}