import React, { useState } from 'react'
import { ordersApi } from '../../orders/api/ordersApi'
import { useCart } from '../../../context/CartContext'
export default function CartPage() {
const { tableNumber, items, removeItem, clearCart, subtotal } = useCart()
const [paymentMethod, setPaymentMethod] = useState('CASH')
const [status, setStatus] = useState('')
async function createOrder() {
const user = JSON.parse(localStorage.getItem('pos_user') || '{}')
if (!items.length) {
setStatus('Cart is empty')
return
}
try {
setStatus('Creating order...')
const result = await ordersApi.create({
customer_id: 1,
waiter_id: user.id,
table_number: tableNumber,
subtotal,
discount_amount: 0,
total_amount: subtotal,
payment_method: paymentMethod,
items,
})
setStatus(`Order created: ${result.order_number}. Payment pending via ${paymentMethod}.`)
clearCart()
} catch (error) {
setStatus('Could not create order')
}
}
return (
<main>
<h1>Cart</h1>
<p>Table: <strong>{tableNumber}</strong></p>
<div style={{ display: 'grid', gap: 10 }}>
{items.map((item) => (
<div key={item.product_id} style={cardStyle}>
<div>
<strong>{item.product_name}</strong>
<p>{item.quantity} × KES {item.unit_price}</p>


</div>
<button onClick={() => removeItem(item.product_id)}>Remove</button>
</div>
))}
</div>
<h2>Total: KES {subtotal}</h2>
<select
value={paymentMethod}
onChange={(e) => setPaymentMethod(e.target.value)}
style={inputStyle}
>
<option value="CASH">Cash Pending</option>
<option value="MPESA">M-Pesa Pending</option>
</select>
<br />
<br />
<button onClick={createOrder} style={buttonStyle}>
Create Order
</button>
{status ? <p>{status}</p> : null}
</main>
)
}
const cardStyle = {
background: '#fff',
padding: 14,
borderRadius: 14,
border: '1px solid #e5e7eb',
display: 'flex',
justifyContent: 'space-between',
}
const inputStyle = {
width: '100%',
padding: 14,
borderRadius: 12,
border: '1px solid #d1d5db',
}
const buttonStyle = {
width: '100%',
padding: 14,
borderRadius: 12,
border: 'none',
background: '#111827',
color: '#fff',
}
