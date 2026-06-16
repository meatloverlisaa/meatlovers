import React, { useState } from 'react'
import { barApi } from '../api/barApi'
export default function BarIssuePage() {
const [form, setForm] = useState({
product_id: '',
quantity: '',
reference_number: '',
notes: '',
})
const [status, setStatus] = useState('')
async function submit(e) {
e.preventDefault()
try {
setStatus('Issuing stock...')
await barApi.issue({
product_id: Number(form.product_id),
quantity: Number(form.quantity),
reference_number: form.reference_number,
notes: form.notes,
})
setStatus('Bar stock issued successfully.')


setForm({
product_id: '',
quantity: '',
reference_number: '',
notes: '',
})
} catch (error) {
setStatus('Could not issue bar stock.')
}
}
return (
<main>
<h1>Issue Bar Stock</h1>
<p>Record bar stock movement for alcoholic drinks.</p>
{status ? <p>{status}</p> : null}
<form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
<input
placeholder="Product ID"
value={form.product_id}
onChange={(e) => setForm({ ...form, product_id: e.target.value })}
style={inputStyle}
/>
<input
placeholder="Quantity"
value={form.quantity}
onChange={(e) => setForm({ ...form, quantity: e.target.value })}
style={inputStyle}
/>
<input
placeholder="Reference Number"
value={form.reference_number}
onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
style={inputStyle}
/>
<textarea
placeholder="Notes"
value={form.notes}
onChange={(e) => setForm({ ...form, notes: e.target.value })}
style={inputStyle}
/>
<button style={buttonStyle}>
Issue Stock
</button>
</form>
</main>
)
}
const inputStyle = {
width: '100%',
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
