import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AssetLifecycleDashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['asset-lifecycle-dashboard'],
queryFn: operationsApi.assetLifecycleDashboard,
})
return (
<Page title="Asset Lifecycle Dashboard" subtitle="Asset value, condition, maintenance, and write-off
control">
{isLoading ? <LoadingBlock label="Loading asset lifecycle dashboard..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 16 }}>
<Card title="Total Assets"><strong>{data.summary.total_assets}</strong></Card>
<Card title="Active"><strong>{data.summary.active_assets}</strong></Card>
<Card title="Damaged"><strong>{data.summary.damaged_assets}</strong></Card>
<Card title="Disposed"><strong>{data.summary.disposed_assets}</strong></Card>
<Card title="Asset Value"><strong>{data.summary.total_asset_value}</strong></Card>
<Card title="Pending Maintenance"><strong>{data.pending_maintenance}</strong></Card>
<Card title="Pending Write-Offs"><strong>{data.pending_writeoffs}</strong></Card>
</div>
) : null}
</Page>
)


}
