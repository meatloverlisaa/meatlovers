"use client";

import { useState, useEffect } from "react";
import { StockBalanceTable } from "./components/StockBalanceTable";
import { StockInForm } from "./components/StockInForm";
import { TransferForm } from "./components/TransferForm";
import { AdjustmentForm } from "./components/AdjustmentForm";
import { ReorderAlertList } from "./components/ReorderAlertList";
import { MovementTimeline } from "./components/MovementTimeline";
import { getAuthHeader } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

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

async function getProducts(): Promise<Product[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/products`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }

  return res.json();
}

async function getStockBalance(): Promise<StockBalance[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/stock/balance`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load stock balance: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  const rawBalance = await res.json();
  
  // Transform the response to match our StockBalance type
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
    // Try to fetch recent movements - this endpoint might not exist yet
    const allStockItems = await fetch(`${baseUrl}/stock`, { 
      cache: "no-store",
      headers: getAuthHeader(),
    });
    
    if (!allStockItems.ok) {
      return [];
    }
    
    const items = await allStockItems.json();
    
    // Extract movements from all stock items
    const allMovements: StockMovement[] = [];
    for (const item of items) {
      if (item.movements && Array.isArray(item.movements)) {
        allMovements.push(...item.movements);
      }
    }
    
    // Sort by created_at desc and take recent 50
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
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
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
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
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
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to adjust: ${res.status}${text ? ` - ${text}` : ""}`);
  }

  return res.json();
}

export default function StockControlPage() {
  useRequireAuth(["SUPER_ADMIN", "ADMIN", "MANAGER", "STOREKEEPER"]);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [balance, setBalance] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [productsData, balanceData, movementsData] = await Promise.all([
          getProducts().catch(e => {
            if (mounted) setProductsError(e instanceof Error ? e.message : "Unknown error");
            return [];
          }),
          getStockBalance().catch(e => {
            if (mounted) setBalanceError(e instanceof Error ? e.message : "Unknown error");
            return [];
          }),
          getRecentMovements().catch(e => {
            console.warn("Failed to load movements:", e);
            return [];
          }),
        ]);
        if (mounted) {
          setProducts(productsData);
          setBalance(balanceData);
          setMovements(movementsData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStockIn = async (formData: FormData) => {
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

    // Reload data
    const [productsData, balanceData, movementsData] = await Promise.all([
      getProducts(),
      getStockBalance(),
      getRecentMovements(),
    ]);
    setProducts(productsData);
    setBalance(balanceData);
    setMovements(movementsData);
  };

  const handleTransfer = async (formData: FormData) => {
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

    // Reload data
    const [productsData, balanceData, movementsData] = await Promise.all([
      getProducts(),
      getStockBalance(),
      getRecentMovements(),
    ]);
    setProducts(productsData);
    setBalance(balanceData);
    setMovements(movementsData);
  };

  const handleAdjustment = async (formData: FormData) => {
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

    // Reload data
    const [productsData, balanceData, movementsData] = await Promise.all([
      getProducts(),
      getStockBalance(),
      getRecentMovements(),
    ]);
    setProducts(productsData);
    setBalance(balanceData);
    setMovements(movementsData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Stock Control</h1>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Stock Control
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Manage inventory, track movements, and monitor stock levels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Access: <span className="font-medium text-zinc-900 dark:text-zinc-50">ADMIN, MANAGER, STOREKEEPER</span>
            </span>
          </div>
        </div>

        {/* Error Messages */}
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

        {/* Stock Balance Table */}
        <StockBalanceTable balance={balance} />

        {/* Reorder Alerts */}
        <ReorderAlertList balance={balance} reorderThreshold={10} />

        {/* Operations Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Stock In Form */}
          <StockInForm products={products} onSubmit={handleStockIn} />

          {/* Transfer Form */}
          <TransferForm products={products} onSubmit={handleTransfer} />

          {/* Adjustment Form */}
          <AdjustmentForm products={products} onSubmit={handleAdjustment} />
        </div>

        {/* Movement Timeline */}
        {movements.length > 0 && (
          <MovementTimeline movements={movements} />
        )}

        {/* Info Footer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">Stock Control Features</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Stock In:</strong> Record incoming stock from suppliers or production</li>
                <li><strong>Transfer:</strong> Move stock between locations (Store, Bar, Kitchen, Dispatch)</li>
                <li><strong>Adjustment:</strong> Correct discrepancies, record damages, losses, or spoilage</li>
                <li><strong>Reorder Alerts:</strong> Automatic notifications for low stock items</li>
                <li><strong>Movement Timeline:</strong> Complete audit trail of all stock transactions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
