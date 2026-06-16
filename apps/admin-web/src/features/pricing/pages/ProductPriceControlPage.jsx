import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function ProductPriceControlPage() {
const [form, setForm] = useState({
product_id: '',
selling_price: '',
cost_price: '',
change_reason: '',
})
const [success, setSuccess] = useState('')
const mutation = useMutation({
mutationFn: () =>
operationsApi.updateProductPrice(form.product_id, {
selling_price: Number(form.selling_price),


cost_price: Number(form.cost_price),
change_reason: form.change_reason,
}),
onSuccess: () => setSuccess('Price updated successfully'),
})
return (
<Page title="Product Price Control" subtitle="Update product price with audit trail">
<Card title="Update Product Price">
<StatusMessage success={success} error={mutation.error?.message} />
<form
onSubmit={(e) => {
e.preventDefault()
setSuccess('')
mutation.mutate()
}}
style={{ display: 'grid', gap: 10, maxWidth: 560 }}
>
<Input placeholder="Product ID" value={form.product_id} onChange={(e) => setForm({ ...form,
product_id: e.target.value })} />
<Input placeholder="New Selling Price" value={form.selling_price} onChange={(e) => setForm({ ...form,
selling_price: e.target.value })} />
<Input placeholder="New Cost Price" value={form.cost_price} onChange={(e) => setForm({ ...form,
cost_price: e.target.value })} />
<Input placeholder="Reason for change" value={form.change_reason} onChange={(e) => setForm({ ...form,
change_reason: e.target.value })} />
<Button type="submit">Update Price</Button>
</form>
</Card>
</Page>
)
}
