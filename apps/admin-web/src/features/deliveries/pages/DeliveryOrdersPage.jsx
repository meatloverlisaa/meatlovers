import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function DeliveryOrdersPage() {
return (
<OperationalFormPage
title="Delivery Orders"
subtitle="Create and monitor delivery orders"
queryKey="delivery-orders"
queryFn={operationsApi.dispatchOrders}
mutationFn={operationsApi.createDeliveryOrder}
initialForm={{
order_id: '',
customer_id: '',
delivery_address: '',
delivery_fee: '',
rider_name: '',
rider_phone: '',
delivery_notes: '',
}}
buildPayload={(form) => ({
...form,
order_id: Number(form.order_id),
customer_id: Number(form.customer_id),
delivery_fee: Number(form.delivery_fee || 0),
})}
fields={[
{ name: 'order_id', label: 'Order ID', type: 'number' },
{ name: 'customer_id', label: 'Customer ID', type: 'number' },
{ name: 'delivery_address', label: 'Delivery Address', type: 'textarea' },
{ name: 'delivery_fee', label: 'Delivery Fee', type: 'number' },
{ name: 'rider_name', label: 'Rider Name Optional' },


{ name: 'rider_phone', label: 'Rider Phone Optional' },
{ name: 'delivery_notes', label: 'Delivery Notes', type: 'textarea' },
]}
columns={[
{ key: 'order_number', label: 'Order' },
{ key: 'customer_name', label: 'Customer' },
{ key: 'delivery_status', label: 'Status' },
{ key: 'delivery_fee', label: 'Fee' },
{ key: 'rider_name', label: 'Rider' },
{ key: 'rider_phone', label: 'Rider Phone' },
]}
submitLabel="Create Delivery"
/>
)
}
