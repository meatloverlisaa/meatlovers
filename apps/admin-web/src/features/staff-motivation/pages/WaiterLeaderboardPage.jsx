import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { staffMotivationApi } from '../api/staffMotivationApi'
export default function WaiterLeaderboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['waiter-leaderboard'],
queryFn: staffMotivationApi.leaderboard,
})
return (
<Page title="Waiter Sales Leaderboard" subtitle="Rank waiters by sales, orders, and customer rating">
<Card>
{isLoading ? <LoadingBlock label="Loading leaderboard..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'full_name', label: 'Waiter' },
{ key: 'total_sales', label: 'Sales' },
{ key: 'orders_served', label: 'Orders' },
{ key: 'average_rating', label: 'Rating' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)


}
