import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function BarOperationalPage() {
return (
<OperationalPage
title="Bar"
subtitle="Alcoholic drinks stock and bar accountability"
queryKey="ops-bar"
queryFn={operationsApi.barStock}
columns={[
{ key: 'product_name', label: 'Drink' },
{ key: 'product_category', label: 'Category' },
{ key: 'current_quantity', label: 'Current Quantity' },
{ key: 'reorder_level', label: 'Reorder Level' },
]}
/>
)
}
