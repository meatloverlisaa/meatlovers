import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function RidersPage() {
return (
<OperationalFormPage
title="Riders"
subtitle="Create and monitor delivery riders"
queryKey="riders"
queryFn={operationsApi.riders}
mutationFn={operationsApi.createRider}
initialForm={{
rider_name: '',
rider_phone: '',
rider_status: 'ACTIVE',
notes: '',
}}
buildPayload={(form) => form}
fields={[
{ name: 'rider_name', label: 'Rider Name' },
{ name: 'rider_phone', label: 'Rider Phone' },
{
name: 'rider_status',
label: 'Rider Status',
type: 'select',
options: [
{ value: 'ACTIVE', label: 'Active' },
{ value: 'INACTIVE', label: 'Inactive' },
{ value: 'SUSPENDED', label: 'Suspended' },
],
},
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'rider_name', label: 'Rider' },
{ key: 'rider_phone', label: 'Phone' },
{ key: 'rider_status', label: 'Status' },
{ key: 'notes', label: 'Notes' },
]}
submitLabel="Create Rider"
/>
)
}
