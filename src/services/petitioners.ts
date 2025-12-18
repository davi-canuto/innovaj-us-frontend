import { api } from './api'

export interface Petitioner {
  id: number
  name: string
  registration_number: string
  mother_name?: string
  father_name?: string
  company_name?: string
  foundation_name?: string
  code?: string
  phone?: string
  email?: string
  person_type: 'pf' | 'pj'
  gender?: 'male' | 'female' | 'other'
  birth_date?: string
  death_date?: string
  created_at: string
  updated_at: string
}

export const petitionersService = {
  getAll: () => api.get('/petitioners'),
  getById: (id: number) => api.get(`/petitioners/${id}`),
  create: (data: Partial<Petitioner>) => api.post('/petitioners', { record: data }),
  update: (id: number, data: Partial<Petitioner>) => api.put(`/petitioners/${id}`, { record: data }),
  delete: (id: number) => api.delete(`/petitioners/${id}`),
}
