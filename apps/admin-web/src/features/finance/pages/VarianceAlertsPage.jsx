import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function VarianceAlertsPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['variance-alerts'],
queryFn: operationsApi.varianceAlerts,
})
return (
<Page title="Variance Alerts" subtitle="Cash, M-Pesa, stock, and sales variance alerts">
<Card>
{isLoading ? <LoadingBlock label="Loading variance alerts..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'variance_type', label: 'Type' },
{ key: 'reference_id', label: 'Reference' },
{ key: 'variance_amount', label: 'Amount' },
{ key: 'alert_status', label: 'Status' },
{ key: 'notes', label: 'Notes' },
{ key: 'created_at', label: 'Created' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
