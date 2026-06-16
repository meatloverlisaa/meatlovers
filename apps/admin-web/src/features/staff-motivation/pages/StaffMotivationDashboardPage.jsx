import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { staffMotivationApi } from '../api/staffMotivationApi'
export default function StaffMotivationDashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['staff-motivation-dashboard'],
queryFn: staffMotivationApi.dashboard,
})
return (
<Page title="Staff Motivation Dashboard" subtitle="Service team motivation and performance summary">
{isLoading ? <LoadingBlock label="Loading staff motivation dashboard..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
<Card title="Top Waiter"><strong>{data.top_waiter_name || 'None'}</strong></Card>
<Card title="Top Sales"><strong>KES {data.top_waiter_sales}</strong></Card>
<Card title="Avg Rating Today"><strong>{data.average_customer_rating_today}</strong></Card>
<Card title="Targets Today"><strong>{data.targets_today}</strong></Card>
<Card title="Targets Achieved"><strong>{data.targets_achieved_today}</strong></Card>
</div>
) : null}
</Page>
)
}
