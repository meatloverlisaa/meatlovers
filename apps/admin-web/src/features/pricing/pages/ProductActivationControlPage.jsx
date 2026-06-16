import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function ProductActivationControlPage() {
const [productId, setProductId] = useState('')
const [success, setSuccess] = useState('')
const deactivateMutation = useMutation({
mutationFn: () => operationsApi.deactivateProduct(productId),
onSuccess: () => setSuccess('Product deactivated'),
})
const activateMutation = useMutation({
mutationFn: () => operationsApi.activateProduct(productId),
onSuccess: () => setSuccess('Product activated'),
})
return (
<Page title="Product Activation Control" subtitle="Deactivate or reactivate products">
<Card title="Product Status Control">
<StatusMessage
success={success}
error={deactivateMutation.error?.message || activateMutation.error?.message}
/>
<div style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
<Input placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<Button onClick={() => activateMutation.mutate()}>Activate Product</Button>
<button onClick={() => deactivateMutation.mutate()} style={dangerButton}>
Deactivate Product
</button>
</div>
</div>
</Card>
</Page>
)
}


const dangerButton = {
padding: '10px 14px',
borderRadius: 10,
border: '1px solid #be123c',
background: '#fff1f2',
color: '#be123c',
cursor: 'pointer',
}
