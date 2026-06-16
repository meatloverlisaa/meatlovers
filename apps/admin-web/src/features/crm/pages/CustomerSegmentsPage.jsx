import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function CustomerSegmentsPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['customer-segments'],
queryFn: operationsApi.customerSegments,
})
return (
<Page title="Customer Segments" subtitle="Customer segmentation by value and loyalty">
<Card>
{isLoading ? <LoadingBlock label="Loading customer segments..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'segment', label: 'Segment' },
{ key: 'customer_count', label: 'Customers' },
{ key: 'lifetime_value', label: 'Lifetime Value' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
