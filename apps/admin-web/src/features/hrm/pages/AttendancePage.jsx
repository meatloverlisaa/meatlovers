import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../../../components/ui/Page'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import DataTable from '../../../components/ui/DataTable'
import LoadingBlock from '../../../components/ui/LoadingBlock'
import StatusMessage from '../../../components/ui/StatusMessage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function AttendancePage() {
const qc = useQueryClient()
const [form, setForm] = useState({
staff_id: '',
attendance_date: '',
clock_in_notes: '',
clock_out_notes: '',
})
const { data, isLoading, error } = useQuery({
queryKey: ['attendance'],
queryFn: operationsApi.attendance,
})
const clockInMutation = useMutation({


mutationFn: operationsApi.clockIn,
onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
})
const clockOutMutation = useMutation({
mutationFn: operationsApi.clockOut,
onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
})
return (
<Page title="Attendance" subtitle="Clock-in/out, lateness, and attendance status">
<Card title="Clock In / Clock Out">
<StatusMessage error={clockInMutation.error?.message || clockOutMutation.error?.message} />
<div style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
<Input placeholder="Staff ID" value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id:
e.target.value })} />
<Input type="date" value={form.attendance_date} onChange={(e) => setForm({ ...form, attendance_date:
e.target.value })} />
<Input placeholder="Clock-in notes" value={form.clock_in_notes} onChange={(e) => setForm({ ...form,
clock_in_notes: e.target.value })} />
<Input placeholder="Clock-out notes" value={form.clock_out_notes} onChange={(e) => setForm({ ...form,
clock_out_notes: e.target.value })} />
<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
<Button
onClick={() =>
clockInMutation.mutate({
staff_id: Number(form.staff_id),
attendance_date: form.attendance_date,
clock_in_notes: form.clock_in_notes,
})
}
>
Clock In
</Button>
<Button
onClick={() =>
clockOutMutation.mutate({
staff_id: Number(form.staff_id),
attendance_date: form.attendance_date,
clock_out_notes: form.clock_out_notes,
})
}
>
Clock Out
</Button>
</div>
</div>
</Card>
<Card title="Attendance Records">
{isLoading ? <LoadingBlock label="Loading attendance..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'staff_name', label: 'Staff' },
{ key: 'role', label: 'Role' },
{ key: 'attendance_date', label: 'Date' },
{ key: 'clock_in_time', label: 'Clock In' },
{ key: 'clock_out_time', label: 'Clock Out' },
{ key: 'attendance_status', label: 'Status' },
{ key: 'lateness_minutes', label: 'Late Minutes' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
