import React, { useState } from 'react'
import { websiteApi } from '../../website/api/websiteApi'
export default function CateringEnquiryPage() {
const [form, setForm] = useState({
full_name: '',
phone: '',
event_date: '',
guest_count: '',
location: '',
message: '',
})
const [status, setStatus] = useState('')
async function submit(e) {
e.preventDefault()
setStatus('Submitting...')
try {
await websiteApi.submitCatering(form)
setStatus('Catering enquiry submitted. Our team will contact you.')
} catch (error) {
setStatus('Could not submit now. Please call Meat Lovers directly.')
}
}
return (
<section className="section">
<div className="container grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
<div>
<h1>Catering Enquiry</h1>
<p>
Request catering for events, office meals, family gatherings, student groups, and corporate
functions.
</p>
</div>
<div className="card">
<form onSubmit={submit} className="grid">
<input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({
...form, full_name: e.target.value })} />
<input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form,
phone: e.target.value })} />
<input className="input" type="date" value={form.event_date} onChange={(e) => setForm({ ...form,
event_date: e.target.value })} />
<input className="input" placeholder="Guest count" value={form.guest_count} onChange={(e) =>
setForm({ ...form, guest_count: e.target.value })} />
<input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({
...form, location: e.target.value })} />
<textarea className="input" rows="4" placeholder="Message" value={form.message} onChange={(e) =>
setForm({ ...form, message: e.target.value })} />
<button className="btn" type="submit">Submit Catering Enquiry</button>
{status ? <p>{status}</p> : null}
</form>
</div>
</div>
</section>
)
}
