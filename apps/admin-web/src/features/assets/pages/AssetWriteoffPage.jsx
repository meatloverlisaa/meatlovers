import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AssetWriteoffPage() {
return (
<OperationalFormPage
title="Asset Write-Off Requests"
subtitle="Request asset disposal/write-off for management approval"
queryKey="asset-writeoff-requests"
queryFn={operationsApi.assetWriteoffRequests}
mutationFn={operationsApi.createAssetWriteoffRequest}
initialForm={{
asset_id: '',
request_reason: '',
estimated_loss: '',
}}
buildPayload={(form) => ({
asset_id: Number(form.asset_id),
request_reason: form.request_reason,
estimated_loss: Number(form.estimated_loss || 0),
})}
fields={[


{ name: 'asset_id', label: 'Asset ID', type: 'number' },
{ name: 'request_reason', label: 'Write-Off Reason', type: 'textarea' },
{ name: 'estimated_loss', label: 'Estimated Loss', type: 'number' },
]}
columns={[
{ key: 'asset_name', label: 'Asset' },
{ key: 'requested_by_name', label: 'Requested By' },
{ key: 'request_reason', label: 'Reason' },
{ key: 'estimated_loss', label: 'Loss' },
{ key: 'writeoff_status', label: 'Status' },
{ key: 'approved_by_name', label: 'Approved By' },
]}
submitLabel="Request Write-Off"
/>
)
}
