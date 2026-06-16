import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import PosLayout from '../layouts/PosLayout'
import LoginPage from '../features/auth/pages/LoginPage'
import MenuPage from '../features/menu/pages/MenuPage'
import TableSelectionPage from '../features/tables/pages/TableSelectionPage'
import CartPage from '../features/cart/pages/CartPage'
import OrderStatusPage from '../features/orders/pages/OrderStatusPage'
import RequestsPage from '../features/requests/pages/RequestsPage'
import NotFound from '../pages/NotFound'

// Batch imports
import BarIssuePage from '../features/bar/pages/BarIssuePage'
import BarStockPage from '../features/bar/pages/BarStockPage'
import CashierPaymentPage from '../features/cashier/pages/CashierPaymentPage'
import KitchenQueuePage from '../features/kitchen/pages/KitchenQueuePage'
import PrintQueuePage from '../features/cashier/pages/PrintQueuePage'
import ReceiptPage from '../features/cashier/pages/ReceiptPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PosLayout />}>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/table" element={<TableSelectionPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderStatusPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/kitchen" element={<KitchenQueuePage />} />
        <Route path="/bar-stock" element={<BarStockPage />} />
        <Route path="/bar-issue" element={<BarIssuePage />} />
        <Route path="/cashier" element={<CashierPaymentPage />} />
        <Route path="/receipt/:orderId" element={<ReceiptPage />} />
        <Route path="/print-queue" element={<PrintQueuePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

