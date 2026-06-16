import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function StockOperationalPage() {
return (
<OperationalPage
title="Stock"
subtitle="Storekeeping stock balance and reorder visibility"
queryKey="ops-stock"
queryFn={operationsApi.stock}
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'product_category', label: 'Category' },
{ key: 'current_quantity', label: 'Current Quantity' },
{ key: 'reorder_level', label: 'Reorder Level' },
]}
/>
)
}
