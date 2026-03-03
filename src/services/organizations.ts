import { api } from './api'
import { Organization, OrganizationUser } from '@/utils/types'

export const organizationsService = {
  getAll: () => api.get('/organizations'),
  getById: (id: number) => api.get(`/organizations/${id}`),
  create: (data: Partial<Organization>) => api.post('/organizations', { record: data }),
  update: (id: number, data: Partial<Organization>) => api.put(`/organizations/${id}`, { record: data }),
  delete: (id: number) => api.delete(`/organizations/${id}`),

  getMembers: (orgId: number) => api.get(`/organizations/${orgId}/members`),
  addMember: (orgId: number, data: { user_id: number; role_id: number }) =>
    api.post(`/organizations/${orgId}/members`, { record: data }),
  removeMember: (orgId: number, memberId: number) =>
    api.delete(`/organizations/${orgId}/members/${memberId}`),
}
