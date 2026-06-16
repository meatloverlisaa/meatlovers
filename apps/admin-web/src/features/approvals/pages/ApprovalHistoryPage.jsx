import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { approvalsApi } from '../api/approvalsApi'
export default function ApprovalHistoryPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['approval-history'],
queryFn: approvalsApi.history,
})
return (
<Page title="Approval History" subtitle="Full history of approval requests and management decisions">
<Card>
{isLoading ? <LoadingBlock label="Loading approval history..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'approval_type', label: 'Type' },
{ key: 'requested_by_name', label: 'Requested By' },
{ key: 'approved_by_name', label: 'Approved/Rejected By' },
{ key: 'reference_id', label: 'Reference' },
{ key: 'approval_status', label: 'Status' },
{ key: 'approval_notes', label: 'Notes' },
{ key: 'approved_at', label: 'Decision Date' },
{ key: 'created_at', label: 'Requested Date' },
]}
rows={data || []}
/>


) : null}
</Card>
</Page>
)
}
