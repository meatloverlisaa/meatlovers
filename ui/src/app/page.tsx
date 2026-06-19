import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-4xl">
        <h1 className="text-6xl font-bold text-white mb-4">
          Meat Lovers
        </h1>
        <p className="text-2xl text-red-100 mb-2">
          CIMS - Customer Information Management System
        </p>
        <p className="text-lg text-red-200 mb-12">
          Powered by YohPal
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link
            href="/admin"
            className="bg-white hover:bg-red-50 text-red-900 rounded-xl p-8 shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
            <p className="text-gray-600">
              Manage suppliers, products, inventory, pricing, and more
            </p>
          </Link>

          <Link
            href="/pos"
            className="bg-white hover:bg-red-50 text-red-900 rounded-xl p-8 shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-2">POS System</h2>
            <p className="text-gray-600">
              Point of Sale for orders, payments, and kitchen operations
            </p>
          </Link>
        </div>

        <div className="mt-16 text-red-200 text-sm">
          <p>Restaurant Management Solution</p>
        </div>
      </div>
    </div>
  );
}
