import axios from 'axios'
const apiClient = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/backend/public/api',
timeout: 10000,
})
export default apiClient
