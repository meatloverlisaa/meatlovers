import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { websiteAdminApi } from '../api/websiteAdminApi'
export default function CateringEnquiriesPage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['catering-enquiries'],
queryFn: websiteAdminApi.catering,
})


const mutation = useMutation({
mutationFn: ({ id, status }) => websiteAdminApi.updateCateringStatus(id, status),
onSuccess: () => qc.invalidateQueries({ queryKey: ['catering-enquiries'] }),
})
const rows = (data || []).map((item) => ({
id: item.id,
full_name: item.full_name,
phone: item.phone,
event_date: item.event_date,
guest_count: item.guest_count,
enquiry_status: (
<select
value={item.enquiry_status}
onChange={(e) => mutation.mutate({ id: item.id, status: e.target.value })}
>
<option value="NEW">NEW</option>
<option value="CONTACTED">CONTACTED</option>
<option value="QUOTED">QUOTED</option>
<option value="CONFIRMED">CONFIRMED</option>
<option value="CLOSED">CLOSED</option>
</select>
),
}))
return (
<Page title="Catering Enquiries" subtitle="Website catering and events leads">
<Card>
{isLoading ? <LoadingBlock label="Loading catering enquiries..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'full_name', label: 'Name' },
{ key: 'phone', label: 'Phone' },
{ key: 'event_date', label: 'Event Date' },
{ key: 'guest_count', label: 'Guests' },
{ key: 'enquiry_status', label: 'Status' },
]}
rows={rows}
/>
) : null}
</Card>
</Page>
)
}
