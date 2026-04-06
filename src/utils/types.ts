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
  // Novo campo de status (substitui stage para fluxo de negociação)
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
  // Fila / processos
  filing_date?: string
  administrative_process?: string
  pje_process?: string
  // Honorários
  fee_percentage?: number
  fee_amount_cents?: number
  has_contract?: boolean
  // Porcentagem do valor negociado sobre o face value
  percentage_of_face_value?: number
  // RPV
  is_rpv?: boolean
  rpv_amount_cents?: number
  succumbence_fee_cents?: number
  contractual_fee_cents?: number
  // Negociação
  is_negotiated?: boolean
  negotiated_amount_cents?: number
  disbursement_cents?: number
  costs_cents?: number
  payment_forecast_date?: string
  payment_forecast_year?: number
  position_at_purchase?: number
  last_updated_date?: string
  current_value_cents?: number
  // Ganho atualizado (current_value - disbursement - costs)
  ganho_atualizado_cents?: number
  // Data de atualização do valor atual
  data_atualizacao_valor?: string
  // Rentabilidades calculadas
  rentabilidade_estimada?: number
  rentabilidade_atualizada?: number
  // Campo calculado pelo backend
  priority_level?: 'super' | 'alimentar' | 'comum'
  last_value_history?: PrecatoryValueHistory
  value_histories?: PrecatoryValueHistory[]
  petitioner?: Petitioner
  defendant?: Defendant
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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