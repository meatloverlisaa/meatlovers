import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function SuppliersOperationalPage() {
return (
<OperationalPage
title="Suppliers"
subtitle="Approved suppliers and supply source control"
queryKey="ops-suppliers"
queryFn={operationsApi.suppliers}
columns={[
{ key: 'supplier_name', label: 'Supplier' },
{ key: 'contact_person', label: 'Contact Person' },
{ key: 'phone', label: 'Phone' },
{ key: 'supplier_type', label: 'Type' },
{ key: 'status', label: 'Status' },
]}
/>
)
}
