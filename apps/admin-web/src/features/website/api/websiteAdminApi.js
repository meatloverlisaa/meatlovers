import apiClient from '../../../lib/apiClient'
export const websiteAdminApi = {
summary: async () => {
const { data } = await apiClient.get('/admin/website/acquisition-summary')
return data.data
},
leads: async () => {
const { data } = await apiClient.get('/admin/website/leads')
return data.data.leads
},
catering: async () => {
const { data } = await apiClient.get('/admin/website/catering-enquiries')
return data.data.catering_enquiries
},


delivery: async () => {
const { data } = await apiClient.get('/admin/website/delivery-enquiries')
return data.data.delivery_enquiries
},
feedback: async () => {
const { data } = await apiClient.get('/admin/website/feedback')
return data.data.feedback
},
updateLeadStatus: async (id, lead_status) => {
const { data } = await apiClient.post(`/admin/website/leads/${id}/status`, {
lead_status,
})
return data
},
updateCateringStatus: async (id, enquiry_status) => {
const { data } = await apiClient.post(`/admin/website/catering-enquiries/${id}/status`, {
enquiry_status,
})
return data
},
updateDeliveryStatus: async (id, enquiry_status) => {
const { data } = await apiClient.post(`/admin/website/delivery-enquiries/${id}/status`, {
enquiry_status,
})
return data
},
updateFeedbackStatus: async (id, feedback_status) => {
const { data } = await apiClient.post(`/admin/website/feedback/${id}/status`, {
feedback_status,
})
return data
},
}
