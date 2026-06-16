import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { staffMotivationApi } from '../api/staffMotivationApi'
export default function DailyTargetsPage() {
return (
<OperationalFormPage
title="Daily Staff Targets"
subtitle="Assign daily sales, order, and rating targets"
queryKey="daily-staff-targets"
queryFn={staffMotivationApi.dailyTargets}
mutationFn={staffMotivationApi.createDailyTarget}
initialForm={{
staff_id: '',
target_date: '',
sales_target: '',
orders_target: '',
rating_target: '',
}}
buildPayload={(form) => ({
...form,
staff_id: Number(form.staff_id),
sales_target: Number(form.sales_target),
orders_target: Number(form.orders_target),
rating_target: Number(form.rating_target),
})}
fields={[
{ name: 'staff_id', label: 'Staff ID', type: 'number' },
{ name: 'target_date', label: 'Target Date', type: 'date' },
{ name: 'sales_target', label: 'Sales Target', type: 'number' },
{ name: 'orders_target', label: 'Orders Target', type: 'number' },
{ name: 'rating_target', label: 'Rating Target', type: 'number' },
]}


columns={[
{ key: 'full_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'target_date', label: 'Date' },
{ key: 'sales_target', label: 'Sales Target' },
{ key: 'orders_target', label: 'Orders Target' },
{ key: 'rating_target', label: 'Rating Target' },
{ key: 'target_status', label: 'Status' },
]}
submitLabel="Create Target"
/>
)
}
