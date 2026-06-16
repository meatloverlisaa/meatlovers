import React, { useState } from 'react'
import { websiteApi } from '../../website/api/websiteApi'
export default function FeedbackPage() {
const [form, setForm] = useState({
full_name: '',
phone: '',
rating: '5',
message: '',
})
const [status, setStatus] = useState('')
async function submit(e) {
e.preventDefault()
setStatus('Submitting...')
try {
await websiteApi.submitFeedback(form)
setStatus('Thank you for your feedback.')
} catch (error) {
setStatus('Could not submit feedback now.')
}
}
return (
<section className="section">
<div className="container grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
<div>
<h1>Customer Feedback</h1>
<p>
Your feedback helps Meat Lovers improve food, service, delivery, and customer experience.
</p>
</div>
<div className="card">
<form onSubmit={submit} className="grid">
<input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({
...form, full_name: e.target.value })} />
<input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form,
phone: e.target.value })} />
<select className="input" value={form.rating} onChange={(e) => setForm({ ...form, rating:
e.target.value })}>
<option value="5">5 - Excellent</option>


<option value="4">4 - Good</option>
<option value="3">3 - Average</option>
<option value="2">2 - Poor</option>
<option value="1">1 - Very Poor</option>
</select>
<textarea className="input" rows="4" placeholder="Your feedback" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
<button className="btn" type="submit">Submit Feedback</button>
{status ? <p>{status}</p> : null}
</form>
</div>
</div>
</section>
)
}
