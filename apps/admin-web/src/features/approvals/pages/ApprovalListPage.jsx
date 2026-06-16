import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { approvalsApi } from '../api/approvalsApi'
export default function ApprovalListPage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['approval-list'],
queryFn: approvalsApi.list,
})
const approveMutation = useMutation({
mutationFn: (id) => approvalsApi.approve(id, { approval_notes: 'Approved from admin dashboard' }),
onSuccess: () => qc.invalidateQueries({ queryKey: ['approval-list'] }),
})
const rejectMutation = useMutation({
mutationFn: (id) => approvalsApi.reject(id, { approval_notes: 'Rejected from admin dashboard' }),
onSuccess: () => qc.invalidateQueries({ queryKey: ['approval-list'] }),
})
const applyMutation = useMutation({
mutationFn: approvalsApi.apply,
onSuccess: () => qc.invalidateQueries({ queryKey: ['approval-list'] }),
})
const rows = (data || []).map((item) => ({
...item,
actions: (
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
<Button onClick={() => approveMutation.mutate(item.id)}>Approve</Button>
<button onClick={() => rejectMutation.mutate(item.id)} style={rejectButton}>
Reject
</button>
{item.approval_status === 'APPROVED' ? (
<button onClick={() => applyMutation.mutate(item.id)} style={applyButton}>
Apply
</button>
) : null}
</div>
),
}))
return (
<Page title="Approvals" subtitle="Approve, reject, and apply operational control requests">


{approveMutation.error ? <StatusMessage error={approveMutation.error.message} /> : null}
{rejectMutation.error ? <StatusMessage error={rejectMutation.error.message} /> : null}
{applyMutation.error ? <StatusMessage error={applyMutation.error.message} /> : null}
<Card>
{isLoading ? <LoadingBlock label="Loading approvals..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'approval_type', label: 'Type' },
{ key: 'requested_by_name', label: 'Requested By' },
{ key: 'reference_id', label: 'Reference' },
{ key: 'request_reason', label: 'Reason' },
{ key: 'approval_status', label: 'Status' },
{ key: 'created_at', label: 'Created' },
{ key: 'actions', label: 'Actions' },
]}
rows={rows}
/>
) : null}
</Card>
</Page>
)
}
const rejectButton = {
padding: '10px 14px',
borderRadius: 10,
border: '1px solid #be123c',
background: '#fff1f2',
color: '#be123c',
cursor: 'pointer',
}
const applyButton = {
padding: '10px 14px',
borderRadius: 10,
border: '1px solid #166534',
background: '#f0fdf4',
color: '#166534',
cursor: 'pointer',
}
