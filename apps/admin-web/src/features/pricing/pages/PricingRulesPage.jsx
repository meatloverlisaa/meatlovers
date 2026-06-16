import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function PricingRulesPage() {
return (
<OperationalFormPage
title="Pricing Rules"
subtitle="Set category-specific pricing and discount rules"
queryKey="pricing-rules"
queryFn={operationsApi.pricingRules}
mutationFn={operationsApi.createPricingRule}
initialForm={{
product_category: 'FOOD',
minimum_margin_percent: '',
maximum_discount_percent: '',
rule_status: 'ACTIVE',
notes: '',
}}
buildPayload={(form) => ({
...form,
minimum_margin_percent: Number(form.minimum_margin_percent),
maximum_discount_percent: Number(form.maximum_discount_percent),
})}
fields={[
{
name: 'product_category',
label: 'Product Category',
type: 'select',
options: [
{ value: 'FOOD', label: 'Food' },
{ value: 'SOFT_DRINK', label: 'Soft Drink' },
{ value: 'ALCOHOLIC_DRINK', label: 'Alcoholic Drink' },
],
},
{ name: 'minimum_margin_percent', label: 'Minimum Margin %', type: 'number' },
{ name: 'maximum_discount_percent', label: 'Maximum Discount %', type: 'number' },
{
name: 'rule_status',
label: 'Status',
type: 'select',
options: [
{ value: 'ACTIVE', label: 'Active' },
{ value: 'INACTIVE', label: 'Inactive' },
],
},
{ name: 'notes', label: 'Notes', type: 'textarea' },
]}
columns={[
{ key: 'product_category', label: 'Category' },
{ key: 'minimum_margin_percent', label: 'Minimum Margin %' },
{ key: 'maximum_discount_percent', label: 'Max Discount %' },
{ key: 'rule_status', label: 'Status' },
{ key: 'created_by_name', label: 'Created By' },
]}
submitLabel="Create Pricing Rule"
/>
)
}
