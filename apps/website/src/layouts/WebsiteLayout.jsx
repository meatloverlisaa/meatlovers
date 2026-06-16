import React from 'react'
import { Link, Outlet } from 'react-router-dom'
export default function WebsiteLayout() {
return (
<>
<header className="nav">
<div className="container nav-inner">
<Link to="/">
<strong>Meat Lovers powered by YohPal</strong>
</Link>
<nav className="nav-links">
<Link to="/menu/food">Food</Link>
<Link to="/menu/soft-drinks">Soft Drinks</Link>
<Link to="/menu/alcoholic-drinks">Bar</Link>
<Link to="/offers">Offers</Link>
<Link to="/catering">Catering</Link>
<Link to="/delivery">Delivery</Link>
<Link to="/ai-order-assistant">AI Assistant</Link>
</nav>
</div>
</header>
<Outlet />
<footer className="footer">
<div className="container">
<strong>Meat Lovers CIMS powered by YohPal</strong>
<p>Smart restaurant operations, customer acquisition, and sales growth system.</p>
</div>
</footer>
</>
)
}
