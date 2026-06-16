import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  ['Dashboard', '/dashboard'],
  ['Low Stock', '/low-stock'],
  ['Approvals', '/pending-approvals'],
  ['Mpesa', '/pending-mpesa'],
  ['Unsold Food', '/unsold-food'],
  
]

export default function MonitoringNav() {
  const location = useLocation()
  return (
    <nav className="monitoring-nav">
      <div className="nav-header">
        <h3>Meat Lovers CIMS</h3>
        <span>Live Control Panel</span>
      </div>
      <div className="nav-links-container">
        {links.map(([label, path]) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
