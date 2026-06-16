import React from 'react'
import { Outlet } from 'react-router-dom'
import MobileNav from '../components/common/MobileNav'
export default function PosLayout() {
return (
<div style={{ minHeight: '100vh', padding: 16, paddingBottom: 90, background: '#f8fafc' }}>
<header style={{ marginBottom: 16 }}>
<strong>Meat Lovers POS powered by YohPal</strong>
</header>
<Outlet />
<MobileNav />
</div>
)
}
