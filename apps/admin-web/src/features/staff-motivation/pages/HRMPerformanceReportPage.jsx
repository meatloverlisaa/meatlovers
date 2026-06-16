import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { staffMotivationApi } from '../api/staffMotivationApi'
export default function HRMPerformanceReportPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['hrm-performance-report'],
queryFn: staffMotivationApi.hrmReport,
})
return (
<Page title="HRM Performance Report" subtitle="Staff productivity and motivation report">
<Card>
{isLoading ? <LoadingBlock label="Loading HRM report..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'full_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'sales_amount', label: 'Sales' },
{ key: 'orders_served', label: 'Orders' },
{ key: 'average_rating', label: 'Rating' },
{ key: 'recorded_bonus', label: 'Recorded Bonus' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
