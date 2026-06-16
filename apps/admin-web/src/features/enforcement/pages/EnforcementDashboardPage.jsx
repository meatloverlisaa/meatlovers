import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function EnforcementDashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['enforcement-dashboard'],
queryFn: operationsApi.enforcementDashboard,
refetchInterval: 15000,
})
return (
<Page title="Enforcement Risk Dashboard" subtitle="Unified control across audit, approvals, stock, cash,
HRM, pricing, and incidents">
{isLoading ? <LoadingBlock label="Loading enforcement dashboard..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 16 }}>
<Card title="Scored Staff"><strong>{data.summary.scored_staff}</strong></Card>
<Card title="Low Risk"><strong>{data.summary.low_risk}</strong></Card>
<Card title="Medium Risk"><strong>{data.summary.medium_risk}</strong></Card>
<Card title="High Risk"><strong>{data.summary.high_risk}</strong></Card>
<Card title="Critical Risk"><strong>{data.summary.critical_risk}</strong></Card>
<Card title="Open Incidents"><strong>{data.open_incidents}</strong></Card>
<Card title="Pending Actions"><strong>{data.pending_actions}</strong></Card>
</div>
<Card title="Top Risk Staff">
<DataTable
columns={[
{ key: 'full_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'total_risk_score', label: 'Risk Score' },
{ key: 'risk_level', label: 'Risk Level' },
{ key: 'audit_score', label: 'Audit' },
{ key: 'approval_score', label: 'Approvals' },
{ key: 'attendance_score', label: 'Attendance' },
{ key: 'incident_score', label: 'Incidents' },


]}
rows={data.top_risk_staff || []}
/>
</Card>
</>
) : null}
</Page>
)
}
