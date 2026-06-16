import React from 'react'
import OperationalFormPage from '../../../components/common/OperationalFormPage'
import { staffMotivationApi } from '../api/staffMotivationApi'
export default function BonusRulesPage() {
return (
<OperationalFormPage
title="Bonus Rules"
subtitle="Create service motivation and bonus rules"
queryKey="bonus-rules"
queryFn={staffMotivationApi.bonusRules}
mutationFn={staffMotivationApi.createBonusRule}
initialForm={{
rule_name: '',
role: 'WAITER',
target_type: 'SALES_AMOUNT',
target_value: '',


bonus_amount: '',
}}
buildPayload={(form) => ({
...form,
target_value: Number(form.target_value),
bonus_amount: Number(form.bonus_amount),
})}
fields={[
{ name: 'rule_name', label: 'Rule Name' },
{
name: 'role',
label: 'Role',
type: 'select',
options: [
{ value: 'WAITER', label: 'Waiter' },
{ value: 'CASHIER', label: 'Cashier' },
{ value: 'CHEF', label: 'Chef' },
{ value: 'BARMAN', label: 'Barman' },
{ value: 'DISPATCHER', label: 'Dispatcher' },
],
},
{
name: 'target_type',
label: 'Target Type',
type: 'select',
options: [
{ value: 'SALES_AMOUNT', label: 'Sales Amount' },
{ value: 'ORDERS_SERVED', label: 'Orders Served' },
{ value: 'CUSTOMER_RATING', label: 'Customer Rating' },
],
},
{ name: 'target_value', label: 'Target Value', type: 'number' },
{ name: 'bonus_amount', label: 'Bonus Amount', type: 'number' },
]}
columns={[
{ key: 'rule_name', label: 'Rule' },
{ key: 'role', label: 'Role' },
{ key: 'target_type', label: 'Target Type' },
{ key: 'target_value', label: 'Target' },
{ key: 'bonus_amount', label: 'Bonus' },
{ key: 'is_active', label: 'Active' },
]}
submitLabel="Create Bonus Rule"
/>
)
}
