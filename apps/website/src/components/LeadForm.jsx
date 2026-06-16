import React, { useState } from 'react'
import { websiteApi } from '../features/website/api/websiteApi'
export default function LeadForm({ type = 'GENERAL' }) {
const [form, setForm] = useState({
full_name: '',
phone: '',
email: '',
message: '',
interest_type: type,
})
const [status, setStatus] = useState('')
async function submit(e) {
e.preventDefault()
setStatus('Submitting...')
try {
await websiteApi.submitLead(form)
setStatus('Thank you. Meat Lovers will contact you shortly.')
setForm({
full_name: '',
phone: '',
email: '',
message: '',
interest_type: type,
})
} catch (error) {
setStatus('Could not submit now. Please call or WhatsApp Meat Lovers directly.')
}
}
return (
<form onSubmit={submit} className="grid">
<input
className="input"
placeholder="Your name"
value={form.full_name}
onChange={(e) => setForm({ ...form, full_name: e.target.value })}
/>
<input
className="input"
placeholder="Phone number"
value={form.phone}
onChange={(e) => setForm({ ...form, phone: e.target.value })}
/>
<input
className="input"
placeholder="Email optional"
value={form.email}
onChange={(e) => setForm({ ...form, email: e.target.value })}


/>
<textarea
className="input"
rows="4"
placeholder="Tell us what you need"
value={form.message}
onChange={(e) => setForm({ ...form, message: e.target.value })}
/>
<button className="btn" type="submit">
Send Enquiry
</button>
{status ? <p>{status}</p> : null}
</form>
)
}
