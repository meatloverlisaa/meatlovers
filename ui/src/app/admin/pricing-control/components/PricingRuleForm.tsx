import { useState } from "react";
import { PricingRule, PricingRuleType, ProductCategory } from "../page";

type PricingRuleFormProps = {
  rule: PricingRule | null;
  onClose: () => void;
  onSuccess: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export function PricingRuleForm({ rule, onClose, onSuccess }: PricingRuleFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ruleType, setRuleType] = useState<PricingRuleType>(
    rule?.rule_type || "FIXED_PRICE"
  );

  const isEdit = !!rule;
  const ruleId = rule ? (typeof rule.id === "bigint" ? rule.id.toString() : String(rule.id)) : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      rule_type: String(formData.get("rule_type")) as PricingRuleType,
      value: String(formData.get("value") ?? "").trim(),
      product_category: String(formData.get("product_category")) || null,
      min_selling_price: String(formData.get("min_selling_price") ?? "").trim() || null,
      max_selling_price: String(formData.get("max_selling_price") ?? "").trim() || null,
      is_active: (formData.get("is_active") as string) === "true",
    };

    try {
      const url = isEdit
        ? `${API_BASE_URL}/pricing-rules/${ruleId}`
        : `${API_BASE_URL}/pricing-rules`;
      
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to ${isEdit ? "update" : "create"} pricing rule: ${res.status} ${text}`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "create"} pricing rule`);
      setSubmitting(false);
    }
  };

  const getRuleTypeDescription = (type: PricingRuleType): string => {
    switch (type) {
      case "FIXED_PRICE":
        return "Set a fixed selling price (e.g., 100.00 means KES 100)";
      case "PERCENT_INCREASE":
        return "Increase price by percentage (e.g., 10 means +10%)";
      case "PERCENT_DECREASE":
        return "Decrease price by percentage (e.g., 15 means -15%)";
      default:
        return "";
    }
  };

  const getValueLabel = (type: PricingRuleType): string => {
    switch (type) {
      case "FIXED_PRICE":
        return "Fixed Price (KES)";
      case "PERCENT_INCREASE":
        return "Increase Percentage (%)";
      case "PERCENT_DECREASE":
        return "Decrease Percentage (%)";
      default:
        return "Value";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {isEdit ? "Edit Pricing Rule" : "Create Pricing Rule"}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {isEdit ? "Update pricing rule settings" : "Define a new pricing rule for margin control"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Rule Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Rule Name *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={rule?.name || ""}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  placeholder="e.g., Happy Hour Discount, Festival Markup"
                />
              </div>

              {/* Rule Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Rule Type *
                </label>
                <select
                  name="rule_type"
                  required
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as PricingRuleType)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                >
                  <option value="FIXED_PRICE">Fixed Price</option>
                  <option value="PERCENT_INCREASE">Percent Increase</option>
                  <option value="PERCENT_DECREASE">Percent Decrease</option>
                </select>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {getRuleTypeDescription(ruleType)}
                </p>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {getValueLabel(ruleType)} *
                </label>
                <input
                  name="value"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={rule?.value || ""}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                  placeholder={ruleType === "FIXED_PRICE" ? "e.g., 100.00" : "e.g., 10"}
                />
              </div>

              {/* Product Category */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Product Category (Optional)
                </label>
                <select
                  name="product_category"
                  defaultValue={rule?.product_category || ""}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                >
                  <option value="">All Categories</option>
                  <option value="FOOD">Food</option>
                  <option value="SOFT_DRINK">Soft Drinks</option>
                  <option value="ALCOHOLIC_DRINK">Alcoholic Drinks</option>
                </select>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Leave blank to apply rule to all product categories
                </p>
              </div>

              {/* Min/Max Price Constraints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Minimum Selling Price (Optional)
                  </label>
                  <input
                    name="min_selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={rule?.min_selling_price || ""}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    placeholder="e.g., 50.00"
                  />
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Prevent prices below this amount
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Maximum Selling Price (Optional)
                  </label>
                  <input
                    name="max_selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={rule?.max_selling_price || ""}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                    placeholder="e.g., 500.00"
                  />
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Prevent prices above this amount
                  </p>
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  name="is_active"
                  defaultValue={rule ? String(rule.is_active) : "true"}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Only active rules can be applied to products
                </p>
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      About Pricing Rules
                    </h3>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      Pricing rules help maintain consistent margins and prevent unapproved discounts.
                      When applied, they automatically calculate new prices based on the rule type.
                      Min/max constraints ensure prices stay within acceptable ranges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                {submitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Rule" : "Create Rule")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
