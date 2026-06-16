import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AbsenceReportsPage() {
return (


<OperationalFormPage
title="Absence Reports"
subtitle="Track staff absences and reasons"
queryKey="absence-reports"
queryFn={operationsApi.absences}
mutationFn={operationsApi.createAbsence}
initialForm={{
staff_id: '',
duty_roster_id: '',
absence_date: '',
absence_reason: '',
absence_status: 'REPORTED',
}}
buildPayload={(form) => ({
staff_id: Number(form.staff_id),
duty_roster_id: form.duty_roster_id ? Number(form.duty_roster_id) : null,
absence_date: form.absence_date,
absence_reason: form.absence_reason,
absence_status: form.absence_status,
})}
fields={[
{ name: 'staff_id', label: 'Staff ID', type: 'number' },
{ name: 'duty_roster_id', label: 'Duty Roster ID optional', type: 'number' },
{ name: 'absence_date', label: 'Absence Date', type: 'date' },
{ name: 'absence_reason', label: 'Reason', type: 'textarea' },
{
name: 'absence_status',
label: 'Status',
type: 'select',
options: [
{ value: 'REPORTED', label: 'Reported' },
{ value: 'APPROVED', label: 'Approved' },
{ value: 'REJECTED', label: 'Rejected' },
{ value: 'UNEXPLAINED', label: 'Unexplained' },
],
},
]}
columns={[
{ key: 'staff_name', label: 'Staff' },
{ key: 'absence_date', label: 'Date' },
{ key: 'absence_status', label: 'Status' },
{ key: 'absence_reason', label: 'Reason' },
{ key: 'reported_by_name', label: 'Reported By' },
]}
submitLabel="Record Absence"
/>
)
}
