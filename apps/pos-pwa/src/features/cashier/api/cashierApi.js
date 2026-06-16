import apiClient from '../../../lib/apiClient'
export const cashierApi = {
orders: async () => {
const { data } = await apiClient.get('/orders')
return data.data.orders
},
cashSettle: async (orderId, payload) => {
const { data } = await apiClient.post(`/payments/cash-settle/${orderId}`, payload)
return data
},
mpesaPending: async (orderId, payload) => {
const { data } = await apiClient.post(`/payments/mpesa-pending/${orderId}`, payload)
return data
},
receipt: async (orderId) => {
const { data } = await apiClient.get(`/payments/receipt/${orderId}`)
return data.data
},
printQueue: async () => {
const { data } = await apiClient.get('/payments/print-queue')
return data.data.print_queue
},
audit: async () => {
const { data } = await apiClient.get('/payments/audit')
return data.data.payment_audit
},
}
