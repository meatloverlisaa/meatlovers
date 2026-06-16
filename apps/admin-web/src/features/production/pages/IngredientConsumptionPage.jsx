import React from 'react'


import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function IngredientConsumptionPage() {
return (
<OperationalFormPage
title="Ingredient Consumption"
subtitle="Record ingredients consumed by production plan or order"
queryKey="stock-movement-report"
queryFn={operationsApi.stockMovementReport}
mutationFn={operationsApi.recordIngredientConsumption}
initialForm={{
production_plan_id: '',
order_id: '',
product_id: '',
consumed_quantity: '',
consumption_source: 'PRODUCTION_PLAN',
}}
buildPayload={(form) => ({
production_plan_id: form.production_plan_id ? Number(form.production_plan_id) : null,
order_id: form.order_id ? Number(form.order_id) : null,
product_id: Number(form.product_id),
consumed_quantity: Number(form.consumed_quantity),
consumption_source: form.consumption_source,
})}
fields={[
{ name: 'production_plan_id', label: 'Production Plan ID optional', type: 'number' },
{ name: 'order_id', label: 'Order ID optional', type: 'number' },
{ name: 'product_id', label: 'Ingredient Product ID', type: 'number' },
{ name: 'consumed_quantity', label: 'Consumed Quantity', type: 'number' },
{
name: 'consumption_source',
label: 'Consumption Source',
type: 'select',
options: [
{ value: 'PRODUCTION_PLAN', label: 'Production Plan' },
{ value: 'ORDER', label: 'Order' },
{ value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustment' },
],
},
]}
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'movement_type', label: 'Movement' },
{ key: 'quantity', label: 'Quantity' },
{ key: 'reference_number', label: 'Reference' },
{ key: 'created_at', label: 'Date' },
]}
submitLabel="Record Consumption"
/>
)
}
