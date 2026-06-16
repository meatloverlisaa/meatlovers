import apiClient from '../../../lib/apiClient'
export const ordersApi = {
create: async (payload) => {
const { data } = await apiClient.post('/orders', payload)
return data.data
},
list: async () => {
const { data } = await apiClient.get('/orders')
return data.data.orders
},
requestCancellation: async (orderId, payload) => {
const { data } = await apiClient.post(`/orders/${orderId}/request-cancellation`, payload)
return data
},
requestDiscount: async (orderId, payload) => {
const { data } = await apiClient.post(`/orders/${orderId}/request-discount`, payload)
return data
},
}
