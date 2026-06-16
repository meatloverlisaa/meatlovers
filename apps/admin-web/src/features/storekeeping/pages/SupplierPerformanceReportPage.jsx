import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function SupplierPerformanceReportPage() {
const { data, isLoading, error } = useQuery({
queryKey: ['supplier-performance-report'],
queryFn: operationsApi.supplierPerformanceReport,
})
return (
<Page title="Supplier Performance" subtitle="Supplier invoice and receiving note performance">
<Card>
{isLoading ? <LoadingBlock label="Loading supplier performance..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'supplier_name', label: 'Supplier' },
{ key: 'supplier_type', label: 'Type' },
{ key: 'invoice_count', label: 'Invoices' },
{ key: 'total_invoice_amount', label: 'Invoice Amount' },
{ key: 'receiving_note_count', label: 'Receiving Notes' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>


)
}
