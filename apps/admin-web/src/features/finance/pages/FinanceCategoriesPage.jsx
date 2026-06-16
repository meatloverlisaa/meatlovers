import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { operationsApi } from '../../operations/api/operationsApi'
export default function FinanceCategoriesPage() {
return (
<OperationalFormPage
title="Finance Categories"
subtitle="Manage income and expense categories"
queryKey="finance-categories"
queryFn={operationsApi.financeCategories}
mutationFn={operationsApi.createFinanceCategory}
initialForm={{
category_name: '',
category_type: 'EXPENSE',
description: '',
}}
buildPayload={(form) => form}
fields={[
{ name: 'category_name', label: 'Category Name' },
{
name: 'category_type',
label: 'Category Type',
type: 'select',
options: [
{ value: 'INCOME', label: 'Income' },
{ value: 'EXPENSE', label: 'Expense' },
],
},
{ name: 'description', label: 'Description', type: 'textarea' },
]}
columns={[
{ key: 'category_name', label: 'Category' },


{ key: 'category_type', label: 'Type' },
{ key: 'description', label: 'Description' },
{ key: 'is_active', label: 'Active' },
]}
/>
)
}
