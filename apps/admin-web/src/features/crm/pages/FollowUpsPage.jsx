import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function FollowUpsPage() {
return (
<OperationalFormPage
title="Customer Follow-Ups"
subtitle="Manage feedback, abandoned leads, reminders, and loyalty follow-ups"
queryKey="customer-follow-ups"
queryFn={operationsApi.followUps}
mutationFn={operationsApi.createFollowUp}
initialForm={{
customer_id: '',
website_lead_id: '',
feedback_id: '',
follow_up_type: 'MANAGER_CALL',
assigned_to: '',
due_date: '',
notes: '',
}}
buildPayload={(form) => ({
customer_id: form.customer_id ? Number(form.customer_id) : null,
website_lead_id: form.website_lead_id ? Number(form.website_lead_id) : null,
feedback_id: form.feedback_id ? Number(form.feedback_id) : null,
follow_up_type: form.follow_up_type,
assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
due_date: form.due_date,
notes: form.notes,
})}
fields={[
{ name: 'customer_id', label: 'Customer ID optional', type: 'number' },
{ name: 'website_lead_id', label: 'Website Lead ID optional', type: 'number' },
{ name: 'feedback_id', label: 'Feedback ID optional', type: 'number' },
{
name: 'follow_up_type',
label: 'Follow-Up Type',
type: 'select',
options: [
{ value: 'WEBSITE_LEAD', label: 'Website Lead' },
{ value: 'FEEDBACK', label: 'Feedback' },
{ value: 'ABANDONED_LEAD', label: 'Abandoned Lead' },
{ value: 'BIRTHDAY_REMINDER', label: 'Birthday Reminder' },
{ value: 'ANNIVERSARY_REMINDER', label: 'Anniversary Reminder' },
{ value: 'LOYALTY_REWARD', label: 'Loyalty Reward' },
{ value: 'MANAGER_CALL', label: 'Manager Call' },
],
},


{ name: 'assigned_to', label: 'Assigned Staff ID optional', type: 'number' },
{ name: 'due_date', label: 'Due Date', type: 'date' },
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'customer_name', label: 'Customer' },
{ key: 'customer_phone', label: 'Phone' },
{ key: 'follow_up_type', label: 'Type' },
{ key: 'follow_up_status', label: 'Status' },
{ key: 'assigned_to_name', label: 'Assigned To' },
{ key: 'due_date', label: 'Due Date' },
]}
submitLabel="Create Follow-Up"
/>
)
}
