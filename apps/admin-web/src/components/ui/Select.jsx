import React from 'react'

export default function Select({ children, className = '', ...props }) {
  return (
    <select 
      className={`input ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
