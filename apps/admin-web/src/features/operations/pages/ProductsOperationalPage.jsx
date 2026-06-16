import React from 'react'
import OperationalPage from '../../../components/common/OperationalPage'
import { operationsApi } from '../api/operationsApi'
export default function ProductsOperationalPage() {
return (
<OperationalPage


title="Products"
subtitle="Food, soft drinks, and alcoholic drinks segmentation"
queryKey="ops-products"
queryFn={operationsApi.products}
columns={[
{ key: 'product_name', label: 'Product' },
{ key: 'product_category', label: 'Category' },
{ key: 'selling_price', label: 'Selling Price' },
{ key: 'cost_price', label: 'Cost Price' },
{ key: 'is_active', label: 'Active' },
]}
/>
)
}
