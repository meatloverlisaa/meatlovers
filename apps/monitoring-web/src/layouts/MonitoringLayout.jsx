import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import MonitoringNav from '../components/common/MonitoringNav'

export default function MonitoringLayout() {
  const token = localStorage.getItem('monitoring_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="layout-container">
      <MonitoringNav />
      <main className="layout-content">
        <header className="layout-header">
          <h2>Live Monitoring & Audits</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('monitoring_token')
              localStorage.removeItem('monitoring_user')
              window.location.reload()
            }}
            className="btn btn-logout"
          >
            Logout
          </button>
        </header>
        <div className="layout-body">
          <Outlet />
        </div>
      </main>
    </div>
  )
}