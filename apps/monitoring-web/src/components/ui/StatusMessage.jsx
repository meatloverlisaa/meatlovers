import React from 'react'

export default function StatusMessage({ error, success }) {
  if (error) {
    return <div className="status-message status-error">{error}</div>
  }
  if (success) {
    return <div className="status-message status-success">{success}</div>
  }
  return null
}