import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function MarginAlertsPage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['margin-alerts'],
queryFn: operationsApi.marginAlerts,
})
const mutation = useMutation({
mutationFn: operationsApi.generateMarginAlerts,
onSuccess: () => qc.invalidateQueries({ queryKey: ['margin-alerts'] }),
})
return (


<Page title="Margin Alerts" subtitle="Products below category minimum margin">
{mutation.error ? <StatusMessage error={mutation.error.message} /> : null}
<Card title="Generate Alerts">
<Button onClick={() => mutation.mutate()}>Generate Margin Alerts</Button>
</Card>
<Card title="Alerts">
{isLoading ? <LoadingBlock label="Loading margin alerts..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'product_category', label: 'Category' },
{ key: 'selling_price', label: 'Selling Price' },
{ key: 'cost_price', label: 'Cost Price' },
{ key: 'margin_percent', label: 'Margin %' },
{ key: 'alert_status', label: 'Status' },
{ key: 'notes', label: 'Notes' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
