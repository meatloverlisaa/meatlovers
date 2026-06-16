import React from 'react'

export default function Page({ title, subtitle, children }) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="page-content">
        {children}
      </div>
    </div>
  )
}