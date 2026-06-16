import React, { useState } from 'react'
import { ordersApi } from '../../orders/api/ordersApi'
export default function RequestsPage() {
const [cancelForm, setCancelForm] = useState({ order_id: '', reason: '' })
const [discountForm, setDiscountForm] = useState({ order_id: '', reason: '', discount_amount: '' })
const [status, setStatus] = useState('')
async function requestCancel(e) {
e.preventDefault()
try {
await ordersApi.requestCancellation(cancelForm.order_id, {
reason: cancelForm.reason,
})
setStatus('Cancellation request submitted for approval.')
} catch (error) {
setStatus('Could not submit cancellation request.')
}
}
async function requestDiscount(e) {
e.preventDefault()
try {
await ordersApi.requestDiscount(discountForm.order_id, {
reason: discountForm.reason,
discount_amount: Number(discountForm.discount_amount),
})
setStatus('Discount request submitted for approval.')
} catch (error) {
setStatus('Could not submit discount request.')
}
}
return (
<main>
<h1>Approval Requests</h1>
{status ? <p>{status}</p> : null}
<section style={cardStyle}>
<h3>Cancel Order Request</h3>
<form onSubmit={requestCancel} style={{ display: 'grid', gap: 10 }}>
<input
placeholder="Order ID"
value={cancelForm.order_id}
onChange={(e) => setCancelForm({ ...cancelForm, order_id: e.target.value })}
style={inputStyle}
/>
<textarea
placeholder="Reason"
value={cancelForm.reason}
onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
style={inputStyle}
/>
<button style={buttonStyle}>Submit Cancellation</button>
</form>
</section>
<section style={cardStyle}>
<h3>Discount Request</h3>
<form onSubmit={requestDiscount} style={{ display: 'grid', gap: 10 }}>
<input
placeholder="Order ID"
value={discountForm.order_id}


onChange={(e) => setDiscountForm({ ...discountForm, order_id: e.target.value })}
style={inputStyle}
/>
<input
placeholder="Discount Amount"
value={discountForm.discount_amount}
onChange={(e) => setDiscountForm({ ...discountForm, discount_amount: e.target.value })}
style={inputStyle}
/>
<textarea
placeholder="Reason"
value={discountForm.reason}
onChange={(e) => setDiscountForm({ ...discountForm, reason: e.target.value })}
style={inputStyle}
/>
<button style={buttonStyle}>Submit Discount</button>
</form>
</section>
</main>
)
}
const cardStyle = {
background: '#fff',
padding: 14,
borderRadius: 14,
border: '1px solid #e5e7eb',
marginBottom: 16,
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
