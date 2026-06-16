import React from 'react'


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { websiteAdminApi } from '../api/websiteAdminApi'
export default function WebsiteLeadsPage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['website-leads'],
queryFn: websiteAdminApi.leads,
})
const mutation = useMutation({
mutationFn: ({ id, status }) => websiteAdminApi.updateLeadStatus(id, status),
onSuccess: () => qc.invalidateQueries({ queryKey: ['website-leads'] }),
})
const rows = (data || []).map((lead) => ({
id: lead.id,
full_name: lead.full_name,
phone: lead.phone,
interest_type: lead.interest_type,
lead_status: (
<select
value={lead.lead_status}
onChange={(e) => mutation.mutate({ id: lead.id, status: e.target.value })}
>
<option value="NEW">NEW</option>
<option value="CONTACTED">CONTACTED</option>
<option value="CONVERTED">CONVERTED</option>
<option value="CLOSED">CLOSED</option>
</select>
),
created_at: lead.created_at,
}))
return (
<Page title="Website Leads" subtitle="All customer leads captured from the website">
{mutation.error ? <StatusMessage error={mutation.error.message} /> : null}
<Card>
{isLoading ? <LoadingBlock label="Loading leads..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'full_name', label: 'Name' },
{ key: 'phone', label: 'Phone' },
{ key: 'interest_type', label: 'Interest' },
{ key: 'lead_status', label: 'Status' },
{ key: 'created_at', label: 'Created' },
]}
rows={rows}
/>
) : null}
</Card>
</Page>
)
}
