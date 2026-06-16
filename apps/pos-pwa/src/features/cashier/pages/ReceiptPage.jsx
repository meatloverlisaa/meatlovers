import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cashierApi } from '../api/cashierApi'
export default function ReceiptPage() {
const { orderId } = useParams()
const { data, isLoading, error } = useQuery({
queryKey: ['receipt', orderId],


queryFn: () => cashierApi.receipt(orderId),
})
return (
<main>
<h1>Receipt</h1>
{isLoading ? <p>Loading receipt...</p> : null}
{error ? <p>Could not load receipt.</p> : null}
{data ? (
<section style={receiptStyle}>
<h2>Meat Lovers</h2>
<p>Powered by YohPal</p>
<hr />
<p>Order: {data.order.order_number}</p>
<p>Table: {data.order.table_number}</p>
<p>Status: {data.order.order_status}</p>
<hr />
{(data.items || []).map((item) => (
<div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
<span>{item.product_name} x {item.quantity}</span>
<span>KES {item.total_price}</span>
</div>
))}
<hr />
<h3>Total: KES {data.order.total_amount}</h3>
<h4>Payments</h4>
{(data.payments || []).map((payment) => (
<p key={payment.id}>
{payment.payment_method}: KES {payment.amount} — {payment.payment_status}
</p>
))}
<button onClick={() => window.print()} style={buttonStyle}>
Print Receipt
</button>
</section>
) : null}
</main>
)
}
const receiptStyle = {
background: '#fff',
padding: 18,
borderRadius: 14,
border: '1px solid #e5e7eb',
}
const buttonStyle = {
width: '100%',
marginTop: 16,
padding: 14,
borderRadius: 12,
border: 'none',
background: '#111827',
color: '#fff',
}
