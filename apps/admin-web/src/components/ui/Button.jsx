import React from 'react'

export default function Button({ onClick, children, className = '', type = 'button' }) {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`btn ${className}`}
    >
      {children}
    </button>
  )
}