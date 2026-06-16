import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AssetMaintenancePage() {
return (
<OperationalFormPage
title="Asset Maintenance"
subtitle="Schedule inspections, service, repairs, and cleaning"
queryKey="asset-maintenance"
queryFn={operationsApi.assetMaintenanceSchedules}
mutationFn={operationsApi.createAssetMaintenanceSchedule}
initialForm={{


asset_id: '',
maintenance_type: 'INSPECTION',
scheduled_date: '',
assigned_to: '',
notes: '',
}}
buildPayload={(form) => ({
asset_id: Number(form.asset_id),
maintenance_type: form.maintenance_type,
scheduled_date: form.scheduled_date,
assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
notes: form.notes,
})}
fields={[
{ name: 'asset_id', label: 'Asset ID', type: 'number' },
{
name: 'maintenance_type',
label: 'Maintenance Type',
type: 'select',
options: [
{ value: 'INSPECTION', label: 'Inspection' },
{ value: 'SERVICE', label: 'Service' },
{ value: 'REPAIR', label: 'Repair' },
{ value: 'CLEANING', label: 'Cleaning' },
{ value: 'CALIBRATION', label: 'Calibration' },
],
},
{ name: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
{ name: 'assigned_to', label: 'Assigned Staff ID optional', type: 'number' },
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'asset_name', label: 'Asset' },
{ key: 'maintenance_type', label: 'Type' },
{ key: 'scheduled_date', label: 'Date' },
{ key: 'maintenance_status', label: 'Status' },
{ key: 'assigned_to_name', label: 'Assigned To' },
]}
submitLabel="Schedule Maintenance"
/>
)
}
