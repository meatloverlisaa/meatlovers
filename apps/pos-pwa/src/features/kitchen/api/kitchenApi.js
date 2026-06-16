import apiClient from '../../../lib/apiClient'
export const kitchenApi = {
orders: async () => {
const { data } = await apiClient.get('/kitchen/orders')



return data.data.kitchen_orders
},
markPreparing: async (orderId) => {
const { data } = await apiClient.post(`/kitchen/orders/${orderId}/mark-preparing`, {})
return data
},
markReady: async (orderId) => {
const { data } = await apiClient.post(`/kitchen/orders/${orderId}/mark-ready`, {})
return data
},
}
