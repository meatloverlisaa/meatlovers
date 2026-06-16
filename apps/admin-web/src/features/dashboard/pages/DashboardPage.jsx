import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { websiteAdminApi } from '../../website/api/websiteAdminApi'
export default function DashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['dashboard-website-acquisition-summary'],
queryFn: websiteAdminApi.summary,
})
return (
<Page title="Dashboard" subtitle="Meat Lovers CIMS powered by YohPal">
{isLoading ? <LoadingBlock label="Loading acquisition cards..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
<Card title="Website Leads">
<strong>{data.total_leads}</strong>
<p><Link to="/website-leads">View leads</Link></p>
</Card>
<Card title="New Leads">


<strong>{data.new_leads}</strong>
<p><Link to="/website-acquisition">View acquisition</Link></p>
</Card>
<Card title="Converted Leads">
<strong>{data.converted_leads}</strong>
<p><Link to="/website-leads">Follow up</Link></p>
</Card>
<Card title="Catering">
<strong>{data.catering_enquiries}</strong>
<p><Link to="/catering-enquiries">View catering</Link></p>
</Card>
<Card title="Delivery">
<strong>{data.delivery_enquiries}</strong>
<p><Link to="/delivery-enquiries">View delivery</Link></p>
</Card>
<Card title="Feedback">
<strong>{data.feedback_count}</strong>
<p><Link to="/website-feedback">View feedback</Link></p>
</Card>
</div>
) : null}
</Page>
)
}
