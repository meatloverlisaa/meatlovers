import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DataTable from '../../../components/ui/DataTable'


import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
const categories = {
food: { id: 1, label: 'Food' },
soft: { id: 2, label: 'Soft Drinks' },
alcohol: { id: 3, label: 'Alcoholic Drinks' },
}
export default function CategoryDashboardPage() {
const [category, setCategory] = useState('food')
const { data, isLoading, error } = useQuery({
queryKey: ['category-dashboard', category],
queryFn: () => operationsApi.categoryDashboard(categories[category].id),
})
return (
<Page title="Product Category Dashboard" subtitle="Food, soft drinks, and alcoholic drinks dashboard">
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<Button onClick={() => setCategory('food')}>Food</Button>
<Button onClick={() => setCategory('soft')}>Soft Drinks</Button>
<Button onClick={() => setCategory('alcohol')}>Alcoholic Drinks</Button>
</div>
{isLoading ? <LoadingBlock label="Loading category dashboard..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
<Card title="Products"><strong>{data.summary.product_count}</strong></Card>
<Card title="Active"><strong>{data.summary.active_count}</strong></Card>
<Card title="Inactive"><strong>{data.summary.inactive_count}</strong></Card>
<Card title="Avg Margin"><strong>{Number(data.summary.average_margin || 0).toFixed(2)}%</strong></
Card>
</div>
<Card title={`${categories[category].label} Products`}>
<DataTable
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'selling_price', label: 'Selling Price' },
{ key: 'cost_price', label: 'Cost Price' },
{ key: 'margin_percent', label: 'Margin %' },
{ key: 'is_active', label: 'Active' },
]}
rows={data.products || []}
/>
</Card>
</>
) : null}
</Page>
)
}
