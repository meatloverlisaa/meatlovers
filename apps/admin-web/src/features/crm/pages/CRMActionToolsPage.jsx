import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'


export default function CRMActionToolsPage() {
const [success, setSuccess] = useState('')
const abandonedMutation = useMutation({
mutationFn: operationsApi.generateAbandonedLeadFollowUps,
onSuccess: (result) => setSuccess(`Created ${result.data.created} abandoned lead follow-ups`),
})
const reminderMutation = useMutation({
mutationFn: operationsApi.generateReminderPlaceholders,
onSuccess: (result) => setSuccess(`Created ${result.data.created} reminder placeholders`),
})
return (
<Page title="CRM Action Tools" subtitle="Generate follow-ups and reminder placeholders">
<StatusMessage
success={success}
error={abandonedMutation.error?.message || reminderMutation.error?.message}
/>
<div style={{ display: 'grid', gap: 16 }}>
<Card title="Abandoned Website Leads">
<p>Create follow-ups for website leads still marked as NEW.</p>
<Button onClick={() => abandonedMutation.mutate()}>
Generate Abandoned Lead Follow-Ups
</Button>
</Card>
<Card title="Birthday / Anniversary Placeholder">
<p>Create reminder placeholder follow-ups for customers with saved dates.</p>
<Button onClick={() => reminderMutation.mutate()}>
Generate Reminder Placeholders
</Button>
</Card>
</div>
</Page>
)
}
