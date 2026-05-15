import { api } from './api'
import type { Precatory, QuotationBackend } from '@/utils/types'

export const precatoriesService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return api.get(`/precatories${query}`)
  },
  getById: (id: number) => api.get(`/precatories/${id}`),
  create: (data: Partial<Precatory>) => api.post('/precatories', { record: data }),
  update: (id: number, data: Partial<Precatory>) => api.put(`/precatories/${id}`, { record: data }),
  delete: (id: number) => api.delete(`/precatories/${id}`),
  parsePdf: (file: File, organizationId?: number) => {
    const formData = new FormData()
    formData.append('file', file)
    if (organizationId) formData.append('organization_id', organizationId.toString())
    return api.postFormData('/precatories/parse_pdf', formData)
  },
  createQuotation: (id: number): Promise<QuotationBackend> =>
    api.post(`/precatories/${id}/quotations`, {}),
  listQuotations: (id: number): Promise<QuotationBackend[]> =>
    api.get(`/precatories/${id}/quotations`),
}
