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
export default function RecipesPage() {
const qc = useQueryClient()
const [form, setForm] = useState({
menu_product_id: '',
recipe_name: '',
serving_size: '1',
ingredient_product_id: '',
quantity_required: '',
unit_cost: '',
})
const { data, isLoading, error } = useQuery({
queryKey: ['recipes'],
queryFn: operationsApi.recipes,
})
const mutation = useMutation({
mutationFn: operationsApi.createRecipe,
onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
})
function submit(e) {
e.preventDefault()
mutation.mutate({
menu_product_id: Number(form.menu_product_id),
recipe_name: form.recipe_name,
serving_size: Number(form.serving_size),
items: [
{
ingredient_product_id: Number(form.ingredient_product_id),
quantity_required: Number(form.quantity_required),
unit_cost: Number(form.unit_cost),
},
],
})
}
return (
<Page title="Recipes / BOM" subtitle="Set food recipe and ingredient bill of materials">
<Card title="Create Recipe">
{mutation.error ? <StatusMessage error={mutation.error.message} /> : null}
<form onSubmit={submit} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
<Input placeholder="Menu Product ID" value={form.menu_product_id} onChange={(e) => setForm({ ...form,
menu_product_id: e.target.value })} />
<Input placeholder="Recipe Name" value={form.recipe_name} onChange={(e) => setForm({ ...form,


recipe_name: e.target.value })} />
<Input placeholder="Serving Size" value={form.serving_size} onChange={(e) => setForm({ ...form,
serving_size: e.target.value })} />
<Input placeholder="Ingredient Product ID" value={form.ingredient_product_id} onChange={(e) =>
setForm({ ...form, ingredient_product_id: e.target.value })} />
<Input placeholder="Quantity Required" value={form.quantity_required} onChange={(e) => setForm({
...form, quantity_required: e.target.value })} />
<Input placeholder="Unit Cost" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost:
e.target.value })} />
<Button type="submit">Create Recipe</Button>
</form>
</Card>
<Card title="Recipes">
{isLoading ? <LoadingBlock label="Loading recipes..." /> : null}
{error ? <StatusMessage error={error.message} /> : null}
{!isLoading && !error ? (
<DataTable
columns={[
{ key: 'recipe_name', label: 'Recipe' },
{ key: 'menu_product_name', label: 'Menu Item' },
{ key: 'serving_size', label: 'Serving Size' },
{ key: 'is_active', label: 'Active' },
]}
rows={data || []}
/>
) : null}
</Card>
</Page>
)
}
