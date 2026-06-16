import React, { useState } from 'react'
import { websiteApi } from '../../website/api/websiteApi'
export default function DeliveryEnquiryPage() {
const [form, setForm] = useState({
full_name: '',
phone: '',
delivery_address: '',
order_request: '',
})
const [status, setStatus] = useState('')
async function submit(e) {
e.preventDefault()
setStatus('Submitting...')
try {
await websiteApi.submitDelivery(form)


setStatus('Delivery enquiry submitted. Our team will contact you.')
} catch (error) {
setStatus('Could not submit now. Please call or WhatsApp Meat Lovers directly.')
}
}
return (
<section className="section">
<div className="container grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
<div>
<h1>Delivery Enquiry</h1>
<p>
Request food delivery and our team will confirm availability, price, and dispatch.
</p>
</div>
<div className="card">
<form onSubmit={submit} className="grid">
<input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({
...form, full_name: e.target.value })} />
<input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form,
phone: e.target.value })} />
<textarea className="input" rows="3" placeholder="Delivery address" value={form.delivery_address}
onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} />
<textarea className="input" rows="4" placeholder="What would you like to order?" value=
{form.order_request} onChange={(e) => setForm({ ...form, order_request: e.target.value })} />
<button className="btn" type="submit">Submit Delivery Enquiry</button>
{status ? <p>{status}</p> : null}
</form>
</div>
</div>
</section>
)
}
