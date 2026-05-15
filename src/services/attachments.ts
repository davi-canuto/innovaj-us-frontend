import { api } from './api'
import type { PrecatoryAttachment } from '@/utils/types'

export const attachmentsService = {
  list: (precatoryId: number): Promise<PrecatoryAttachment[]> =>
    api.get(`/precatories/${precatoryId}/attachments`),

  upload: (precatoryId: number, file: File, displayName: string): Promise<PrecatoryAttachment> => {
    const form = new FormData()
    form.append('file', file)
    form.append('display_name', displayName)
    return api.postFormData(`/precatories/${precatoryId}/attachments`, form)
  },

  rename: (precatoryId: number, attachId: number, displayName: string): Promise<PrecatoryAttachment> =>
    api.patch(`/precatories/${precatoryId}/attachments/${attachId}`, { display_name: displayName }),

  remove: (precatoryId: number, attachId: number) =>
    api.delete(`/precatories/${precatoryId}/attachments/${attachId}`),
}
