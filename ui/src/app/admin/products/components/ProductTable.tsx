import { Product, ProductCategory } from "../page";

type ProductTableProps = {
  products: Product[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export function ProductTable({
  products,
  onToggleStatus,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">No products found.</p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
          Create your first product to get started.
        </p>
      </div>
    );
  }

  const getCategoryBadgeColor = (category: ProductCategory) => {
    switch (category) {
      case "FOOD":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
      case "SOFT_DRINK":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
      case "ALCOHOLIC_DRINK":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200";
    }
  };

  const calculateMargin = (sellingPrice: string, costPrice: string): string => {
    const selling = parseFloat(sellingPrice);
    const cost = parseFloat(costPrice);
    
    if (isNaN(selling) || isNaN(cost) || selling === 0) {
      return "0%";
    }
    
    const margin = ((selling - cost) / selling) * 100;
    return `${margin.toFixed(1)}%`;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-4 py-3 font-medium">Product Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Selling Price</th>
              <th className="px-4 py-3 font-medium text-right">Cost Price</th>
              <th className="px-4 py-3 font-medium text-right">Margin</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Barcode</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products.map((product) => {
              const id = typeof product.id === "bigint" 
                ? product.id.toString() 
                : String(product.id);
              
              const activeColor = product.is_active
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400";

              const margin = calculateMargin(product.selling_price, product.cost_price);
              const marginValue = parseFloat(margin);
              const marginColor = marginValue < 20 
                ? "text-red-600 dark:text-red-400"
                : marginValue < 40
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400";

              return (
                <tr 
                  key={id} 
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {product.product_name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryBadgeColor(product.product_category)}`}
                    >
                      {product.product_category.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-50">
                    KES {parseFloat(product.selling_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                    KES {parseFloat(product.cost_price).toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${marginColor}`}>
                    {margin}
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${activeColor}`}
                    >
                      {product.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs">
                    {product.barcode || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(id, product.is_active)}
                        className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {product.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(id)}
                        className="rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
