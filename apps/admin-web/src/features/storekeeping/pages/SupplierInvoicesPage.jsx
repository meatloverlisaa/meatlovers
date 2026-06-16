import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function SupplierInvoicesPage() {
return (
<OperationalFormPage
title="Supplier Invoices"
subtitle="Record and approve supplier invoices"
queryKey="supplier-invoices"
queryFn={operationsApi.supplierInvoices}
mutationFn={operationsApi.createSupplierInvoice}
initialForm={{
supplier_id: '',
invoice_number: '',
invoice_date: '',
invoice_amount: '',
notes: '',
}}
buildPayload={(form) => ({
...form,
supplier_id: Number(form.supplier_id),
invoice_amount: Number(form.invoice_amount),
})}
fields={[
{ name: 'supplier_id', label: 'Supplier ID', type: 'number' },
{ name: 'invoice_number', label: 'Invoice Number' },
{ name: 'invoice_date', label: 'Invoice Date', type: 'date' },
{ name: 'invoice_amount', label: 'Invoice Amount', type: 'number' },
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'supplier_name', label: 'Supplier' },
{ key: 'invoice_number', label: 'Invoice No.' },
{ key: 'invoice_date', label: 'Date' },
{ key: 'invoice_amount', label: 'Amount' },
{ key: 'invoice_status', label: 'Status' },
{ key: 'created_by_name', label: 'Created By' },
]}
submitLabel="Create Invoice"
/>
)
}
