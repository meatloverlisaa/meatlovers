import apiClient from '../../../lib/apiClient'
export const barApi = {
stock: async () => {
const { data } = await apiClient.get('/bar/stock')
return data.data.bar_stock
},
issue: async (payload) => {
const { data } = await apiClient.post('/bar/stock-issue', payload)
return data
},
}
