import React from 'react'
import { useCart } from '../../../context/CartContext'


const tables = ['T01', 'T02', 'T03', 'T04', 'T05', 'VIP01', 'BAR01', 'TAKEAWAY']
export default function TableSelectionPage() {
const { tableNumber, setTableNumber } = useCart()
return (
<main>
<h1>Select Table</h1>
<p>Current table: <strong>{tableNumber}</strong></p>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
{tables.map((table) => (
<button
key={table}
onClick={() => setTableNumber(table)}
style={{
padding: 20,
borderRadius: 16,
border: tableNumber === table ? '2px solid #111827' : '1px solid #d1d5db',
background: tableNumber === table ? '#111827' : '#fff',
color: tableNumber === table ? '#fff' : '#111827',
}}
>
{table}
</button>
))}
</div>
</main>
)
}
