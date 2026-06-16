import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function DeliveryPerformanceReportPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['delivery-performance-report'],
queryFn: operationsApi.deliveryPerformanceReport,
})
return (
<Page title="Delivery Performance" subtitle="Rider delivery success, failure, and fee report">
<Card>
{isLoading ? <LoadingBlock label="Loading delivery performance..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'rider_name', label: 'Rider' },
{ key: 'rider_phone', label: 'Phone' },
{ key: 'total_deliveries', label: 'Total' },
{ key: 'delivered_count', label: 'Delivered' },
{ key: 'failed_count', label: 'Failed' },
{ key: 'delivery_fee_total', label: 'Delivery Fees' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
