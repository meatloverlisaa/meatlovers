import Link from "next/link";

export default function BarDashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Bar Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Welcome to the bar management portal
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Bar Stock Card */}
          <Link
            href="/bar/stock"
            className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 transition hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-2xl">
                📦
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-red-700 dark:group-hover:text-red-400">
                  Bar Stock
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  View inventory & record sales
                </p>
              </div>
            </div>
          </Link>

          {/* Bar Sales Card - Placeholder */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-2xl">
                💰
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Bar Sales
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Bar Reports Card - Placeholder */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-2xl">
                📊
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  Reports
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-2">Bartender Quick Guide</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>View current bar stock levels and low stock alerts</li>
                <li>Record stock deductions when serving drinks</li>
                <li>Track transfers received from the main store</li>
                <li>Search products by name or scan barcodes for quick access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
