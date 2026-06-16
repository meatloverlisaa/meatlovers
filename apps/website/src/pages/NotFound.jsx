import React from 'react'
import { Link } from 'react-router-dom'
export default function NotFound() {
return (
<section className="section">
<div className="container">
<h1>Page not found</h1>
<p>The page you are looking for does not exist.</p>
<Link className="btn" to="/">Go Home</Link>
</div>
</section>
)
}
