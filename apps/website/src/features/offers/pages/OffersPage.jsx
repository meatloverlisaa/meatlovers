import React from 'react'
import LeadForm from '../../../components/LeadForm'
export default function OffersPage() {
return (
<section className="section">
<div className="container">
<h1>Offers</h1>
<p>Meat Lovers promotions help convert website visitors into real customers.</p>
<div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 24 }}>
<div className="card">
<h3>Lunch Combo</h3>
<p>Ask about today’s lunch combo offer.</p>
</div>
<div className="card">
<h3>Group Meal</h3>
<p>Ideal for friends, students, office groups, and events.</p>
</div>
<div className="card">
<h3>Weekend Choma</h3>
<p>Weekend meat specials and group table bookings.</p>
</div>
</div>
<div className="card" style={{ marginTop: 32 }}>
<h3>Claim or ask about an offer</h3>
<LeadForm type="OFFERS" />
</div>
</div>
</section>
)
}
