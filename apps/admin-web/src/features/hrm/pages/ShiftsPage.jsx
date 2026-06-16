import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function ShiftsPage() {
return (
<OperationalFormPage
title="Staff Shifts"
subtitle="Create and manage shift definitions"
queryKey="hrm-shifts"
queryFn={operationsApi.hrmShifts}
mutationFn={operationsApi.createHrmShift}
initialForm={{
shift_name: '',
start_time: '',
end_time: '',
grace_minutes: '10',
shift_status: 'ACTIVE',
notes: '',
}}
buildPayload={(form) => ({
...form,
grace_minutes: Number(form.grace_minutes || 10),
})}
fields={[
{ name: 'shift_name', label: 'Shift Name' },
{ name: 'start_time', label: 'Start Time', type: 'time' },
{ name: 'end_time', label: 'End Time', type: 'time' },
{ name: 'grace_minutes', label: 'Grace Minutes', type: 'number' },
{
name: 'shift_status',
label: 'Status',
type: 'select',
options: [
{ value: 'ACTIVE', label: 'Active' },
{ value: 'INACTIVE', label: 'Inactive' },
],
},
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'shift_name', label: 'Shift' },
{ key: 'start_time', label: 'Start' },
{ key: 'end_time', label: 'End' },
{ key: 'grace_minutes', label: 'Grace' },
{ key: 'shift_status', label: 'Status' },
]}
submitLabel="Create Shift"
/>
)
}
