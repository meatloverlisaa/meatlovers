import React from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
export default function OperationalForm({ fields, form, setForm, submitLabel = 'Save', onSubmit }) {
return (
<form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
{fields.map((field) => {
if (field.type === 'select') {
return (
<Select
key={field.name}
value={form[field.name] ?? ''}
onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
>
<option value="">{field.placeholder || `Select ${field.label}`}</option>
{field.options.map((option) => (
<option key={option.value} value={option.value}>
{option.label}
</option>
))}
</Select>
)
}
if (field.type === 'textarea') {
return (
<textarea
key={field.name}
placeholder={field.placeholder || field.label}
value={form[field.name] ?? ''}
onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
style={{
padding: '10px 12px',
border: '1px solid #d1d5db',
borderRadius: 10,
width: '100%',
minHeight: 90,
}}
/>
)
}
return (
<Input
key={field.name}
type={field.type || 'text'}
placeholder={field.placeholder || field.label}
value={form[field.name] ?? ''}
onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
/>
)
})}
<Button type="submit">{submitLabel}</Button>
</form>
)
}
