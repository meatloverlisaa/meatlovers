import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { liveControlApi } from '../api/liveControlApi'
export default function UnsoldFoodAlertsPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['monitoring-unsold-food-alerts'],
queryFn: liveControlApi.unsoldFoodAlerts,
refetchInterval: 15000,
})
return (
<Page title="Unsold Food Alerts" subtitle="Cooked food declared as unsold today">
<Card>
{isLoading ? <LoadingBlock label="Loading unsold food alerts..." /> : null}


{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'quantity', label: 'Quantity' },
{ key: 'reason', label: 'Reason' },
{ key: 'declared_by_name', label: 'Declared By' },
{ key: 'created_at', label: 'Created' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
