import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function MobileNav() {
  const location = useLocation()
  const links = [
    ['POS', '/menu'],
    ['Table', '/table'],
    ['Cart', '/cart'],
    ['Orders', '/orders'],
    ['Requests', '/requests'],
    ['Kitchen', '/kitchen'],
    ['Bar', '/bar-stock'],
    ['Cashier', '/cashier']
  ]
  return (
    <nav className="mobile-nav">
      {links.map(([label, path]) => {
        const isActive = location.pathname === path
        return (
          <Link
            key={path}
            to={path}
            className={`mobile-nav-link ${isActive ? 'active' : ''}`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
