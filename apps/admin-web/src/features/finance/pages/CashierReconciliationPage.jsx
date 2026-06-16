import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function CashierReconciliationPage() {
return (
<OperationalFormPage
title="Cashier Reconciliation"
subtitle="Compare expected cash/M-Pesa against declared amounts"
queryKey="cashier-reconciliations"
queryFn={operationsApi.reconciliations}
mutationFn={operationsApi.createReconciliation}
initialForm={{
cashier_id: '',
reconciliation_date: '',
expected_cash: '',
declared_cash: '',
expected_mpesa: '',
confirmed_mpesa: '',
notes: '',
}}
buildPayload={(form) => ({
...form,
cashier_id: Number(form.cashier_id),
expected_cash: Number(form.expected_cash),
declared_cash: Number(form.declared_cash),
expected_mpesa: Number(form.expected_mpesa),
confirmed_mpesa: Number(form.confirmed_mpesa),
})}
fields={[


{ name: 'cashier_id', label: 'Cashier ID', type: 'number' },
{ name: 'reconciliation_date', label: 'Reconciliation Date', type: 'date' },
{ name: 'expected_cash', label: 'Expected Cash', type: 'number' },
{ name: 'declared_cash', label: 'Declared Cash', type: 'number' },
{ name: 'expected_mpesa', label: 'Expected M-Pesa', type: 'number' },
{ name: 'confirmed_mpesa', label: 'Confirmed M-Pesa', type: 'number' },
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'cashier_name', label: 'Cashier' },
{ key: 'reconciliation_date', label: 'Date' },
{ key: 'expected_cash', label: 'Expected Cash' },
{ key: 'declared_cash', label: 'Declared Cash' },
{ key: 'variance_amount', label: 'Cash Variance' },
{ key: 'expected_mpesa', label: 'Expected M-Pesa' },
{ key: 'confirmed_mpesa', label: 'Confirmed M-Pesa' },
{ key: 'mpesa_variance', label: 'M-Pesa Variance' },
{ key: 'reconciliation_status', label: 'Status' },
]}
submitLabel="Record Reconciliation"
/>
)
}
