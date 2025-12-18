import { api } from './api'

export interface Dependant {
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

export const dependantsService = {
  getAll: () => api.get('/dependants'),
  getById: (id: number) => api.get(`/dependants/${id}`),
  create: (data: Partial<Dependant>) => api.post('/dependants', { record: data }),
  update: (id: number, data: Partial<Dependant>) => api.put(`/dependants/${id}`, { record: data }),
  delete: (id: number) => api.delete(`/dependants/${id}`),
}
