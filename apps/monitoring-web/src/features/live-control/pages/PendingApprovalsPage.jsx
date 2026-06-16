import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { liveControlApi } from '../api/liveControlApi'
export default function PendingApprovalsPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['monitoring-pending-approvals'],
queryFn: liveControlApi.pendingApprovals,
refetchInterval: 15000,
})
return (
<Page title="Pending Approvals" subtitle="Discounts, cancellations, stock adjustments, and refunds awaiting
approval">
<Card>
{isLoading ? <LoadingBlock label="Loading pending approvals..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable


columns={[
{ key: 'approval_type', label: 'Type' },
{ key: 'requested_by_name', label: 'Requested By' },
{ key: 'reference_id', label: 'Reference' },
{ key: 'request_reason', label: 'Reason' },
{ key: 'created_at', label: 'Created' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
