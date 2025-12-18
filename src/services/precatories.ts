import { api } from './api'

export interface Precatory {
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

export const precatoriesService = {
  getAll: () => api.get('/precatories'),
  getById: (id: number) => api.get(`/precatories/${id}`),
  create: (data: Partial<Precatory>) => api.post('/precatories', { record: data }),
  update: (id: number, data: Partial<Precatory>) => api.put(`/precatories/${id}`, { record: data }),
  delete: (id: number) => api.delete(`/precatories/${id}`),
}
