import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function DutyRosterPage() {
return (
<OperationalFormPage


title="Duty Roster"
subtitle="Schedule staff by shift, date, and department"
queryKey="duty-rosters"
queryFn={operationsApi.dutyRosters}
mutationFn={operationsApi.createDutyRoster}
initialForm={{
staff_id: '',
shift_id: '',
duty_date: '',
duty_department: 'SERVICE',
notes: '',
}}
buildPayload={(form) => ({
staff_id: Number(form.staff_id),
shift_id: Number(form.shift_id),
duty_date: form.duty_date,
duty_department: form.duty_department,
notes: form.notes,
})}
fields={[
{ name: 'staff_id', label: 'Staff ID', type: 'number' },
{ name: 'shift_id', label: 'Shift ID', type: 'number' },
{ name: 'duty_date', label: 'Duty Date', type: 'date' },
{
name: 'duty_department',
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
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'staff_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'shift_name', label: 'Shift' },
{ key: 'duty_date', label: 'Date' },
{ key: 'duty_department', label: 'Department' },
{ key: 'roster_status', label: 'Status' },
]}
submitLabel="Create Duty Roster"
/>
)
}
