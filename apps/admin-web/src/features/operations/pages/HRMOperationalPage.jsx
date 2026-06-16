import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function HRMOperationalPage() {
return (
<OperationalPage
title="HRM"
subtitle="Staff users, roles, and active status"
queryKey="ops-hrm"
queryFn={operationsApi.staff}
columns={[
{ key: 'full_name', label: 'Staff Name' },
{ key: 'email', label: 'Email' },
{ key: 'phone', label: 'Phone' },
{ key: 'role', label: 'Role' },
{ key: 'is_active', label: 'Active' },
]}
/>
)
}
