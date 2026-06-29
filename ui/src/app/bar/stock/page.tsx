import { revalidatePath } from "next/cache";
import React from "react";
import { BarStockTable } from "./components/BarStockTable";
import { BarSaleDeductionForm } from "./components/BarSaleDeductionForm";
import { TransferReceiptList } from "./components/TransferReceiptList";

type ProductCategory = "FOOD" | "SOFT_DRINK" | "ALCOHOLIC_DRINK";

type Product = {
  id: bigint | number;
  product_name: string;
  product_category: ProductCategory;
  barcode?: string | null;
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
    barcode?: string | null;
  };
  updated_at: string;
};

type TransferReceipt = {
  id: string | number;
  stock_item_id: string | number;
  movement_type: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
  stock_item: {
    location: string;
    product: {
      id: string | number;
      product_name: string;
      product_category: string;
    };
  };
};

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/products`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function getBarStockBalance(): Promise<StockBalance[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/stock/balance?location=Bar`, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load bar stock balance: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

async function getBarTransfers(): Promise<TransferReceipt[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  
  try {
    const res = await fetch(`${baseUrl}/bar/stock/transfers`, { cache: "no-store" });
    
    if (!res.ok) {
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.warn("Error loading transfers:", error);
    return [];
  }
}

async function postBarSaleDeduction(payload: {
  productId: string;
  quantity: number;
  notes?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/bar/stock/sale-deduction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to record sale: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

export default async function BarStockPage() {
  let products: Product[] = [];
  let balance: StockBalance[] = [];
  let transfers: TransferReceipt[] = [];
  let productsError: string | null = null;
  let balanceError: string | null = null;

  try {
    products = await getProducts();
  } catch (e) {
    productsError = e instanceof Error ? e.message : "Unknown error";
  }

  try {
    balance = await getBarStockBalance();
  } catch (e) {
    balanceError = e instanceof Error ? e.message : "Unknown error";
  }

  try {
    transfers = await getBarTransfers();
  } catch (e) {
    console.warn("Failed to load transfers:", e);
  }

  // Filter products to only beverages (SOFT_DRINK and ALCOHOLIC_DRINK)
  const beverageProducts = products.filter(
    (p) => p.product_category === "SOFT_DRINK" || p.product_category === "ALCOHOLIC_DRINK"
  );

  const handleSaleDeduction = async (formData: FormData) => {
    "use server";

    const productId = String(formData.get("productId") ?? "").trim();
    const quantityRaw = String(formData.get("quantity") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const quantity = Number(quantityRaw);

    if (!productId) throw new Error("Product is required.");
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be a positive number.");

    await postBarSaleDeduction({
      productId,
      quantity,
      notes: notes.length ? notes : undefined,
    });

    revalidatePath("/bar/stock");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Bar Stock
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Track bar inventory, record sales, and view transfers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Access: <span className="font-medium text-zinc-900 dark:text-zinc-50">BARMAN</span>
            </span>
          </div>
        </div>

        {/* Error Messages */}
        {(balanceError || productsError) && (
          <div className="space-y-3">
            {balanceError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Bar Stock Error:</strong> {balanceError}
              </div>
            )}
            {productsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                <strong>Products Error:</strong> {productsError}
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Bar Stock Table (2/3 width) */}
          <div className="lg:col-span-2">
            <BarStockTable balance={balance} />
          </div>

          {/* Right Column: Sale Deduction Form */}
          <div>
            <BarSaleDeductionForm 
              products={beverageProducts} 
              balance={balance}
              onSubmit={handleSaleDeduction} 
            />
          </div>
        </div>

        {/* Transfer Receipts */}
        <TransferReceiptList transfers={transfers} />

        {/* Info Footer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">Bar Stock Features</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Stock Balance:</strong> View current inventory at the bar location</li>
                <li><strong>Sale Deduction:</strong> Record stock decreases when serving drinks</li>
                <li><strong>Transfer Receipts:</strong> Track incoming stock from main store</li>
                <li><strong>Low Stock Alerts:</strong> Automatic warnings for items needing restock</li>
                <li><strong>Quick Search:</strong> Find products by name or scan barcode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
