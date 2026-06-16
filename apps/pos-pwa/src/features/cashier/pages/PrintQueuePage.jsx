import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { cashierApi } from '../api/cashierApi'
export default function PrintQueuePage() {
const { data, isLoading, error } = useQuery({
queryKey: ['print-queue'],
queryFn: cashierApi.printQueue,
})
return (
<main>
<h1>Print Queue</h1>


<p>Kitchen, bar, and receipt print queue placeholder.</p>
{isLoading ? <p>Loading print queue...</p> : null}
{error ? <p>Could not load print queue.</p> : null}
<div style={{ display: 'grid', gap: 12 }}>
{(data || []).map((item) => (
<section key={item.id} style={cardStyle}>
<strong>{item.print_type}</strong>
<p>Order: {item.order_number}</p>
<p>Status: {item.print_status}</p>
<p>Created: {item.created_at}</p>
</section>
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
