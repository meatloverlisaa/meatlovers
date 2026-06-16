import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import MonitoringLayout from '../layouts/MonitoringLayout'
import OwnerDashboardPage from '../features/live-control/pages/OwnerDashboardPage'
import LowStockAlertsPage from '../features/live-control/pages/LowStockAlertsPage'
import PendingApprovalsPage from '../features/live-control/pages/PendingApprovalsPage'
import PendingMpesaPage from '../features/live-control/pages/PendingMpesaPage'
import UnsoldFoodAlertsPage from '../features/live-control/pages/UnsoldFoodAlertsPage'
import NotFound from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MonitoringLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<OwnerDashboardPage />} />
        <Route path="/low-stock" element={<LowStockAlertsPage />} />
        <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
        <Route path="/pending-mpesa" element={<PendingMpesaPage />} />
        <Route path="/unsold-food" element={<UnsoldFoodAlertsPage />} />
        <Route path="/owner-dashboard" element={<OwnerDashboardPage />} />
        <Route path="/low-stock-alerts" element={<LowStockAlertsPage />} />
        <Route path="/unsold-food-alerts" element={<UnsoldFoodAlertsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

