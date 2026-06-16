import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function IncomeStatementSnapshotsPage() {
const qc = useQueryClient()


const { data, isLoading, error } = useQuery({
queryKey: ['income-statement-snapshots'],
queryFn: operationsApi.incomeStatementSnapshots,
})
const mutation = useMutation({
mutationFn: (period) => {
if (period === 'daily') return operationsApi.snapshotDaily()
if (period === 'weekly') return operationsApi.snapshotWeekly()
if (period === 'monthly') return operationsApi.snapshotMonthly()
return operationsApi.snapshotAnnual()
},
onSuccess: () => qc.invalidateQueries({ queryKey: ['income-statement-snapshots'] }),
})
return (
<Page title="Income Statement Snapshots" subtitle="Saved daily, weekly, monthly, and annual P&L
statements">
{mutation.error ? <StatusMessage error={mutation.error.message} /> : null}
<Card title="Create Snapshot">
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<Button onClick={() => mutation.mutate('daily')}>Daily Snapshot</Button>
<Button onClick={() => mutation.mutate('weekly')}>Weekly Snapshot</Button>
<Button onClick={() => mutation.mutate('monthly')}>Monthly Snapshot</Button>
<Button onClick={() => mutation.mutate('annual')}>Annual Snapshot</Button>
</div>
</Card>
<Card title="Saved Statements">
{isLoading ? <LoadingBlock label="Loading snapshots..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'statement_period', label: 'Period' },
{ key: 'period_start', label: 'Start' },
{ key: 'period_end', label: 'End' },
{ key: 'food_sales', label: 'Food Sales' },
{ key: 'soft_drinks_sales', label: 'Soft Drinks' },
{ key: 'alcoholic_drinks_sales', label: 'Alcohol' },
{ key: 'total_sales', label: 'Total Sales' },
{ key: 'total_expenses', label: 'Expenses' },
{ key: 'net_profit', label: 'Net Profit' },
{ key: 'created_at', label: 'Created' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
