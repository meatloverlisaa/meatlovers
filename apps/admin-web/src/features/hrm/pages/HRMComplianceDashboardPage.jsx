import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function HRMComplianceDashboardPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['hrm-compliance-dashboard'],
queryFn: operationsApi.hrmComplianceDashboard,
})
return (
<Page title="HRM Compliance Dashboard" subtitle="Attendance, lateness, absences, roster, and payroll
visibility">
{isLoading ? <LoadingBlock label="Loading HRM compliance..." /> : null}


{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
<Card title="Scheduled Today"><strong>{data.scheduled_today}</strong></Card>
<Card title="Clocked In Today"><strong>{data.clocked_in_today}</strong></Card>
<Card title="Late Today"><strong>{data.late_today}</strong></Card>
<Card title="Absences Today"><strong>{data.absences_today}</strong></Card>
<Card title="Payroll Drafts"><strong>{data.payroll_drafts}</strong></Card>
</div>
) : null}
</Page>
)
}
