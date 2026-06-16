import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import SidebarNav from '../components/common/SidebarNav'

export default function DashboardLayout() {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <div className="layout-container">
      <SidebarNav />
      <main className="layout-content">
        <header className="layout-header">
          <h2>Meat Lovers CIMS</h2>
          <button 
            onClick={() => {
              localStorage.removeItem('admin_token')
              localStorage.removeItem('admin_user')
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