import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { liveControlApi } from '../api/liveControlApi'
export default function OwnerDashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['owner-live-control-summary'],
queryFn: liveControlApi.summary,
refetchInterval: 15000,
})
return (
<Page title="Owner Live Control" subtitle="Real-time business control dashboard">
{isLoading ? <LoadingBlock label="Loading owner dashboard..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
<Card title="Today Sales"><strong>KES {data.today_sales}</strong></Card>
<Card title="Today Orders"><strong>{data.today_orders}</strong></Card>
<Card title="Paid Orders"><strong>{data.paid_orders}</strong></Card>


<Card title="Low Stock"><strong>{data.low_stock_count}</strong></Card>
<Card title="Pending Approvals"><strong>{data.pending_approvals_count}</strong></Card>
<Card title="Pending M-Pesa"><strong>{data.pending_mpesa_count}</strong></Card>
<Card title="Unsold Food"><strong>{data.unsold_food_count}</strong></Card>
<Card title="Kitchen Queue"><strong>{data.kitchen_queue_count}</strong></Card>
<Card title="Bar Low Stock"><strong>{data.bar_low_stock_count}</strong></Card>
<Card title="Cash Settlements"><strong>{data.cashier_settlement_count}</strong></Card>
</div>
) : null}
</Page>
)
}
