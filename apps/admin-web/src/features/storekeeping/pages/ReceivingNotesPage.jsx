import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'


import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function ReceivingNotesPage() {
const qc = useQueryClient()
const [form, setForm] = useState({
supplier_id: '',
supplier_invoice_id: '',
received_date: '',
product_id: '',
quantity_received: '',
unit_cost: '',
notes: '',
})
const { data, isLoading, error } = useQuery({
queryKey: ['receiving-notes'],
queryFn: operationsApi.receivingNotes,
})
const createMutation = useMutation({
mutationFn: operationsApi.createReceivingNote,
onSuccess: () => qc.invalidateQueries({ queryKey: ['receiving-notes'] }),
})
const receiveMutation = useMutation({
mutationFn: operationsApi.receiveStockFromNote,
onSuccess: () => qc.invalidateQueries({ queryKey: ['receiving-notes'] }),
})
function submit(e) {
e.preventDefault()
createMutation.mutate({
supplier_id: Number(form.supplier_id),
supplier_invoice_id: form.supplier_invoice_id ? Number(form.supplier_invoice_id) : null,
received_date: form.received_date,
notes: form.notes,
items: [
{
product_id: Number(form.product_id),
quantity_received: Number(form.quantity_received),
unit_cost: Number(form.unit_cost),
},
],
})
}
const rows = (data || []).map((item) => ({
...item,
action: <Button onClick={() => receiveMutation.mutate(item.id)}>Receive Stock</Button>,
}))
return (
<Page title="Receiving Notes" subtitle="Create receiving notes and receive stock into store">
<Card title="Create Receiving Note">
{createMutation.error ? <StatusMessage error={createMutation.error.message} /> : null}
<form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
<Input placeholder="Supplier ID" value={form.supplier_id} onChange={(e) => setForm({ ...form,
supplier_id: e.target.value })} />
<Input placeholder="Supplier Invoice ID optional" value={form.supplier_invoice_id} onChange={(e) =>
setForm({ ...form, supplier_invoice_id: e.target.value })} />
<Input type="date" value={form.received_date} onChange={(e) => setForm({ ...form, received_date:
e.target.value })} />
<Input placeholder="Product ID" value={form.product_id} onChange={(e) => setForm({ ...form,
product_id: e.target.value })} />
<Input placeholder="Quantity Received" value={form.quantity_received} onChange={(e) => setForm({
...form, quantity_received: e.target.value })} />
<Input placeholder="Unit Cost" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost:
e.target.value })} />
<Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes:
e.target.value })} />
<Button type="submit">Create Receiving Note</Button>
</form>
</Card>
<Card title="Receiving Notes">
{isLoading ? <LoadingBlock label="Loading receiving notes..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (


<DataTable
columns={[
{ key: 'supplier_name', label: 'Supplier' },
{ key: 'received_by_name', label: 'Received By' },
{ key: 'received_date', label: 'Date' },
{ key: 'receiving_status', label: 'Status' },
{ key: 'action', label: 'Action' },
]}
rows={rows}
/>
) : null}
</Card>
</Page>
)
}
