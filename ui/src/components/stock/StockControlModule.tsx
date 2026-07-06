import { revalidatePath } from "next/cache";
import React from "react";
import { StockBalanceTable } from "@/app/admin/stock/components/StockBalanceTable";
import { StockInForm } from "@/app/admin/stock/components/StockInForm";
import { TransferForm } from "@/app/admin/stock/components/TransferForm";
import { AdjustmentForm } from "@/app/admin/stock/components/AdjustmentForm";
import { ReorderAlertList } from "@/app/admin/stock/components/ReorderAlertList";
import { MovementTimeline } from "@/app/admin/stock/components/MovementTimeline";

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
};

type StockBalance = {
  id: string | number;
  product_id: string | number;
  quantity: number;
  location: string;
  product?: {
    id: string | number;
    product_name: string;
    product_category: string;
    cost_price: string | null;
  };
  updated_at: string;
};

type StockMovement = {
  id: string | number;
  stock_item_id: string | number;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

type StockControlModuleProps = {
  role: "ADMIN" | "MANAGER" | "STOREKEEPER";
  canManage?: boolean;
};

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/products`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function getStockBalance(): Promise<StockBalance[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/stock/balance`, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load stock balance: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  const rawBalance = await res.json();

  return rawBalance.map((item: any) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    location: item.location,
    product: item.product,
    updated_at: item.updated_at,
  }));
}

async function getRecentMovements(): Promise<StockMovement[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  try {
    const allStockItems = await fetch(`${baseUrl}/stock`, { cache: "no-store" });

    if (!allStockItems.ok) {
      return [];
    }

    const items = await allStockItems.json();
    const allMovements: StockMovement[] = [];

    for (const item of items) {
      if (item.movements && Array.isArray(item.movements)) {
        allMovements.push(...item.movements);
      }
    }

    return allMovements
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
  } catch (error) {
    console.warn("Error loading movements:", error);
    return [];
  }
}

async function postStockIn(payload: {
  productId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/stock/purchase`, {
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

async function postTransfer(payload: {
  productId: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  reference?: string;
  notes?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/stock/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to transfer: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

async function postAdjustment(payload: {
  productId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/stock/adjustment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to adjust: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

export async function handleStockIn(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const quantity = Number(quantityRaw);

  if (!productId) throw new Error("Product is required.");
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be a positive number.");

  await postStockIn({
    productId,
    quantity,
    reference: reference.length ? reference : undefined,
    notes: notes.length ? notes : undefined,
  });

  revalidatePath("/admin/stock");
  revalidatePath("/manager/stock");
  revalidatePath("/storekeeper/stock");
}

export async function handleTransfer(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const fromLocation = String(formData.get("fromLocation") ?? "").trim();
  const toLocation = String(formData.get("toLocation") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const quantity = Number(quantityRaw);

  if (!productId) throw new Error("Product is required.");
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be a positive number.");
  if (!fromLocation || !toLocation) throw new Error("Both locations are required.");
  if (fromLocation === toLocation) throw new Error("Source and destination must be different.");

  await postTransfer({
    productId,
    quantity,
    fromLocation,
    toLocation,
    reference: reference.length ? reference : undefined,
    notes: notes.length ? notes : undefined,
  });

  revalidatePath("/admin/stock");
  revalidatePath("/manager/stock");
  revalidatePath("/storekeeper/stock");
}

export async function handleAdjustment(formData: FormData) {
  "use server";

  const productId = String(formData.get("productId") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const adjustmentType = String(formData.get("adjustmentType") ?? "decrease").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  let quantity = Number(quantityRaw);
  if (adjustmentType === "decrease") {
    quantity = -quantity;
  }

  if (!productId) throw new Error("Product is required.");
  if (!Number.isFinite(quantity) || quantity === 0) throw new Error("Quantity must be non-zero.");
  if (!reason) throw new Error("Reason is required.");
  if (!notes) throw new Error("Notes are required for audit trail.");

  await postAdjustment({
    productId,
    quantity,
    reference: reference.length ? reference : undefined,
    notes: `${reason}: ${notes}`,
  });

  revalidatePath("/admin/stock");
  revalidatePath("/manager/stock");
  revalidatePath("/storekeeper/stock");
}

export async function StockControlModule({ role, canManage = true }: StockControlModuleProps) {
  let products: Product[] = [];
  let balance: StockBalance[] = [];
  let movements: StockMovement[] = [];
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

  try {
    movements = await getRecentMovements();
  } catch (e) {
    console.warn("Failed to load movements:", e);
  }

  const roleLabel = role === "MANAGER" ? "Manager" : role === "STOREKEEPER" ? "Storekeeper" : "Admin";
  const accessText = canManage
    ? "Full inventory management and stock adjustments"
    : "View-only oversight of stock levels and alerts";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Stock Control</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {roleLabel} view for inventory oversight and stock coordination.
            </p>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Access: <span className="font-medium text-zinc-900 dark:text-zinc-50">{role}</span>
          </div>
        </div>

        {(balanceError || productsError) && (
          <div className="space-y-3">
            {balanceError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Stock Balance Error:</strong> {balanceError}
              </div>
            )}
            {productsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Products Error:</strong> {productsError}
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{accessText}</span>
            {canManage ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                Full access
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                Read-only
              </span>
            )}
          </div>
        </div>

        <StockBalanceTable balance={balance} />
        <ReorderAlertList balance={balance} reorderThreshold={10} />

        {canManage ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StockInForm products={products} onSubmit={handleStockIn} />
            <TransferForm products={products} onSubmit={handleTransfer} />
            <AdjustmentForm products={products} onSubmit={handleAdjustment} />
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">Manager oversight view</p>
            <p className="mt-2">
              Managers can review stock balances, low-stock alerts, and movement history without changing inventory records.
            </p>
          </div>
        )}

        {movements.length > 0 && <MovementTimeline movements={movements} />}

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">Stock control highlights</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Live stock balance:</strong> Review current inventory across locations</li>
                <li><strong>Reorder alerts:</strong> See low stock and out-of-stock items early</li>
                <li><strong>Movement history:</strong> Track stock changes and adjustments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockControlModule;
