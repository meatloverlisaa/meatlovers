import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function ProductionPlansPage() {
return (
<OperationalFormPage
title="Kitchen Production Plans"
subtitle="Plan kitchen production and monitor planned vs produced food"
queryKey="production-plans"
queryFn={operationsApi.productionPlans}
mutationFn={operationsApi.createProductionPlan}
initialForm={{
production_date: '',
menu_product_id: '',
planned_quantity: '',
}}
buildPayload={(form) => ({
...form,
menu_product_id: Number(form.menu_product_id),
planned_quantity: Number(form.planned_quantity),
})}
fields={[
{ name: 'production_date', label: 'Production Date', type: 'date' },
{ name: 'menu_product_id', label: 'Menu Product ID', type: 'number' },
{ name: 'planned_quantity', label: 'Planned Quantity', type: 'number' },
]}
columns={[
{ key: 'production_date', label: 'Date' },
{ key: 'product_name', label: 'Menu Item' },
{ key: 'planned_quantity', label: 'Planned' },
{ key: 'produced_quantity', label: 'Produced' },
{ key: 'sold_quantity', label: 'Sold' },
{ key: 'wasted_quantity', label: 'Wasted' },
{ key: 'production_status', label: 'Status' },
]}
submitLabel="Create Production Plan"
/>
)
}
