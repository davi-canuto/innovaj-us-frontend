import { api } from './api'
import type { PrecatoryDocument } from '@/utils/types'

export const documentsService = {
  list: (precatoryId: number): Promise<PrecatoryDocument[]> =>
    api.get(`/precatories/${precatoryId}/documents`),

  upload: (precatoryId: number, file: File): Promise<PrecatoryDocument> => {
    const form = new FormData()
    form.append('file', file)
    return api.postFormData(`/precatories/${precatoryId}/documents`, form)
  },

  download: (precatoryId: number, docId: number) =>
    api.get(`/precatories/${precatoryId}/documents/${docId}`),

  remove: (precatoryId: number, docId: number) =>
    api.delete(`/precatories/${precatoryId}/documents/${docId}`),
}
