import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function UnsoldFoodOperationalPage() {
return (
<OperationalPage
title="Unsold Cooked Food"
subtitle="Declared unsold food for waste and theft control"
queryKey="ops-unsold-food"
queryFn={operationsApi.unsoldFood}
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'quantity', label: 'Quantity' },
{ key: 'reason', label: 'Reason' },
{ key: 'declared_by_name', label: 'Declared By' },
{ key: 'created_at', label: 'Date' },
]}
/>
)
}
