import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function RiskScoresPage() {
const qc = useQueryClient()
const { data, isLoading, error } = useQuery({
queryKey: ['risk-scores'],
queryFn: operationsApi.riskScores,
})
const mutation = useMutation({
mutationFn: operationsApi.generateRiskScores,
onSuccess: () => qc.invalidateQueries({ queryKey: ['risk-scores'] }),
})
return (
<Page title="Risk Scores" subtitle="Generated risk score per staff member">
{mutation.error ? <StatusMessage error={mutation.error.message} /> : null}
<Card title="Generate Scores">
<Button onClick={() => mutation.mutate()}>Generate Today’s Risk Scores</Button>
</Card>
<Card title="Risk Score History">
{isLoading ? <LoadingBlock label="Loading risk scores..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'staff_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'risk_date', label: 'Date' },
{ key: 'total_risk_score', label: 'Total Score' },
{ key: 'risk_level', label: 'Level' },
{ key: 'cash_variance_score', label: 'Cash' },
{ key: 'stock_variance_score', label: 'Stock' },
{ key: 'attendance_score', label: 'Attendance' },
{ key: 'pricing_violation_score', label: 'Pricing' },
{ key: 'incident_score', label: 'Incident' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
