import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function EnforcementActionsPage() {
return (
<OperationalFormPage
title="Enforcement Actions"
subtitle="Create corrective actions, warnings, investigations, and training requirements"
queryKey="enforcement-actions"
queryFn={operationsApi.enforcementActions}
mutationFn={operationsApi.createEnforcementAction}
initialForm={{
staff_id: '',
action_type: 'MANAGER_REVIEW',
reason: '',
assigned_to: '',


due_date: '',
}}
buildPayload={(form) => ({
staff_id: Number(form.staff_id),
action_type: form.action_type,
reason: form.reason,
assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
due_date: form.due_date,
})}
fields={[
{ name: 'staff_id', label: 'Staff ID', type: 'number' },
{
name: 'action_type',
label: 'Action Type',
type: 'select',
options: [
{ value: 'VERBAL_WARNING', label: 'Verbal Warning' },
{ value: 'WRITTEN_WARNING', label: 'Written Warning' },
{ value: 'DEDUCTION_REVIEW', label: 'Deduction Review' },
{ value: 'SUSPENSION_REVIEW', label: 'Suspension Review' },
{ value: 'MANAGER_REVIEW', label: 'Manager Review' },
{ value: 'INVESTIGATION', label: 'Investigation' },
{ value: 'TRAINING_REQUIRED', label: 'Training Required' },
],
},
{ name: 'reason', label: 'Reason', type: 'textarea' },
{ name: 'assigned_to', label: 'Assigned Staff ID optional', type: 'number' },
{ name: 'due_date', label: 'Due Date', type: 'date' },
]}
columns={[
{ key: 'staff_name', label: 'Staff' },
{ key: 'action_type', label: 'Action' },
{ key: 'action_status', label: 'Status' },
{ key: 'reason', label: 'Reason' },
{ key: 'assigned_to_name', label: 'Assigned To' },
{ key: 'due_date', label: 'Due Date' },
]}
submitLabel="Create Action"
/>
)
}
