import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function LoyaltyTransactionsPage() {
return (
<OperationalFormPage
title="Loyalty Transactions"
subtitle="Earn, redeem, or adjust customer loyalty points"
queryKey="loyalty-transactions"
queryFn={operationsApi.loyaltyTransactions}
mutationFn={operationsApi.recordLoyaltyTransaction}
initialForm={{
customer_id: '',
transaction_type: 'EARNED',
points: '',
reference_type: 'MANUAL',
reference_id: '',
notes: '',
}}
buildPayload={(form) => ({
customer_id: Number(form.customer_id),
transaction_type: form.transaction_type,
points: Number(form.points),
reference_type: form.reference_type,
reference_id: form.reference_id ? Number(form.reference_id) : null,
notes: form.notes,
})}
fields={[
{ name: 'customer_id', label: 'Customer ID', type: 'number' },
{
name: 'transaction_type',
label: 'Transaction Type',
type: 'select',
options: [


{ value: 'EARNED', label: 'Earned' },
{ value: 'REDEEMED', label: 'Redeemed' },
{ value: 'ADJUSTED', label: 'Adjusted' },
],
},
{ name: 'points', label: 'Points', type: 'number' },
{
name: 'reference_type',
label: 'Reference Type',
type: 'select',
options: [
{ value: 'ORDER', label: 'Order' },
{ value: 'MANUAL', label: 'Manual' },
{ value: 'PROMOTION', label: 'Promotion' },
],
},
{ name: 'reference_id', label: 'Reference ID optional', type: 'number' },
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'full_name', label: 'Customer' },
{ key: 'phone', label: 'Phone' },
{ key: 'transaction_type', label: 'Type' },
{ key: 'points', label: 'Points' },
{ key: 'reference_type', label: 'Reference Type' },
{ key: 'created_at', label: 'Date' },
]}
submitLabel="Record Loyalty"
/>
)
}
