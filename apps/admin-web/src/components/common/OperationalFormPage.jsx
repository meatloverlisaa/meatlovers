import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Page from '../ui/Page'
import Card from '../ui/Card'
import DataTable from '../ui/DataTable'
import LoadingBlock from '../ui/LoadingBlock'
import StatusMessage from '../ui/StatusMessage'
import OperationalForm from './OperationalForm'
import { safeMessage } from '../../lib/helpers'

export default function OperationalFormPage({
  title,
  subtitle,
  queryKey,
  queryFn,
  mutationFn,
  initialForm,
  buildPayload,
  fields,
  columns,
  mapRows,
  submitLabel = 'Save',
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState(initialForm)
  const [success, setSuccess] = useState('')
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn,
  })
  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      setSuccess('Saved successfully')
      setForm(initialForm)
      qc.invalidateQueries({ queryKey: [queryKey] })
    },
  })
  function submit(e) {
    e.preventDefault()
    setSuccess('')
    mutation.mutate(buildPayload(form))
  }
  const rows = mapRows ? mapRows(data) : data || []
  return (
    <Page title={title} subtitle={subtitle}>
      <Card title="Create / Record">
        <StatusMessage success={success} error={safeMessage(mutation.error, '')} />
        <OperationalForm
          fields={fields}
          form={form}
          setForm={setForm}
          submitLabel={submitLabel}
          onSubmit={submit}
        />
      </Card>
      <Card title="Records">
        {isLoading ? <LoadingBlock label={`Loading ${title.toLowerCase()}...`} /> : null}
        {error ? <StatusMessage error={safeMessage(error, 'Could not load records')} /> : null}
        {!isLoading && !error ? <DataTable columns={columns} rows={rows} /> : null}
      </Card>
    </Page>
  )
}
