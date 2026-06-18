const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type CreateProductPayload = {
  product_name: string;
  product_category: ProductCategory;
  selling_price: string;
  cost_price: string;
  barcode?: string;
  is_active?: boolean;
};

async function createProduct(payload: CreateProductPayload) {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create product: ${res.status} ${text}`);
  }

  return res.json();
}

export default function AdminProductsNewPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create product</h1>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            ← Back to list
          </Link>
        </div>

        <form
          className="mt-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          action={async (formData) => {
            "use server";

            const payload: CreateProductPayload = {
              product_name: String(formData.get("product_name") ?? "").trim(),
              product_category: String(formData.get("product_category") ?? "") as ProductCategory,
              selling_price: String(formData.get("selling_price") ?? "").trim(),
              cost_price: String(formData.get("cost_price") ?? "").trim(),
              barcode: String(formData.get("barcode") ?? "").trim() || undefined,
              is_active: (formData.get("is_active") as string) === "true",
            };

            await createProduct(payload);

            if (typeof window !== "undefined") {
              window.location.href = "/admin/products";
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Product name *</label>
              <input
                name="product_name"
                required
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="e.g. Chicken Burger"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category *</label>
              <select
                name="product_category"
                required
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="FOOD">FOOD</option>
                <option value="SOFT_DRINK">SOFT_DRINK</option>
                <option value="ALCOHOLIC_DRINK">ALCOHOLIC_DRINK</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Selling price *</label>
              <input
                name="selling_price"
                required
                inputMode="decimal"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="e.g. 12.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Cost price *</label>
              <input
                name="cost_price"
                required
                inputMode="decimal"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="e.g. 7.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Barcode</label>
              <input
                name="barcode"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Active</label>
              <select
                name="is_active"
                defaultValue="true"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="true">ACTIVE</option>
                <option value="false">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/admin/products";
              }}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Create
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          * Required fields. Product creation uses the existing API endpoint: <code>/products</code>.
        </p>
      </div>
    </div>
  );
}

