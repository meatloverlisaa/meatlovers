import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function VisitHistoryPage() {
return (
<OperationalFormPage
title="Customer Visit History"
subtitle="Record and monitor customer visits"
queryKey="visit-history"
queryFn={operationsApi.visitHistory}
mutationFn={operationsApi.recordVisit}


initialForm={{
customer_id: '',
order_id: '',
visit_date: '',
visit_source: 'WALK_IN',
total_spent: '',
}}
buildPayload={(form) => ({
customer_id: Number(form.customer_id),
order_id: form.order_id ? Number(form.order_id) : null,
visit_date: form.visit_date,
visit_source: form.visit_source,
total_spent: Number(form.total_spent || 0),
})}
fields={[
{ name: 'customer_id', label: 'Customer ID', type: 'number' },
{ name: 'order_id', label: 'Order ID optional', type: 'number' },
{ name: 'visit_date', label: 'Visit Date', type: 'date' },
{
name: 'visit_source',
label: 'Visit Source',
type: 'select',
options: [
{ value: 'WALK_IN', label: 'Walk In' },
{ value: 'WEBSITE', label: 'Website' },
{ value: 'DELIVERY', label: 'Delivery' },
{ value: 'CATERING', label: 'Catering' },
{ value: 'PHONE', label: 'Phone' },
{ value: 'WHATSAPP', label: 'WhatsApp' },
],
},
{ name: 'total_spent', label: 'Total Spent', type: 'number' },
]}
columns={[
{ key: 'full_name', label: 'Customer' },
{ key: 'phone', label: 'Phone' },
{ key: 'visit_date', label: 'Visit Date' },
{ key: 'visit_source', label: 'Source' },
{ key: 'total_spent', label: 'Spent' },
]}
submitLabel="Record Visit"
/>
)
}
