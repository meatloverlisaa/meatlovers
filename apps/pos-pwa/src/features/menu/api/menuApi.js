import apiClient from '../../../lib/apiClient'
export const menuApi = {
products: async () => {
const { data } = await apiClient.get('/products')
return data.data.products
},
}
