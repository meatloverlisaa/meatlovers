import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { liveControlApi } from '../api/liveControlApi'
export default function PendingMpesaPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['monitoring-pending-mpesa'],
queryFn: liveControlApi.pendingMpesa,
refetchInterval: 15000,
})
return (
<Page title="Pending M-Pesa" subtitle="M-Pesa payments awaiting real confirmation">
<Card>
{isLoading ? <LoadingBlock label="Loading pending M-Pesa..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'order_number', label: 'Order' },
{ key: 'table_number', label: 'Table' },
{ key: 'amount', label: 'Amount' },
{ key: 'transaction_reference', label: 'Reference' },
{ key: 'payment_status', label: 'Status' },
{ key: 'created_at', label: 'Created' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
