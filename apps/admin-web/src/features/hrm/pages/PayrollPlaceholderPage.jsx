import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function PayrollPlaceholderPage() {
return (
<OperationalFormPage
title="Payroll Placeholder"
subtitle="Draft payroll with lateness and absence deductions"
queryKey="payroll-placeholders"
queryFn={operationsApi.payrollPlaceholders}
mutationFn={operationsApi.createPayrollPlaceholder}
initialForm={{
staff_id: '',
payroll_month: '',
base_pay: '',
bonus_pay: '',
lateness_deduction: '',
absence_deduction: '',
payroll_status: 'DRAFT',
notes: '',
}}
buildPayload={(form) => ({
staff_id: Number(form.staff_id),
payroll_month: form.payroll_month,
base_pay: Number(form.base_pay || 0),
bonus_pay: Number(form.bonus_pay || 0),
lateness_deduction: Number(form.lateness_deduction || 0),
absence_deduction: Number(form.absence_deduction || 0),
payroll_status: form.payroll_status,
notes: form.notes,


})}
fields={[
{ name: 'staff_id', label: 'Staff ID', type: 'number' },
{ name: 'payroll_month', label: 'Payroll Month YYYY-MM' },
{ name: 'base_pay', label: 'Base Pay', type: 'number' },
{ name: 'bonus_pay', label: 'Bonus Pay', type: 'number' },
{ name: 'lateness_deduction', label: 'Lateness Deduction', type: 'number' },
{ name: 'absence_deduction', label: 'Absence Deduction', type: 'number' },
{
name: 'payroll_status',
label: 'Payroll Status',
type: 'select',
options: [
{ value: 'DRAFT', label: 'Draft' },
{ value: 'REVIEWED', label: 'Reviewed' },
{ value: 'APPROVED', label: 'Approved' },
{ value: 'PAID', label: 'Paid' },
],
},
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'staff_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'payroll_month', label: 'Month' },
{ key: 'base_pay', label: 'Base' },
{ key: 'bonus_pay', label: 'Bonus' },
{ key: 'lateness_deduction', label: 'Late Deduction' },
{ key: 'absence_deduction', label: 'Absence Deduction' },
{ key: 'net_pay', label: 'Net Pay' },
{ key: 'payroll_status', label: 'Status' },
]}
submitLabel="Create Payroll Draft"
/>
)
}
