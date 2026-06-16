import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function EnforcementAuditFeedPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['enforcement-audit-feed'],
queryFn: operationsApi.enforcementAuditFeed,
refetchInterval: 15000,
})
return (
<Page title="Enforcement Audit Feed" subtitle="Sensitive system activity feed">
<Card>
{isLoading ? <LoadingBlock label="Loading enforcement audit feed..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'user_name', label: 'User' },
{ key: 'module_name', label: 'Module' },
{ key: 'action_name', label: 'Action' },
{ key: 'entity_id', label: 'Entity' },
{ key: 'ip_address', label: 'IP' },
{ key: 'created_at', label: 'Date' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)


}
