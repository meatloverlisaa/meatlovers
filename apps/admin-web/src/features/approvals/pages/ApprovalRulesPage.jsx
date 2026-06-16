import React from 'react'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
export default function ApprovalRulesPage() {
return (
<Page title="Approval Rules" subtitle="Operational approval enforcement rules">
<div style={{ display: 'grid', gap: 16 }}>
<Card title="Order Cancellation">
Waiters and cashiers may request cancellation, but only manager/admin approval can apply
cancellation.
</Card>
<Card title="Discount">
Waiters and cashiers may request discount, but only manager/admin approval can apply the discount to
the order.
</Card>
<Card title="Stock Adjustment">
Storekeepers may request adjustment, but only approved requests can update stock movement and
balance.
</Card>
<Card title="Refund Placeholder">
Refund approval exists as a control type, but actual refund execution must be wired in the payment
refund phase.
</Card>
</div>
</Page>
)
}
