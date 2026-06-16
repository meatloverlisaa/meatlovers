import apiClient from '../../../lib/apiClient'
export const websiteApi = {
submitLead: async (payload) => {
const { data } = await apiClient.post('/website/leads', payload)
return data
},
submitCatering: async (payload) => {
const { data } = await apiClient.post('/website/catering-enquiries', payload)
return data
},
submitDelivery: async (payload) => {
const { data } = await apiClient.post('/website/delivery-enquiries', payload)
return data
},
submitFeedback: async (payload) => {
const { data } = await apiClient.post('/website/feedback', payload)
return data
},
}
