import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function KitchenOperationalPage() {
return (
<OperationalPage
title="Kitchen"
subtitle="Food production queue and kitchen readiness"
queryKey="ops-kitchen"
queryFn={operationsApi.kitchenOrders}


columns={[
{ key: 'order_number', label: 'Order No.' },
{ key: 'table_number', label: 'Table' },
{ key: 'order_status', label: 'Status' },
{ key: 'created_at', label: 'Created' },
]}
/>
)
}
