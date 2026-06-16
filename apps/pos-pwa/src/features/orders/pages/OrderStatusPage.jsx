import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'
export default function OrderStatusPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['pos-orders'],
queryFn: ordersApi.list,
})
return (
<main>
<h1>Order Status</h1>
{isLoading ? <p>Loading orders...</p> : null}
{error ? <p>Could not load orders.</p> : null}
<div style={{ display: 'grid', gap: 12 }}>
{(data || []).map((order) => (
<div key={order.id} style={cardStyle}>
<strong>{order.order_number}</strong>
<p>Table: {order.table_number}</p>
<p>Status: {order.order_status}</p>
<p>Total: KES {order.total_amount}</p>
</div>
))}


</div>
</main>
)
}
const cardStyle = {
background: '#fff',
padding: 14,
borderRadius: 14,
border: '1px solid #e5e7eb',
}
