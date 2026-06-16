import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AssetAssignmentsPage() {
return (
<OperationalFormPage
title="Asset Assignments"
subtitle="Assign assets to staff or departments"
queryKey="asset-assignments"
queryFn={operationsApi.assetAssignments}
mutationFn={operationsApi.createAssetAssignment}
initialForm={{
asset_id: '',
assigned_to: '',
department: 'KITCHEN',
assigned_date: '',
notes: '',
}}
buildPayload={(form) => ({
asset_id: Number(form.asset_id),
assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
department: form.department,
assigned_date: form.assigned_date,
notes: form.notes,
})}
fields={[
{ name: 'asset_id', label: 'Asset ID', type: 'number' },
{ name: 'assigned_to', label: 'Assigned Staff ID optional', type: 'number' },
{
name: 'department',
label: 'Department',
type: 'select',
options: [
{ value: 'STORE', label: 'Store' },
{ value: 'KITCHEN', label: 'Kitchen' },
{ value: 'SERVICE', label: 'Service' },
{ value: 'DISPATCH', label: 'Dispatch' },
{ value: 'BAR', label: 'Bar' },
{ value: 'HRM', label: 'HRM' },
{ value: 'FINANCE', label: 'Finance' },
{ value: 'ADMIN', label: 'Admin' },
],
},
{ name: 'assigned_date', label: 'Assigned Date', type: 'date' },
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'asset_name', label: 'Asset' },
{ key: 'assigned_to_name', label: 'Assigned To' },
{ key: 'department', label: 'Department' },
{ key: 'assigned_date', label: 'Assigned Date' },
{ key: 'assignment_status', label: 'Status' },
]}
submitLabel="Assign Asset"
/>
)
}
