import React from 'react'
import LeadForm from '../../../components/LeadForm'
const alcoholicDrinks = [
['Tusker Lager', '300'],
['Tusker Malt', '350'],
['White Cap', '350'],
['Guinness', '350'],
['Balozi', '300'],
['House Wine Glass', '450'],
]
export default function AlcoholicDrinksPage() {
return (
<section className="section">
<div className="container">
<h1>Alcoholic Drinks</h1>
<p>Bar items are separated from food and soft drinks for accountability and stock control.</p>
<div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 24 }}>
{alcoholicDrinks.map(([name, price]) => (
<div className="card" key={name}>
<h3>{name}</h3>
<p>KES {price}</p>
</div>
))}
</div>
<div className="card" style={{ marginTop: 32 }}>
<h3>Ask about bar menu</h3>
<LeadForm type="ALCOHOLIC_DRINKS" />
</div>
</div>
</section>
)
}
