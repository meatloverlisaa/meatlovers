import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────
type FinanceTransaction = {
  id: string | number;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  reference: string | null;
  transaction_date: string;
  recorded_by: string | number;
  created_at: string;
  recorder: {
    id: string | number;
    full_name: string;
    email: string;
  };
};

type FinanceSummary = {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byRecorder: Record<string, number>;
  transactions: FinanceTransaction[];
};

// ─── API Functions ─────────────────────────────────────────────────────────────
async function getFinanceSummary(): Promise<FinanceSummary> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/finance-transactions/summary`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load finance summary: ${res.status}`);
  }

  return res.json();
}

async function getFinanceTransactions(filters?: {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}): Promise<FinanceTransaction[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const params = new URLSearchParams();
  
  if (filters?.type) params.append('type', filters.type);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const res = await fetch(`${baseUrl}/finance-transactions?${params.toString()}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load transactions: ${res.status}`);
  }

  return res.json();
}

// ─── Server Actions ─────────────────────────────────────────────────────────────
async function createTransaction(formData: FormData) {
  "use server";

  const type = String(formData.get("type") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const amount = String(formData.get("amount") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const recordedBy = String(formData.get("recorded_by") ?? "").trim();
  const transactionDate = String(formData.get("transaction_date") ?? "").trim();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/finance-transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      category,
      amount: Number(amount),
      description: description || undefined,
      reference: reference || undefined,
      recorded_by: recordedBy,
      transaction_date: transactionDate || undefined,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create transaction: ${res.status}`);
  }

  revalidatePath("/admin/finance");
}

async function deleteTransaction(transactionId: string) {
  "use server";

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/finance-transactions/${transactionId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete transaction: ${res.status}`);
  }

  revalidatePath("/admin/finance");
}

// ─── Components ───────────────────────────────────────────────────────────────
function SummaryCards({ summary }: { summary: FinanceSummary }) {
  const cards = [
    {
      label: "Total Income",
      value: `KSh ${summary.totalIncome.toLocaleString()}`,
      icon: "💰",
      color: "bg-green-100",
    },
    {
      label: "Total Expenses",
      value: `KSh ${summary.totalExpenses.toLocaleString()}`,
      icon: "📉",
      color: "bg-red-100",
    },
    {
      label: "Net Profit",
      value: `KSh ${summary.netProfit.toLocaleString()}`,
      icon: "📊",
      color: summary.netProfit >= 0 ? "bg-blue-100" : "bg-red-100",
    },
    {
      label: "Transactions",
      value: summary.totalTransactions,
      icon: "📝",
      color: "bg-purple-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-black text-zinc-950">{card.value}</p>
            </div>
            <span
              className={`rounded-lg ${card.color} flex h-12 w-12 items-center justify-center text-2xl`}
            >
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionsTable({ transactions, onDelete }: { 
  transactions: FinanceTransaction[];
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Recent Transactions</h3>
        <p className="mt-1 text-xs text-zinc-500">Latest financial transactions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Recorded By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-zinc-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={String(transaction.id)} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        transaction.type === "INCOME"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 max-w-xs truncate">
                    {transaction.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                    KSh {Number(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                    {transaction.recorder?.full_name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <form action={deleteTransaction.bind(null, String(transaction.id))}>
                      <button
                        type="submit"
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateTransactionForm() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Create Transaction</h3>
        <p className="mt-1 text-xs text-zinc-500">Record a new financial transaction</p>
      </div>
      <form action={createTransaction} className="p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-zinc-700 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">Select type</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-zinc-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">Select category</option>
              <option value="SALES">Sales</option>
              <option value="PURCHASE">Purchase</option>
              <option value="SALARY">Salary</option>
              <option value="RENT">Rent</option>
              <option value="UTILITIES">Utilities</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-zinc-700 mb-1">
              Amount (KSh)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="transaction_date" className="block text-sm font-semibold text-zinc-700 mb-1">
              Date
            </label>
            <input
              id="transaction_date"
              name="transaction_date"
              type="date"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Transaction description..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reference" className="block text-sm font-semibold text-zinc-700 mb-1">
              Reference (Optional)
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              placeholder="Invoice #, Receipt #, etc."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="recorded_by" className="block text-sm font-semibold text-zinc-700 mb-1">
              Recorded By (User ID)
            </label>
            <input
              id="recorded_by"
              name="recorded_by"
              type="text"
              required
              placeholder="1"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
        >
          Create Transaction
        </button>
      </form>
    </div>
  );
}

function CategoryBreakdown({ summary }: { summary: FinanceSummary }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-6 py-4">
        <h3 className="font-black text-zinc-950">Breakdown by Category</h3>
        <p className="mt-1 text-xs text-zinc-500">Transaction totals by category</p>
      </div>
      <div className="p-6 space-y-3">
        {Object.entries(summary.byCategory).length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4">No category data available</p>
        ) : (
          Object.entries(summary.byCategory).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900">{category}</span>
              <span className="text-sm font-bold text-zinc-900">
                KSh {amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default async function FinanceDashboard() {
  let summary: FinanceSummary | null = null;
  let transactions: FinanceTransaction[] = [];
  let error: string | null = null;

  try {
    summary = await getFinanceSummary();
    transactions = summary.transactions.slice(0, 20); // Show last 20 transactions
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load finance data";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Finance Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Track income, expenses, and financial transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Access: <span className="font-medium text-zinc-900 dark:text-zinc-50">ADMIN, ACCOUNTANT</span>
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && <SummaryCards summary={summary} />}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create Transaction Form */}
          <div className="lg:col-span-1">
            <CreateTransactionForm />
          </div>

          {/* Transactions Table */}
          <div className="lg:col-span-2">
            <TransactionsTable transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </div>

        {/* Category Breakdown */}
        {summary && <CategoryBreakdown summary={summary} />}

        {/* Info Footer */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 text-xl">ℹ️</span>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">Finance Dashboard Features</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Summary Cards:</strong> View total income, expenses, net profit, and transaction count</li>
                <li><strong>Transaction Management:</strong> Create, view, and delete financial transactions</li>
                <li><strong>Category Breakdown:</strong> See transaction totals grouped by category</li>
                <li><strong>Transaction Types:</strong> Track both income and expense transactions</li>
                <li><strong>Real-time Updates:</strong> Data refreshes automatically on page load</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
