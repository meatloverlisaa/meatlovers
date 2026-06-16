import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { kitchenApi } from '../api/kitchenApi'
export default function KitchenQueuePage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['mobile-kitchen-orders'],
queryFn: kitchenApi.orders,
})
const preparingMutation = useMutation({
mutationFn: kitchenApi.markPreparing,
onSuccess: () => qc.invalidateQueries({ queryKey: ['mobile-kitchen-orders'] }),
})
const readyMutation = useMutation({
mutationFn: kitchenApi.markReady,
onSuccess: () => qc.invalidateQueries({ queryKey: ['mobile-kitchen-orders'] }),
})
return (
<main>
<h1>Kitchen Queue</h1>
<p>Food production queue for chef/kitchen staff.</p>
{isLoading ? <p>Loading kitchen orders...</p> : null}
{error ? <p>Could not load kitchen orders.</p> : null}
<div style={{ display: 'grid', gap: 12 }}>
{(data || []).map((order) => (
<div key={order.id} style={cardStyle}>
<strong>{order.order_number}</strong>
<p>Table: {order.table_number}</p>
<p>Status: {order.order_status}</p>
<p>Created: {order.created_at}</p>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
<button
onClick={() => preparingMutation.mutate(order.id)}
style={secondaryButton}
>
Mark Preparing
</button>


<button
onClick={() => readyMutation.mutate(order.id)}
style={primaryButton}
>
Mark Ready
</button>
</div>
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
const primaryButton = {
padding: 12,
borderRadius: 12,
border: 'none',
background: '#111827',
color: '#fff',
}
const secondaryButton = {
padding: 12,
borderRadius: 12,
border: '1px solid #111827',
background: '#fff',
color: '#111827',
}
