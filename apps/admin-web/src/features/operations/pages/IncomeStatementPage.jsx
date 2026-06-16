import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../api/operationsApi'
const loaders = {
daily: operationsApi.incomeStatementDaily,
weekly: operationsApi.incomeStatementWeekly,
monthly: operationsApi.incomeStatementMonthly,
annual: operationsApi.incomeStatementAnnual,
}


export default function IncomeStatementPage() {
const [period, setPeriod] = useState('daily')
const { data, isLoading, error } = useQuery({
queryKey: ['income-statement', period],
queryFn: loaders[period],
})
return (
<Page title="Income Statement" subtitle="Daily, weekly, monthly, and annual P&L">
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<Button onClick={() => setPeriod('daily')}>Daily</Button>
<Button onClick={() => setPeriod('weekly')}>Weekly</Button>
<Button onClick={() => setPeriod('monthly')}>Monthly</Button>
<Button onClick={() => setPeriod('annual')}>Annual</Button>
</div>
{isLoading ? <LoadingBlock label="Loading income statement..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{data ? (
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16 }}>
<Card title="Sales Income"><strong>{data.sales_income}</strong></Card>
<Card title="Other Income"><strong>{data.other_income}</strong></Card>
<Card title="Total Income"><strong>{data.total_income}</strong></Card>
<Card title="Expenses"><strong>{data.total_expenses}</strong></Card>
<Card title="Net Profit"><strong>{data.net_profit}</strong></Card>
</div>
) : null}
</Page>
)
}
