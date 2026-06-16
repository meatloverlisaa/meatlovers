import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function AssetsOperationalPage() {
return (
<OperationalPage
title="Assets"
subtitle="Restaurant asset inventory and control"
queryKey="ops-assets"
queryFn={operationsApi.assets}
columns={[
{ key: 'asset_name', label: 'Asset' },
{ key: 'asset_category', label: 'Category' },


{ key: 'serial_number', label: 'Serial No.' },
{ key: 'purchase_cost', label: 'Cost' },
{ key: 'asset_status', label: 'Status' },
]}
/>
)
}
