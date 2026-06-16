import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function StaffIncidentsPage() {
return (
<OperationalFormPage
title="Staff Incidents"
subtitle="Record misconduct, variance, attendance, pricing, and customer complaint incidents"
queryKey="staff-incidents"
queryFn={operationsApi.staffIncidents}
mutationFn={operationsApi.createStaffIncident}
initialForm={{
staff_id: '',
incident_date: '',
incident_type: 'GENERAL_MISCONDUCT',
severity: 'LOW',
description: '',
}}
buildPayload={(form) => ({
staff_id: Number(form.staff_id),
incident_date: form.incident_date,
incident_type: form.incident_type,
severity: form.severity,
description: form.description,
})}
fields={[
{ name: 'staff_id', label: 'Staff ID', type: 'number' },
{ name: 'incident_date', label: 'Incident Date', type: 'date' },
{
name: 'incident_type',
label: 'Incident Type',
type: 'select',
options: [
{ value: 'CASH_VARIANCE', label: 'Cash Variance' },
{ value: 'STOCK_VARIANCE', label: 'Stock Variance' },
{ value: 'ATTENDANCE_VIOLATION', label: 'Attendance Violation' },
{ value: 'PRICING_VIOLATION', label: 'Pricing Violation' },
{ value: 'UNAUTHORIZED_DISCOUNT', label: 'Unauthorized Discount' },
{ value: 'ORDER_CANCELLATION', label: 'Order Cancellation' },
{ value: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint' },
{ value: 'ASSET_DAMAGE', label: 'Asset Damage' },
{ value: 'GENERAL_MISCONDUCT', label: 'General Misconduct' },
],
},
{
name: 'severity',
label: 'Severity',
type: 'select',
options: [
{ value: 'LOW', label: 'Low' },
{ value: 'MEDIUM', label: 'Medium' },
{ value: 'HIGH', label: 'High' },
{ value: 'CRITICAL', label: 'Critical' },
],
},
{ name: 'description', label: 'Description', type: 'textarea' },
]}
columns={[
{ key: 'staff_name', label: 'Staff' },
{ key: 'incident_date', label: 'Date' },
{ key: 'incident_type', label: 'Type' },
{ key: 'severity', label: 'Severity' },
{ key: 'incident_status', label: 'Status' },
{ key: 'reported_by_name', label: 'Reported By' },
]}
submitLabel="Record Incident"
/>
)
}
