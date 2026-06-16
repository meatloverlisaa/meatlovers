import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function WastageControlPage() {
return (
<OperationalFormPage
title="Wastage Control"
subtitle="Record food wastage and reduce production loss"
queryKey="ops-unsold-food"
queryFn={operationsApi.unsoldFood}
mutationFn={operationsApi.recordWastage}
initialForm={{
product_id: '',
production_plan_id: '',
wasted_quantity: '',
estimated_cost: '',
wastage_reason: '',
}}
buildPayload={(form) => ({
product_id: Number(form.product_id),
production_plan_id: form.production_plan_id ? Number(form.production_plan_id) : null,
wasted_quantity: Number(form.wasted_quantity),
estimated_cost: Number(form.estimated_cost || 0),
wastage_reason: form.wastage_reason,
})}
fields={[


{ name: 'product_id', label: 'Product ID', type: 'number' },
{ name: 'production_plan_id', label: 'Production Plan ID optional', type: 'number' },
{ name: 'wasted_quantity', label: 'Wasted Quantity', type: 'number' },
{ name: 'estimated_cost', label: 'Estimated Cost', type: 'number' },
{ name: 'wastage_reason', label: 'Wastage Reason', type: 'textarea' },
]}
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'quantity', label: 'Quantity' },
{ key: 'reason', label: 'Reason' },
{ key: 'declared_by_name', label: 'Declared By' },
{ key: 'created_at', label: 'Date' },
]}
submitLabel="Record Wastage"
/>
)
}
