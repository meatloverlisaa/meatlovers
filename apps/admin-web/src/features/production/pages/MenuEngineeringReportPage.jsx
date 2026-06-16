import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function MenuEngineeringReportPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['menu-engineering-report'],
queryFn: operationsApi.menuEngineeringReport,
})
return (
<Page title="Menu Engineering Report" subtitle="Sales, cost, and gross profit per food menu item">
<Card>
{isLoading ? <LoadingBlock label="Loading menu engineering report..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'product_name', label: 'Menu Item' },
{ key: 'quantity_sold', label: 'Qty Sold' },
{ key: 'sales_value', label: 'Sales' },
{ key: 'estimated_cost', label: 'Cost' },
{ key: 'gross_profit', label: 'Gross Profit' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
