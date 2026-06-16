import React, { useState } from 'react'
import apiClient from '../../../lib/apiClient'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      setError('')
      const { data } = await apiClient.post('/auth/login', form)
      localStorage.setItem('admin_token', data.data.token)
      localStorage.setItem('admin_user', JSON.stringify(data.data.user))
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: 20
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ color: 'var(--primary)', fontWeight: 700 }}>CIMS Operations Admin</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Meat Lovers CIMS powered by YohPal</p>
        </div>
        
        {error && <div className="status-message status-error">{error}</div>}
        
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="name@meatlovers.local"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          
          <button className="btn" type="submit" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
