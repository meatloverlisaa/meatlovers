import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function FoodCostReportPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['food-cost-report'],
queryFn: operationsApi.foodCostReport,
})
return (
<Page title="Food Cost Report" subtitle="Food cost per plate and gross margin per menu item">
<Card>


{isLoading ? <LoadingBlock label="Loading food cost report..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'recipe_name', label: 'Recipe' },
{ key: 'menu_item', label: 'Menu Item' },
{ key: 'selling_price', label: 'Selling Price' },
{ key: 'food_cost_per_plate', label: 'Food Cost' },
{ key: 'gross_margin_per_plate', label: 'Margin' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
