import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { barApi } from '../api/barApi'
export default function BarStockPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['mobile-bar-stock'],
queryFn: barApi.stock,
})
const lowStock = (data || []).filter(
(item) => Number(item.current_quantity) <= Number(item.reorder_level)
)
return (
<main>
<h1>Bar Stock</h1>
<p>Alcoholic drinks accountability and low-stock control.</p>
<Link to="/bar-issue" style={buttonStyle}>
Issue Bar Stock
</Link>
{lowStock.length > 0 ? (
<div style={alertStyle}>
<strong>Low Stock Alert</strong>
<p>{lowStock.length} bar items are at or below reorder level.</p>
</div>
) : null}
{isLoading ? <p>Loading bar stock...</p> : null}
{error ? <p>Could not load bar stock.</p> : null}
<div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
{(data || []).map((item) => (
<div key={item.id} style={cardStyle}>
<strong>{item.product_name}</strong>
<p>Quantity: {item.current_quantity}</p>
<p>Reorder Level: {item.reorder_level}</p>
{Number(item.current_quantity) <= Number(item.reorder_level) ? (
<span style={badgeStyle}>LOW STOCK</span>


) : (
<span style={okBadgeStyle}>OK</span>
)}
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
const alertStyle = {
background: '#fff1f2',
color: '#be123c',
border: '1px solid #fecdd3',
padding: 14,
borderRadius: 14,
marginTop: 16,
}
const badgeStyle = {
display: 'inline-block',
padding: '5px 10px',
borderRadius: 999,
background: '#fee2e2',
color: '#991b1b',
fontSize: 12,
}
const okBadgeStyle = {
display: 'inline-block',
padding: '5px 10px',
borderRadius: 999,
background: '#dcfce7',
color: '#166534',
fontSize: 12,
}
const buttonStyle = {
display: 'inline-block',
padding: '12px 14px',
borderRadius: 12,
border: 'none',
background: '#111827',
color: '#fff',
}
