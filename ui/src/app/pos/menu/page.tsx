import React, { useMemo, useState } from "react";

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
  selling_price: string;
  is_active: boolean;
};

type QuantityByProductId = Record<string, number>;

function normalizeId(id: bigint | number): string {
  return typeof id === "bigint" ? id.toString() : String(id);
}

const categories: ProductCategory[] = ["FOOD", "SOFT_DRINK", "ALCOHOLIC_DRINK"];

async function fetchProducts(): Promise<Product[]> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/products`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load products: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

type CategoryNavProps = {
  current: ProductCategory;
  onChange: (c: ProductCategory) => void;
};

function CategoryNav({ current, onChange }: CategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((c) => {
        const active = c === current;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={
              active
                ? "shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
                : "shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            }
          >
            {c.replaceAll("_", " ")}
          </button>
        );
      })}
    </div>
  );
}

function ProductCard({
  product,
  qty,
  onAdd,
  onRemove,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const id = normalizeId(product.id);

  return (
    <div className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{product.product_name}</div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{product.selling_price}</div>
        </div>
        <div
          className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200"
          title="Product id"
        >
          #{id.slice(-6)}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-xs text-zinc-600 dark:text-zinc-300">Selected</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            aria-label={`Decrease quantity for ${product.product_name}`}
          >
            −
          </button>
          <div className="min-w-[2ch] text-center text-base font-semibold text-zinc-900 dark:text-zinc-50">{qty}</div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
            aria-label={`Increase quantity for ${product.product_name}`}
          >
            +
          </button>
        </div>
      </div>

      {!product.is_active ? (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Inactive
        </div>
      ) : null}

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all"
          style={{ width: product.is_active ? `${Math.min(100, qty * 20)}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function PosMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<ProductCategory>("FOOD");
  const [quantities, setQuantities] = useState<QuantityByProductId>({});

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        if (cancelled) return;
        setProducts(data);
        setError(null);

        // Pick first available category based on active products
        const available = categories.find((c) => data.some((p) => p.product_category === c && p.is_active));
        if (available) setActiveCategory(available);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Unknown error";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryProducts = useMemo(() => {
    return products
      .filter((p) => p.product_category === activeCategory)
      .sort((a, b) => a.product_name.localeCompare(b.product_name));
  }, [products, activeCategory]);

  const selectedCount = useMemo(() => {
    return Object.values(quantities).reduce((sum, n) => sum + (n || 0), 0);
  }, [quantities]);

  function getQtyFor(productId: bigint | number) {
    const id = normalizeId(productId);
    return quantities[id] ?? 0;
  }

  function setQtyFor(productId: bigint | number, nextQty: number) {
    const id = normalizeId(productId);
    setQuantities((prev) => {
      const copy = { ...prev };
      if (nextQty <= 0) delete copy[id];
      else copy[id] = nextQty;
      return copy;
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">POS Menu</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Browse categories and select items (cart/order submission comes next).
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Selected items</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{selectedCount}</div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-4">
            <CategoryNav current={activeCategory} onChange={setActiveCategory} />
            <div className="hidden sm:block text-xs text-zinc-600 dark:text-zinc-300">Tap an item to adjust qty</div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[170px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryProducts.map((p) => {
                const qty = getQtyFor(p.id);

                return (
                  <ProductCard
                    key={normalizeId(p.id)}
                    product={p}
                    qty={qty}
                    onAdd={() => {
                      if (!p.is_active) return;
                      setQtyFor(p.id, qty + 1);
                    }}
                    onRemove={() => {
                      setQtyFor(p.id, qty - 1);
                    }}
                  />
                );
              })}

              {categoryProducts.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  No products found for this category.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

