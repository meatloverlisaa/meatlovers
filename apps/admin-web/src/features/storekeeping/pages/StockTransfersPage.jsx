import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function StockTransfersPage() {
return (
<OperationalFormPage
title="Stock Transfers"
subtitle="Transfer stock from store to kitchen or bar"
queryKey="stock-transfers"
queryFn={operationsApi.stockTransfers}
mutationFn={operationsApi.createStockTransfer}
initialForm={{
product_id: '',
transfer_from: 'STORE',
transfer_to: 'KITCHEN',
quantity: '',
notes: '',
}}
buildPayload={(form) => ({
...form,
product_id: Number(form.product_id),
quantity: Number(form.quantity),
})}
fields={[
{ name: 'product_id', label: 'Product ID', type: 'number' },
{
name: 'transfer_from',
label: 'Transfer From',
type: 'select',
options: [
{ value: 'STORE', label: 'Store' },
{ value: 'KITCHEN', label: 'Kitchen' },
{ value: 'BAR', label: 'Bar' },
],
},
{
name: 'transfer_to',
label: 'Transfer To',
type: 'select',
options: [
{ value: 'STORE', label: 'Store' },
{ value: 'KITCHEN', label: 'Kitchen' },
{ value: 'BAR', label: 'Bar' },
],
},
{ name: 'quantity', label: 'Quantity', type: 'number' },
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'transfer_from', label: 'From' },
{ key: 'transfer_to', label: 'To' },
{ key: 'quantity', label: 'Quantity' },
{ key: 'transfer_status', label: 'Status' },
{ key: 'requested_by_name', label: 'Requested By' },
{ key: 'approved_by_name', label: 'Approved By' },
]}
submitLabel="Request Transfer"
/>
)
}
