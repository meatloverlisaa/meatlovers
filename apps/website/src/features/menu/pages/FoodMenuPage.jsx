import React from 'react'


import LeadForm from '../../../components/LeadForm'
const foodItems = [
['Beef Choma Plate', '650'],
['Chicken Choma Plate', '750'],
['Pork Ribs Plate', '850'],
['Ugali', '100'],
['Chips', '250'],
['Kachumbari', '100'],
['Mukimo', '200'],
['Pilau', '350'],
]
export default function FoodMenuPage() {
return (
<section className="section">
<div className="container">
<h1>Food Menu</h1>
<p>Food items are separated from soft drinks and alcoholic drinks for better service and
accountability.</p>
<div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 24 }}>
{foodItems.map(([name, price]) => (
<div className="card" key={name}>
<h3>{name}</h3>
<p>KES {price}</p>
</div>
))}
</div>
<div className="card" style={{ marginTop: 32 }}>
<h3>Want to reserve or order?</h3>
<LeadForm type="FOOD_ORDER" />
</div>
</div>
</section>
)
}
