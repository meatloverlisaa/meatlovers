import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from '../context/CartContext'
const queryClient = new QueryClient()
export default function AppProviders({ children }) {
return (
<QueryClientProvider client={queryClient}>
<CartProvider>
<BrowserRouter>{children}</BrowserRouter>
</CartProvider>
</QueryClientProvider>


)
}
