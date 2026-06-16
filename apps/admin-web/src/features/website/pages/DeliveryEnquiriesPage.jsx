import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { websiteAdminApi } from '../api/websiteAdminApi'
export default function DeliveryEnquiriesPage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['delivery-enquiries'],
queryFn: websiteAdminApi.delivery,
})
const mutation = useMutation({
mutationFn: ({ id, status }) => websiteAdminApi.updateDeliveryStatus(id, status),
onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery-enquiries'] }),
})
const rows = (data || []).map((item) => ({
id: item.id,
full_name: item.full_name,
phone: item.phone,
delivery_address: item.delivery_address,
order_request: item.order_request,
enquiry_status: (
<select
value={item.enquiry_status}
onChange={(e) => mutation.mutate({ id: item.id, status: e.target.value })}
>


<option value="NEW">NEW</option>
<option value="CONTACTED">CONTACTED</option>
<option value="CONFIRMED">CONFIRMED</option>
<option value="DISPATCHED">DISPATCHED</option>
<option value="CLOSED">CLOSED</option>
</select>
),
}))
return (
<Page title="Delivery Enquiries" subtitle="Website delivery demand and follow-up queue">
<Card>
{isLoading ? <LoadingBlock label="Loading delivery enquiries..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'full_name', label: 'Name' },
{ key: 'phone', label: 'Phone' },
{ key: 'delivery_address', label: 'Address' },
{ key: 'order_request', label: 'Request' },
{ key: 'enquiry_status', label: 'Status' },
]}
rows={rows}
/>
) : null}
</Card>
</Page>
)
}
