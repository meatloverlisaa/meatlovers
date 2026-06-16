import React from 'react'
import LeadForm from '../../../components/LeadForm'
const drinks = [
['Coca-Cola 500ml', '120'],
['Fanta 500ml', '120'],
['Sprite 500ml', '120'],
['Stoney 500ml', '120'],
['Water 500ml', '100'],
['Fresh Juice Glass', '200'],
]
export default function SoftDrinksPage() {
return (
<section className="section">
<div className="container">
<h1>Soft Drinks</h1>
<p>Soft drinks are tracked separately for accurate stock and sales control.</p>
<div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 24 }}>
{drinks.map(([name, price]) => (
<div className="card" key={name}>
<h3>{name}</h3>
<p>KES {price}</p>
</div>
))}
</div>
<div className="card" style={{ marginTop: 32 }}>
<h3>Ask about drinks availability</h3>
<LeadForm type="SOFT_DRINKS" />
</div>
</div>
</section>
)
}
