import React, { useState } from 'react'
import { authApi } from '../api/authApi'
export default function LoginPage() {
const [form, setForm] = useState({ email: '', password: '' })
const [error, setError] = useState('')
async function submit(e) {
e.preventDefault()
try {
setError('')
const result = await authApi.login(form)
localStorage.setItem('pos_token', result.token)
localStorage.setItem('pos_user', JSON.stringify(result.user))
window.location.href = '/menu'
} catch (err) {
setError('Invalid login credentials')
}
}
return (
<main style={{ padding: 20 }}>
<h1>Waiter POS Login</h1>
<p>Meat Lovers CIMS powered by YohPal</p>
{error ? <p style={{ color: 'red' }}>{error}</p> : null}
<form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
<input
placeholder="Email"
value={form.email}
onChange={(e) => setForm({ ...form, email: e.target.value })}
style={inputStyle}
/>
<input
placeholder="Password"
type="password"
value={form.password}
onChange={(e) => setForm({ ...form, password: e.target.value })}
style={inputStyle}
/>
<button style={buttonStyle}>Open POS</button>
</form>
</main>
)
}
const inputStyle = {
padding: 14,
borderRadius: 12,
border: '1px solid #d1d5db',
}
const buttonStyle = {
padding: 14,
borderRadius: 12,
border: 'none',
background: '#111827',
color: '#fff',
}
