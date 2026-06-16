import apiClient from '../../../lib/apiClient'
export const authApi = {
login: async (payload) => {
const { data } = await apiClient.post('/auth/login', payload)
return data.data
},
}
