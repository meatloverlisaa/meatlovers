import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function ProfitabilitySplitPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['profitability-split'],
queryFn: operationsApi.profitabilitySplit,
})
return (
<Page title="Profitability Split" subtitle="Food, soft drinks, and alcoholic drinks gross profit">
<Card>
{isLoading ? <LoadingBlock label="Loading profitability split..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'product_category', label: 'Category' },
{ key: 'sales', label: 'Sales' },
{ key: 'cost', label: 'Cost' },
{ key: 'gross_profit', label: 'Gross Profit' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
