import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { liveControlApi } from '../api/liveControlApi'
export default function LowStockAlertsPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['monitoring-low-stock-alerts'],
queryFn: liveControlApi.lowStockAlerts,
refetchInterval: 15000,
})
return (
<Page title="Low Stock Alerts" subtitle="Store, kitchen, and bar stock below reorder level">
<Card>
{isLoading ? <LoadingBlock label="Loading low stock alerts..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'product_category', label: 'Category' },
{ key: 'current_quantity', label: 'Current Qty' },
{ key: 'reorder_level', label: 'Reorder Level' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
