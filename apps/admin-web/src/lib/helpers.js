export function safeMessage(error, fallback = '') {
  if (!error) return fallback
  if (typeof error === 'string') return error
  return error.response?.data?.message || error.message || fallback
}
