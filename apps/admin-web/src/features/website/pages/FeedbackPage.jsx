import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { websiteAdminApi } from '../api/websiteAdminApi'
export default function FeedbackPage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['customer-feedback'],
queryFn: websiteAdminApi.feedback,
})
const mutation = useMutation({
mutationFn: ({ id, status }) => websiteAdminApi.updateFeedbackStatus(id, status),
onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-feedback'] }),
})
const rows = (data || []).map((item) => ({
id: item.id,
full_name: item.full_name,
phone: item.phone,
rating: item.rating,
message: item.message,
feedback_status: (
<select
value={item.feedback_status}
onChange={(e) => mutation.mutate({ id: item.id, status: e.target.value })}
>
<option value="NEW">NEW</option>
<option value="REVIEWED">REVIEWED</option>
<option value="ACTION_TAKEN">ACTION_TAKEN</option>
<option value="CLOSED">CLOSED</option>
</select>
),
}))
return (
<Page title="Customer Feedback" subtitle="Website feedback and service improvement queue">
<Card>
{isLoading ? <LoadingBlock label="Loading feedback..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[


{ key: 'full_name', label: 'Name' },
{ key: 'phone', label: 'Phone' },
{ key: 'rating', label: 'Rating' },
{ key: 'message', label: 'Message' },
{ key: 'feedback_status', label: 'Status' },
]}
rows={rows}
/>
) : null}
</Card>
</Page>
)
}
