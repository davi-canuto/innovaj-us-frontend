import { api } from './api'
import { PrecatoryValueHistory } from '@/utils/types'

export const valueHistoriesService = {
  getAll: (precatoryId: number) =>
    api.get(`/precatories/${precatoryId}/value_histories`),

  create: (precatoryId: number, data: { reference_date: string; amount_cents: number; notes?: string }) =>
    api.post(`/precatories/${precatoryId}/value_histories`, { record: data }),

  delete: (precatoryId: number, historyId: number) =>
    api.delete(`/precatories/${precatoryId}/value_histories/${historyId}`),
}
