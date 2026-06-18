const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type ProductStatus = "ACTIVE" | "SUSPENDED";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
  selling_price: string;
  cost_price: string;
  barcode?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

async function getProducts(): Promise<Product[]> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/products`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function toggleProductActive(id: string, current: boolean): Promise<Product> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const next = !current;

  const res = await fetch(`${baseUrl}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: next }),
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle product status: ${res.status}`);
  }

  return res.json();
}

export default async function AdminProductsPage() {
  let products: Product[] = [];

  try {
    products = await getProducts();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Products</h1>
          <p className="mt-4 text-sm text-red-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Products</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/stock"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              View stock →
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              + Create product
            </Link>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-zinc-600 dark:text-zinc-300">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Selling price</th>
                  <th className="px-4 py-3 font-medium">Cost price</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {products.map((p) => {
                  const id = typeof p.id === "bigint" ? p.id.toString() : String(p.id);
                  const activeColor = p.is_active
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";

                  return (
                    <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">{p.product_name}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{p.product_category}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{p.selling_price}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{p.cost_price}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${activeColor}`}>
                          {p.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <form
                          action={async () => {
                            "use server";
                            await toggleProductActive(id, p.is_active);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                          >
                            Toggle status
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}

                {products.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={7}>
                      No products found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

