import apiClient from '../../../lib/apiClient'
export const liveControlApi = {
summary: async () => {
const { data } = await apiClient.get('/monitoring/live-control')
return data.data
},
lowStockAlerts: async () => {
const { data } = await apiClient.get('/monitoring/low-stock-alerts')
return data.data.low_stock_alerts
},
pendingApprovals: async () => {
const { data } = await apiClient.get('/monitoring/pending-approvals')
return data.data.pending_approvals
},
pendingMpesa: async () => {
const { data } = await apiClient.get('/monitoring/pending-mpesa')
return data.data.pending_mpesa
},
unsoldFoodAlerts: async () => {
const { data } = await apiClient.get('/monitoring/unsold-food-alerts')
return data.data.unsold_food_alerts
},
}
