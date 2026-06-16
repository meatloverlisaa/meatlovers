import React from 'react'
import { Link } from 'react-router-dom'
import LeadForm from '../../../components/LeadForm'
export default function HomePage() {
return (
<>
<section className="hero">
<div className="container">
<h1>Meat Lovers powered by YohPal</h1>
<p>
Discover great food, drinks, offers, deliveries, catering, and smart restaurant service.
</p>
<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
<Link className="btn" to="/ai-order-assistant">
Ask AI What To Order
</Link>
<Link className="btn btn-secondary" to="/menu/food">
View Menu
</Link>
</div>
</div>
</section>
<section className="section">
<div className="container grid grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
<div className="card">
<h3>Food</h3>
<p>Choma, meals, sides, and restaurant specials.</p>
<Link to="/menu/food">Explore food →</Link>
</div>
<div className="card">
<h3>Soft Drinks</h3>
<p>Refreshments, water, juices, and soft drinks.</p>
<Link to="/menu/soft-drinks">Explore drinks →</Link>
</div>
<div className="card">
<h3>Bar</h3>
<p>Alcoholic drinks served under controlled bar operations.</p>
<Link to="/menu/alcoholic-drinks">Explore bar →</Link>
</div>
</div>
</section>
<section className="section" style={{ background: '#fff' }}>
<div className="container grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
<div>
<h2>Need catering, delivery, or group booking?</h2>
<p>
Send your request and our team will contact you.
</p>
</div>
<div className="card">
<LeadForm type="GENERAL" />
</div>
</div>
</section>


</>
)
}
