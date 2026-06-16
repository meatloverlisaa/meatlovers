import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { menuApi } from '../api/menuApi'
import { useCart } from '../../../context/CartContext'
export default function MenuPage() {
const [category, setCategory] = useState('FOOD')
const { addItem } = useCart()
const { data, isLoading, error } = useQuery({
queryKey: ['pos-menu'],
queryFn: menuApi.products,
})
const products = useMemo(
() => (data || []).filter((item) => item.product_category === category),
[data, category]
)
return (
<main>
<h1>Menu</h1>
<div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16 }}>
<button onClick={() => setCategory('FOOD')} style={tabStyle}>Food</button>
<button onClick={() => setCategory('SOFT_DRINK')} style={tabStyle}>Soft Drinks</button>
<button onClick={() => setCategory('ALCOHOLIC_DRINK')} style={tabStyle}>Alcohol</button>
</div>
{isLoading ? <p>Loading menu...</p> : null}
{error ? <p>Could not load menu.</p> : null}
<div style={{ display: 'grid', gap: 12 }}>
{products.map((product) => (
<div key={product.id} style={cardStyle}>
<div>
<strong>{product.product_name}</strong>
<p>KES {product.selling_price}</p>
</div>
<button onClick={() => addItem(product)} style={buttonStyle}>
Add
</button>
</div>
))}
</div>
</main>
)
}
const tabStyle = {
padding: '10px 14px',
borderRadius: 999,
border: '1px solid #111827',
background: '#fff',
}
const cardStyle = {
background: '#fff',
padding: 14,
borderRadius: 14,
border: '1px solid #e5e7eb',
display: 'flex',
justifyContent: 'space-between',
gap: 12,
}
const buttonStyle = {
padding: '10px 14px',
borderRadius: 12,
border: 'none',
background: '#111827',
color: '#fff',
}
