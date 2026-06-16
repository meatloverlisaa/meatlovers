import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function PriceChangeAuditPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['price-change-audit'],
queryFn: operationsApi.priceChangeAudit,
})
return (
<Page title="Price Change Audit" subtitle="Full audit trail of product price changes">
<Card>
{isLoading ? <LoadingBlock label="Loading price audit..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'old_selling_price', label: 'Old Selling' },
{ key: 'new_selling_price', label: 'New Selling' },
{ key: 'old_cost_price', label: 'Old Cost' },
{ key: 'new_cost_price', label: 'New Cost' },
{ key: 'changed_by_name', label: 'Changed By' },
{ key: 'change_reason', label: 'Reason' },
{ key: 'created_at', label: 'Date' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
