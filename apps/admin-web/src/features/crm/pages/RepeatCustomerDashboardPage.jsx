import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function RepeatCustomerDashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['repeat-customer-dashboard'],
queryFn: operationsApi.repeatCustomerDashboard,
})
return (
<Page title="Repeat Customer Dashboard" subtitle="Customer retention, loyalty, and lifetime value">
{isLoading ? <LoadingBlock label="Loading repeat customer dashboard..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
<Card title="Total Customers"><strong>{data.summary.total_customers}</strong></Card>
<Card title="Repeat Customers"><strong>{data.summary.repeat_customers}</strong></Card>
<Card title="VIP Customers"><strong>{data.summary.vip_customers}</strong></Card>
<Card title="Loyalty Points"><strong>{data.summary.total_loyalty_points}</strong></Card>
<Card title="Lifetime Value"><strong>{data.summary.total_lifetime_value}</strong></Card>
</div>
<Card title="Top Customers">
<DataTable
columns={[
{ key: 'full_name', label: 'Customer' },
{ key: 'phone', label: 'Phone' },
{ key: 'segment', label: 'Segment' },
{ key: 'total_visits', label: 'Visits' },
{ key: 'loyalty_points', label: 'Points' },
{ key: 'lifetime_value', label: 'Lifetime Value' },
{ key: 'last_visit_date', label: 'Last Visit' },
]}
rows={data.top_customers || []}
/>
</Card>
</>
) : null}
</Page>
)
}
