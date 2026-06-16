import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function StockMovementReportPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['stock-movement-report'],
queryFn: operationsApi.stockMovementReport,
})
return (
<Page title="Stock Movement Report" subtitle="Full storekeeping stock movement visibility">
<Card>
{isLoading ? <LoadingBlock label="Loading stock movement report..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'product_category', label: 'Category' },
{ key: 'movement_type', label: 'Movement' },
{ key: 'quantity', label: 'Quantity' },
{ key: 'reference_number', label: 'Reference' },
{ key: 'user_name', label: 'User' },
{ key: 'created_at', label: 'Date' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
