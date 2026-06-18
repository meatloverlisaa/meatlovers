import React from "react";

const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
};

type StockBalanceRow = {
  product_id: bigint | number;
  product_name?: string | null;
  current_quantity: string; // backend may return Decimal as string
  unit_cost?: string | null;
  updated_at?: string | null;
};

async function getProducts(): Promise<Product[]> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/products`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function getStockBalance(): Promise<StockBalanceRow[]> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  // Expected endpoint for this feature.
  // If the backend hasn’t implemented it yet, this will show a clear message.
  const res = await fetch(`${baseUrl}/stock/balance`, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load stock balance: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

async function postStockIn(payload: {
  product_id: string;
  quantity: number;
  unit_cost: number;
  notes?: string;
}) {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/stock/stock-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to stock-in: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

async function postIssueToDepartment(payload: {
  product_id: string;
  quantity: number;
  destination: string;
  notes?: string;
}) {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/stock/issue-to-department`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to issue to department: ${res.status}${text ? ` - ${text}` : ""}`,
    );
  }

  return res.json();
}


export default async function AdminStockOperationalPage() {
  let products: Product[] = [];
  let balance: StockBalanceRow[] = [];
  let productsError: string | null = null;
  let balanceError: string | null = null;

  try {
    products = await getProducts();
  } catch (e) {
    productsError = e instanceof Error ? e.message : "Unknown error";
  }

  try {
    balance = await getStockBalance();
  } catch (e) {
    balanceError = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Admin Stock Operational</h1>
          <Link href="/admin/products" className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50">
            ← Back to Products
          </Link>
        </div>

        {(balanceError || productsError) && (
          <div className="mt-4">
            {balanceError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                {balanceError}
              </div>
            ) : null}
            {productsError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                {productsError}
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Current balance */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">


              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Current balance</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    Latest quantities by product.
                  </p>
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-300">Rows: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{balance.length}</span></div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr className="text-zinc-600 dark:text-zinc-300">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Current quantity</th>
                    <th className="px-4 py-3 font-medium">Unit cost</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {balance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-zinc-600 dark:text-zinc-300">
                        {balanceError ? "Cannot load balance yet." : "No stock balance rows."}
                      </td>
                    </tr>
                  ) : null}

                  {balance.map((row) => {
                    const productId = typeof row.product_id === "bigint" ? row.product_id.toString() : String(row.product_id);
                    return (
                      <tr key={productId} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                        <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                          {row.product_name ?? `#${productId}`}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{row.current_quantity}</td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{row.unit_cost ?? "-"}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                          {row.updated_at ? new Date(row.updated_at).toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock-in form */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Stock-in</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Record inbound stock and update balance.
              </p>
            </div>

            <div className="p-4">
              <form
                className="grid grid-cols-1 gap-4"
                action={async (formData) => {
                  "use server";

                  const product_id = String(formData.get("product_id") ?? "").trim();
                  const quantityRaw = String(formData.get("quantity") ?? "").trim();
                  const unitCostRaw = String(formData.get("unit_cost") ?? "").trim();
                  const notes = String(formData.get("notes") ?? "").trim();

                  const quantity = Number(quantityRaw);
                  const unit_cost = Number(unitCostRaw);

                  if (!product_id) throw new Error("Product is required.");
                  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be a positive number.");
                  if (!Number.isFinite(unit_cost) || unit_cost < 0) throw new Error("Unit cost must be a valid number.");

                  await postStockIn({
                    product_id,
                    quantity,
                    unit_cost,
                    notes: notes.length ? notes : undefined,
                  });

                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
              >
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Product</label>
                  <select
                    name="product_id"
                    defaultValue={products[0] ? (typeof products[0].id === "bigint" ? products[0].id.toString() : String(products[0].id)) : ""}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    disabled={products.length === 0}
                  >
                    {products.length === 0 ? (
                      <option value="">No products loaded</option>
                    ) : null}
                    {products.map((p) => {
                      const id = typeof p.id === "bigint" ? p.id.toString() : String(p.id);
                      return (
                        <option key={id} value={id}>
                          {p.product_name} ({p.product_category})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={"0"}
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Unit cost</label>
                    <input
                      name="unit_cost"
                      type="number"
                      min={0}
                      step={0.01}
                      defaultValue={"0"}
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Notes (optional)</label>
                  <input
                    name="notes"
                    type="text"
                    placeholder="e.g. Supplier delivery reference"
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  Stock-in
                </button>

                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Backend endpoints expected: <span className="font-mono">GET /stock/balance</span> and <span className="font-mono">POST /stock/stock-in</span>.
                  {balanceError ? <div className="mt-1">The page will start working once those endpoints exist.</div> : null}
                </div>
              </form>
            </div>
          </div>

          {/* Bar stock issue to departments */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Bar Stock Issue (Departmental transfers)
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Issue/bar stock out to another department.
              </p>
            </div>

            <div className="p-4">
              <form
                className="grid grid-cols-1 gap-4"
                action={async (formData) => {
                  "use server";

                  const product_id = String(formData.get("product_id") ?? "").trim();
                  const quantityRaw = String(formData.get("quantity") ?? "").trim();
                  const destinationPreset = String(formData.get("destination_preset") ?? "").trim();
                  const destinationOther = String(formData.get("destination_other") ?? "").trim();
                  const notes = String(formData.get("notes") ?? "").trim();

                  const quantity = Number(quantityRaw);

                  let destination = destinationPreset;
                  if (destinationPreset === "OTHER") destination = destinationOther;

                  if (!product_id) throw new Error("Product is required.");
                  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be a positive number.");
                  if (!destination || destination.length < 2) throw new Error("Destination department is required.");

                  await postIssueToDepartment({
                    product_id,
                    quantity,
                    destination,
                    notes: notes.length ? notes : undefined,
                  });

                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
              >
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Product</label>
                  <select
                    name="product_id"
                    defaultValue={products[0] ? (typeof products[0].id === "bigint" ? products[0].id.toString() : String(products[0].id)) : ""}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    disabled={products.length === 0}
                  >
                    {products.length === 0 ? <option value="">No products loaded</option> : null}
                    {products.map((p) => {
                      const id = typeof p.id === "bigint" ? p.id.toString() : String(p.id);
                      return (
                        <option key={id} value={id}>
                          {p.product_name} ({p.product_category})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={"0"}
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Destination</label>
                    <select
                      name="destination_preset"
                      defaultValue={"BAR"}
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="BAR">BAR</option>
                      <option value="KITCHEN">KITCHEN</option>
                      <option value="DISPATCH">DISPATCH</option>
                      <option value="STORE">STORE</option>
                      <option value="OTHER">Other...</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Destination (if Other)</label>
                  <input
                    name="destination_other"
                    type="text"
                    placeholder="e.g. FUNCTIONS, BANQUETING..."
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-200">Notes (optional)</label>
                  <input
                    name="notes"
                    type="text"
                    placeholder="e.g. Transfer reference / reason"
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  Issue to department
                </button>

                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Backend endpoint expected: <span className="font-mono">POST /stock/issue-to-department</span>.
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

