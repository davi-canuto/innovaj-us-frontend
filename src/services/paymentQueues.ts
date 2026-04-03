import { api } from './api'

export const paymentQueuesService = {
  getAll: () => api.get('/payment_queues'),

  getById: (id: number) => api.get(`/payment_queues/${id}`),

  create: (data: { defendant_id: number; year: number; name: string; description?: string }) =>
    api.post('/payment_queues', { record: data }),

  update: (id: number, data: { name?: string; description?: string; year?: number }) =>
    api.put(`/payment_queues/${id}`, { record: data }),

  delete: (id: number) => api.delete(`/payment_queues/${id}`),

  getEntries: (queueId: number) => api.get(`/payment_queues/${queueId}/entries`),

  addEntry: (queueId: number, data: { precatory_id: number; position?: number; notes?: string }) =>
    api.post(`/payment_queues/${queueId}/entries`, { record: data }),

  updateEntry: (queueId: number, entryId: number, data: { position?: number; notes?: string }) =>
    api.put(`/payment_queues/${queueId}/entries/${entryId}`, { record: data }),

  removeEntry: (queueId: number, entryId: number) =>
    api.delete(`/payment_queues/${queueId}/entries/${entryId}`),
}
