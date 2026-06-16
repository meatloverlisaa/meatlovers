import apiClient from '../../../lib/apiClient'
export const staffMotivationApi = {
dashboard: async () => {
const { data } = await apiClient.get('/staff-motivation/dashboard')
return data.data
},
leaderboard: async () => {
const { data } = await apiClient.get('/staff-motivation/leaderboard')
return data.data.leaderboard
},
servicePerformance: async () => {
const { data } = await apiClient.get('/staff-motivation/service-performance')
return data.data.service_performance
},
createCustomerRating: async (payload) => {
const { data } = await apiClient.post('/staff-motivation/customer-rating', payload)
return data
},
bonusRules: async () => {
const { data } = await apiClient.get('/staff-motivation/bonus-rules')
return data.data.bonus_rules
},
createBonusRule: async (payload) => {
const { data } = await apiClient.post('/staff-motivation/bonus-rules', payload)
return data
},
dailyTargets: async () => {
const { data } = await apiClient.get('/staff-motivation/daily-targets')
return data.data.daily_targets
},
createDailyTarget: async (payload) => {
const { data } = await apiClient.post('/staff-motivation/daily-targets', payload)
return data
},


hrmReport: async () => {
const { data } = await apiClient.get('/staff-motivation/hrm-report')
return data.data.hrm_performance_report
},
}
