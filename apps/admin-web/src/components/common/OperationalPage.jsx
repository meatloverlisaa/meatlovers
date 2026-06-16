import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../ui/Page'
import Card from '../ui/Card'
import DataTable from '../ui/DataTable'
import LoadingBlock from '../ui/LoadingBlock'
import StatusMessage from '../ui/StatusMessage'
export default function OperationalPage({ title, subtitle, queryKey, queryFn, columns, mapRows }) {
const { data, isLoading, error } = useQuery({
queryKey: [queryKey],
queryFn,
})
const rows = mapRows ? mapRows(data) : data || []
return (
<Page title={title} subtitle={subtitle}>
<Card>
{isLoading ? <LoadingBlock label={`Loading ${title.toLowerCase()}...`} /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? <DataTable columns={columns} rows={rows} /> : null}
</Card>
</Page>
)
}
