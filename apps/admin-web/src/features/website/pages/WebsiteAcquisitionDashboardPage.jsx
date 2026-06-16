import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { websiteAdminApi } from '../api/websiteAdminApi'
export default function WebsiteAcquisitionDashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['website-acquisition-summary'],
queryFn: websiteAdminApi.summary,
})
return (
<Page title="Website Acquisition" subtitle="AI-enabled customer acquisition performance">
{isLoading ? <LoadingBlock label="Loading acquisition summary..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
<Card title="Total Leads"><strong>{data.total_leads}</strong></Card>
<Card title="New Leads"><strong>{data.new_leads}</strong></Card>
<Card title="Converted Leads"><strong>{data.converted_leads}</strong></Card>
<Card title="Catering Enquiries"><strong>{data.catering_enquiries}</strong></Card>
<Card title="Delivery Enquiries"><strong>{data.delivery_enquiries}</strong></Card>
<Card title="Feedback"><strong>{data.feedback_count}</strong></Card>
</div>
) : null}
</Page>
)
}
