import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { staffMotivationApi } from '../api/staffMotivationApi'
export default function CustomerRatingPage() {
return (
<OperationalFormPage
title="Customer Rating Capture"
subtitle="Record customer service ratings for staff motivation"
queryKey="service-performance"
queryFn={staffMotivationApi.servicePerformance}
mutationFn={staffMotivationApi.createCustomerRating}
initialForm={{
order_id: '',
staff_id: '',
rating: '5',
comment: '',
rating_source: 'MANAGER_ENTRY',
}}
buildPayload={(form) => ({
...form,
order_id: form.order_id ? Number(form.order_id) : null,
staff_id: Number(form.staff_id),
rating: Number(form.rating),
})}
fields={[
{ name: 'order_id', label: 'Order ID optional', type: 'number' },
{ name: 'staff_id', label: 'Staff ID', type: 'number' },
{
name: 'rating',
label: 'Rating',
type: 'select',
options: [
{ value: '5', label: '5 - Excellent' },
{ value: '4', label: '4 - Good' },
{ value: '3', label: '3 - Average' },
{ value: '2', label: '2 - Poor' },
{ value: '1', label: '1 - Very Poor' },
],
},
{ name: 'comment', label: 'Customer Comment', type: 'textarea' },
]}
columns={[
{ key: 'full_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'sales_amount', label: 'Sales' },
{ key: 'orders_served', label: 'Orders' },
{ key: 'customer_rating', label: 'Rating' },
{ key: 'bonus_amount', label: 'Bonus' },
]}
submitLabel="Save Rating"
/>
)
}
