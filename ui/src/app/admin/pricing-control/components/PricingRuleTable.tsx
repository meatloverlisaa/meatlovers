import { PricingRule, PricingRuleType, ProductCategory } from "../page";

type PricingRuleTableProps = {
  rules: PricingRule[];
  onEdit: (rule: PricingRule) => void;
  onDelete: (id: string) => void;
};

export function PricingRuleTable({ rules, onEdit, onDelete }: PricingRuleTableProps) {
  if (rules.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">No pricing rules</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Get started by creating a new pricing rule to control margins and prevent unapproved losses.
        </p>
      </div>
    );
  }

  const getRuleTypeBadge = (type: PricingRuleType) => {
    switch (type) {
      case "FIXED_PRICE":
        return {
          label: "Fixed Price",
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        };
      case "PERCENT_INCREASE":
        return {
          label: "% Increase",
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
        };
      case "PERCENT_DECREASE":
        return {
          label: "% Decrease",
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
        };
      default:
        return {
          label: type,
          color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200",
        };
    }
  };

  const getCategoryBadge = (category: ProductCategory | null) => {
    if (!category) {
      return {
        label: "All Categories",
        color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400",
      };
    }

    switch (category) {
      case "FOOD":
        return {
          label: "Food",
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        };
      case "SOFT_DRINK":
        return {
          label: "Soft Drinks",
          color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200",
        };
      case "ALCOHOLIC_DRINK":
        return {
          label: "Alcoholic",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
        };
      default:
        return {
          label: category,
          color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200",
        };
    }
  };

  const formatValue = (type: PricingRuleType, value: string): string => {
    const numValue = parseFloat(value);
    
    switch (type) {
      case "FIXED_PRICE":
        return `KES ${numValue.toFixed(2)}`;
      case "PERCENT_INCREASE":
        return `+${numValue}%`;
      case "PERCENT_DECREASE":
        return `-${numValue}%`;
      default:
        return value;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-4 py-3 font-medium">Rule Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Min Price</th>
              <th className="px-4 py-3 font-medium">Max Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rules.map((rule) => {
              const id = typeof rule.id === "bigint" ? rule.id.toString() : String(rule.id);
              const typeBadge = getRuleTypeBadge(rule.rule_type);
              const categoryBadge = getCategoryBadge(rule.product_category);
              
              const activeColor = rule.is_active
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400";

              return (
                <tr 
                  key={id} 
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {rule.name}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      Created {new Date(rule.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {formatValue(rule.rule_type, rule.value)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryBadge.color}`}>
                      {categoryBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {rule.min_selling_price ? `KES ${parseFloat(rule.min_selling_price).toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {rule.max_selling_price ? `KES ${parseFloat(rule.max_selling_price).toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${activeColor}`}>
                      {rule.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(rule)}
                        className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Edit
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

      {/* Summary Footer */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            Total: {rules.length} rule{rules.length !== 1 ? "s" : ""}
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">
            Active: {rules.filter(r => r.is_active).length} | Inactive: {rules.filter(r => !r.is_active).length}
          </span>
        </div>
      </div>
    </div>
  );
}
