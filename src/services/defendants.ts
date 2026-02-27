import { api } from './api'
import { Defendant } from '@/utils/types'

export const defendantsService = {
  getAll: () => api.get('/defendants'),
  getById: (id: number) => api.get(`/defendants/${id}`),
  create: (data: Partial<Defendant>) => api.post('/defendants', { record: data }),
  update: (id: number, data: Partial<Defendant>) => api.put(`/defendants/${id}`, { record: data }),
  delete: (id: number) => api.delete(`/defendants/${id}`),
}
