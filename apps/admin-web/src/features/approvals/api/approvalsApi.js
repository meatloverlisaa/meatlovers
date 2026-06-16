import apiClient from '../../../lib/apiClient'


export const approvalsApi = {
list: async () => {
const { data } = await apiClient.get('/approvals')
return data.data.approvals
},
history: async () => {
const { data } = await apiClient.get('/approvals/history')
return data.data.approval_history
},
approve: async (id, payload = {}) => {
const { data } = await apiClient.post(`/approvals/${id}/approve`, payload)
return data
},
reject: async (id, payload = {}) => {
const { data } = await apiClient.post(`/approvals/${id}/reject`, payload)
return data
},
apply: async (id) => {
const { data } = await apiClient.post(`/approvals/${id}/apply`, {})
return data
},
}
