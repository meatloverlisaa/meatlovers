// BarSalesSummary Component - Sales metrics and revenue data

'use client';

interface BarSale {
  orderId: string;
  table: { tableName: string };
  totalAmount: number;
  softDrinkAmount: number;
  alcoholAmount: number;
  status: string;
  createdAt: string;
}

interface BarSalesData {
  totalOrders: number;
  totalAmount: number;
  softDrinkSales: number;
  alcoholSales: number;
  orders: BarSale[];
}

interface BarSalesSummaryProps {
  salesData: BarSalesData | null;
  isLoading?: boolean;
}

const formatCurrency = (amount: number): string => {
  return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function BarSalesSummary({ salesData, isLoading }: BarSalesSummaryProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-zinc-100 rounded"></div>
            <div className="h-24 bg-zinc-100 rounded"></div>
            <div className="h-24 bg-zinc-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">Bar Sales Summary</h3>
        <p className="text-zinc-500 text-center py-8">No sales data available</p>
      </div>
    );
  }

  const softDrinkPercentage = salesData.totalAmount > 0 
    ? (salesData.softDrinkSales / salesData.totalAmount) * 100 
    : 0;
  const alcoholPercentage = salesData.totalAmount > 0 
    ? (salesData.alcoholSales / salesData.totalAmount) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <h3 className="text-lg font-bold text-zinc-900 mb-4">Bar Sales Summary</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-semibold mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(salesData.totalAmount)}</p>
          <p className="text-xs text-green-600 mt-1">{salesData.totalOrders} orders</p>
        </div>

        {/* Soft Drinks */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-semibold mb-1">Soft Drinks</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(salesData.softDrinkSales)}</p>
          <p className="text-xs text-blue-600 mt-1">{softDrinkPercentage.toFixed(1)}% of total</p>
        </div>

        {/* Alcoholic Drinks */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-semibold mb-1">Alcoholic Drinks</p>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(salesData.alcoholSales)}</p>
          <p className="text-xs text-purple-600 mt-1">{alcoholPercentage.toFixed(1)}% of total</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-700 font-semibold mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold text-amber-900">
            {formatCurrency(salesData.totalOrders > 0 ? salesData.totalAmount / salesData.totalOrders : 0)}
          </p>
          <p className="text-xs text-amber-600 mt-1">Per order</p>
        </div>
      </div>

      {/* Sales Breakdown Chart */}
      <div className="mt-4">
        <p className="text-sm font-semibold text-zinc-700 mb-2">Revenue Breakdown</p>
        <div className="flex h-6 rounded-lg overflow-hidden">
          <div 
            className="bg-blue-500 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${softDrinkPercentage}%` }}
          >
            {softDrinkPercentage > 10 && `${softDrinkPercentage.toFixed(0)}%`}
          </div>
          <div 
            className="bg-purple-500 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${alcoholPercentage}%` }}
          >
            {alcoholPercentage > 10 && `${alcoholPercentage.toFixed(0)}%`}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-600">
          <span>🥤 Soft Drinks</span>
          <span>🍺 Alcoholic Drinks</span>
        </div>
      </div>
    </div>
  );
}
