import React from 'react'

export default function LoadingBlock({ label = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{label}</p>
    </div>
  )
}