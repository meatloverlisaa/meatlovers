import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AssetRepairLogsPage() {
return (
<OperationalFormPage
title="Asset Repair Logs"
subtitle="Record repairs and maintenance costs"
queryKey="asset-repair-logs"
queryFn={operationsApi.assetRepairLogs}
mutationFn={operationsApi.createAssetRepairLog}
initialForm={{
asset_id: '',
repair_date: '',
repair_cost: '',
repair_description: '',
repaired_by: '',
}}
buildPayload={(form) => ({
asset_id: Number(form.asset_id),
repair_date: form.repair_date,
repair_cost: Number(form.repair_cost || 0),
repair_description: form.repair_description,
repaired_by: form.repaired_by,
})}
fields={[
{ name: 'asset_id', label: 'Asset ID', type: 'number' },
{ name: 'repair_date', label: 'Repair Date', type: 'date' },
{ name: 'repair_cost', label: 'Repair Cost', type: 'number' },
{ name: 'repair_description', label: 'Repair Description', type: 'textarea' },
{ name: 'repaired_by', label: 'Repaired By' },
]}
columns={[
{ key: 'asset_name', label: 'Asset' },
{ key: 'repair_date', label: 'Repair Date' },
{ key: 'repair_cost', label: 'Cost' },


{ key: 'repair_description', label: 'Description' },
{ key: 'repaired_by', label: 'Repaired By' },
{ key: 'recorded_by_name', label: 'Recorded By' },
]}
submitLabel="Record Repair"
/>
)
}
