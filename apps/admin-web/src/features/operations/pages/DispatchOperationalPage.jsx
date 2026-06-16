import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function DispatchOperationalPage() {
return (
<OperationalPage
title="Dispatch"
subtitle="Delivery dispatch queue and rider tracking"
queryKey="ops-dispatch"
queryFn={operationsApi.dispatchOrders}
columns={[
{ key: 'order_number', label: 'Order No.' },
{ key: 'customer_name', label: 'Customer' },
{ key: 'delivery_status', label: 'Status' },
{ key: 'rider_name', label: 'Rider' },
{ key: 'rider_phone', label: 'Rider Phone' },
]}
/>
)
}
