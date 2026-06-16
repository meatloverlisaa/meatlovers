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
export default function DispatchControlPage() {
const qc = useQueryClient()


const [assignForm, setAssignForm] = useState({
order_id: '',
rider_name: '',
rider_phone: '',
})
const [failForm, setFailForm] = useState({
order_id: '',
failed_reason: '',
})
const { data, isLoading, error } = useQuery({
queryKey: ['dispatch-control'],
queryFn: operationsApi.dispatchOrders,
})
const assignMutation = useMutation({
mutationFn: (payload) =>
operationsApi.assignRider(payload.order_id, {
rider_name: payload.rider_name,
rider_phone: payload.rider_phone,
}),
onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch-control'] }),
})
const dispatchMutation = useMutation({
mutationFn: (orderId) => operationsApi.dispatchOrder(orderId, {}),
onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch-control'] }),
})
const deliverMutation = useMutation({
mutationFn: operationsApi.markDelivered,
onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch-control'] }),
})
const failMutation = useMutation({
mutationFn: (payload) =>
operationsApi.failDelivery(payload.order_id, {
failed_reason: payload.failed_reason,
}),
onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch-control'] }),
})
const rows = (data || []).map((item) => ({
...item,
actions: (
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
<Button onClick={() => dispatchMutation.mutate(item.order_id)}>Dispatch</Button>
<Button onClick={() => deliverMutation.mutate(item.order_id)}>Delivered</Button>
</div>
),
}))
return (
<Page title="Dispatch Control" subtitle="Assign riders, dispatch, deliver, or fail delivery">
<Card title="Assign Rider">
<form
onSubmit={(e) => {
e.preventDefault()
assignMutation.mutate(assignForm)
}}
style={{ display: 'grid', gap: 10, maxWidth: 560 }}
>
<Input placeholder="Order ID" value={assignForm.order_id} onChange={(e) => setAssignForm({
...assignForm, order_id: e.target.value })} />
<Input placeholder="Rider Name" value={assignForm.rider_name} onChange={(e) => setAssignForm({
...assignForm, rider_name: e.target.value })} />
<Input placeholder="Rider Phone" value={assignForm.rider_phone} onChange={(e) => setAssignForm({
...assignForm, rider_phone: e.target.value })} />
<Button type="submit">Assign Rider</Button>
</form>
</Card>
<Card title="Mark Delivery Failed">
<form
onSubmit={(e) => {
e.preventDefault()
failMutation.mutate(failForm)
}}
style={{ display: 'grid', gap: 10, maxWidth: 560 }}
>
<Input placeholder="Order ID" value={failForm.order_id} onChange={(e) => setFailForm({ ...failForm,
order_id: e.target.value })} />
<Input placeholder="Failed Reason" value={failForm.failed_reason} onChange={(e) => setFailForm({
...failForm, failed_reason: e.target.value })} />
<Button type="submit">Mark Failed</Button>


</form>
</Card>
<Card title="Delivery Queue">
{isLoading ? <LoadingBlock label="Loading deliveries..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'order_number', label: 'Order' },
{ key: 'customer_name', label: 'Customer' },
{ key: 'delivery_status', label: 'Status' },
{ key: 'rider_name', label: 'Rider' },
{ key: 'rider_phone', label: 'Phone' },
{ key: 'actions', label: 'Actions' },
]}
rows={rows}
/>
) : null}
</Card>
</Page>
)
}
