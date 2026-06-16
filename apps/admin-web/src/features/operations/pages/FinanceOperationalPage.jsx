import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function FinanceOperationalPage() {
return (
<OperationalPage
title="Finance"
subtitle="Income and expense transactions"
queryKey="ops-finance"
queryFn={operationsApi.financeTransactions}
columns={[
{ key: 'transaction_type', label: 'Type' },
{ key: 'category', label: 'Category' },
{ key: 'amount', label: 'Amount' },
{ key: 'reference_number', label: 'Reference' },
{ key: 'created_by_name', label: 'Created By' },
{ key: 'created_at', label: 'Date' },
]}
/>
)
}
