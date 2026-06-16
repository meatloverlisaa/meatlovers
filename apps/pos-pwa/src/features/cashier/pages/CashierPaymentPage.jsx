import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { cashierApi } from '../api/cashierApi'
export default function CashierPaymentPage() {
const qc = useQueryClient()
const [search, setSearch] = useState('')
const [status, setStatus] = useState('')
const { data, isLoading, error } = useQuery({
queryKey: ['cashier-orders'],
queryFn: cashierApi.orders,
})
const cashMutation = useMutation({
mutationFn: ({ orderId, amount }) => cashierApi.cashSettle(orderId, { amount }),
onSuccess: () => {
setStatus('Cash payment settled successfully.')
qc.invalidateQueries({ queryKey: ['cashier-orders'] })
},
})
const mpesaMutation = useMutation({
mutationFn: ({ orderId, phone }) => cashierApi.mpesaPending(orderId, { phone }),
onSuccess: () => {
setStatus('M-Pesa payment marked as pending.')
qc.invalidateQueries({ queryKey: ['cashier-orders'] })
},
})
const orders = useMemo(() => {
const list = data || []
return list.filter((order) => {
const text = `${order.order_number} ${order.table_number} ${order.order_status}`.toLowerCase()
return text.includes(search.toLowerCase())
})
}, [data, search])
return (
<main>
<h1>Cashier Payments</h1>
<p>Search orders, settle cash, or mark M-Pesa as pending.</p>
{status ? <p>{status}</p> : null}
{isLoading ? <p>Loading orders...</p> : null}
{error ? <p>Could not load orders.</p> : null}
{cashMutation.error ? <p>Cash settlement failed.</p> : null}
{mpesaMutation.error ? <p>M-Pesa pending update failed.</p> : null}
<input
placeholder="Search by order number, table, or status"
value={search}
onChange={(e) => setSearch(e.target.value)}
style={inputStyle}
/>
<div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
{orders.map((order) => (
<OrderPaymentCard
key={order.id}
order={order}
onCash={(amount) => cashMutation.mutate({ orderId: order.id, amount })}
onMpesa={(phone) => mpesaMutation.mutate({ orderId: order.id, phone })}
/>
))}
</div>
</main>
)
}
function OrderPaymentCard({ order, onCash, onMpesa }) {
const [amount, setAmount] = useState(order.total_amount || '')
const [phone, setPhone] = useState('')
return (
<section style={cardStyle}>
<strong>{order.order_number}</strong>
<p>Table: {order.table_number}</p>
<p>Status: {order.order_status}</p>


<p>Total: KES {order.total_amount}</p>
<input
placeholder="Cash amount received"
value={amount}
onChange={(e) => setAmount(e.target.value)}
style={inputStyle}
/>
<button onClick={() => onCash(Number(amount))} style={buttonStyle}>
Settle Cash
</button>
<input
placeholder="Customer M-Pesa phone"
value={phone}
onChange={(e) => setPhone(e.target.value)}
style={inputStyle}
/>
<button onClick={() => onMpesa(phone)} style={secondaryButton}>
Mark M-Pesa Pending
</button>
<Link to={`/receipt/${order.id}`} style={receiptLink}>
View Receipt
</Link>
</section>
)
}
const cardStyle = {
background: '#fff',
padding: 14,
borderRadius: 14,
border: '1px solid #e5e7eb',
display: 'grid',
gap: 8,
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
const secondaryButton = {
padding: 14,
borderRadius: 12,
border: '1px solid #111827',
background: '#fff',
color: '#111827',
}
const receiptLink = {
padding: 12,
borderRadius: 12,
background: '#f3f4f6',
textAlign: 'center',
}
