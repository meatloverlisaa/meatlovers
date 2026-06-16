import React, { createContext, useContext, useMemo, useState } from 'react'



const CartContext = createContext(null)
export function CartProvider({ children }) {
const [tableNumber, setTableNumber] = useState('T01')
const [items, setItems] = useState([])
function addItem(product) {
setItems((current) => {
const existing = current.find((item) => item.product_id === product.id)
if (existing) {
return current.map((item) =>
item.product_id === product.id
? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
: item
)
}
return [
...current,
{
product_id: product.id,
product_name: product.product_name,
quantity: 1,
unit_price: Number(product.selling_price),
total_price: Number(product.selling_price),
},
]
})
}
function removeItem(productId) {
setItems((current) => current.filter((item) => item.product_id !== productId))
}
function clearCart() {
setItems([])
}
const subtotal = useMemo(
() => items.reduce((sum, item) => sum + Number(item.total_price), 0),
[items]
)
return (
<CartContext.Provider
value={{
tableNumber,
setTableNumber,
items,
addItem,
removeItem,
clearCart,
subtotal,
}}
>
{children}
</CartContext.Provider>
)
}
export function useCart() {
return useContext(CartContext)
}
