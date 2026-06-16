import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AssetDamageReportsPage() {
return (
<OperationalFormPage
title="Asset Damage Reports"
subtitle="Report damaged assets and estimated loss"
queryKey="asset-damage-reports"
queryFn={operationsApi.assetDamageReports}
mutationFn={operationsApi.createAssetDamageReport}
initialForm={{
asset_id: '',
damage_date: '',
damage_description: '',
estimated_loss: '',
}}
buildPayload={(form) => ({
asset_id: Number(form.asset_id),
damage_date: form.damage_date,
damage_description: form.damage_description,
estimated_loss: Number(form.estimated_loss || 0),
})}
fields={[
{ name: 'asset_id', label: 'Asset ID', type: 'number' },
{ name: 'damage_date', label: 'Damage Date', type: 'date' },
{ name: 'damage_description', label: 'Damage Description', type: 'textarea' },
{ name: 'estimated_loss', label: 'Estimated Loss', type: 'number' },
]}
columns={[
{ key: 'asset_name', label: 'Asset' },
{ key: 'reported_by_name', label: 'Reported By' },
{ key: 'damage_date', label: 'Date' },
{ key: 'damage_status', label: 'Status' },
{ key: 'estimated_loss', label: 'Estimated Loss' },
]}
submitLabel="Report Damage"
/>
)
}
