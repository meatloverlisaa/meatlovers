'use client';

import { useState } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CubeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

type ReportType = 
  | 'sales'
  | 'inventory'
  | 'financial'
  | 'orders'
  | 'employees'
  | 'customers'
  | 'products'
  | 'payroll';

interface ReportCard {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  available: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ReportsPage() {
  useRequireAuth(['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT', 'MANAGER']);

  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const reportCards: ReportCard[] = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Daily, weekly, and monthly sales performance analysis',
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-600 border-green-200',
      available: true,
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels, movement, and reorder requirements',
      icon: CubeIcon,
      color: 'bg-blue-100 text-blue-600 border-blue-200',
      available: true,
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'P&L statements, cash flow, and expense analysis',
      icon: DocumentTextIcon,
      color: 'bg-purple-100 text-purple-600 border-purple-200',
      available: true,
    },
    {
      id: 'orders',
      title: 'Orders Report',
      description: 'Order history, trends, and fulfillment metrics',
      icon: ShoppingCartIcon,
      color: 'bg-orange-100 text-orange-600 border-orange-200',
      available: true,
    },
    {
      id: 'employees',
      title: 'Employee Report',
      description: 'Staff attendance, performance, and payroll summaries',
      icon: UserGroupIcon,
      color: 'bg-pink-100 text-pink-600 border-pink-200',
      available: true,
    },
    {
      id: 'customers',
      title: 'Customer Report',
      description: 'Customer behavior, loyalty, and satisfaction metrics',
      icon: UserGroupIcon,
      color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      available: true,
    },
    {
      id: 'products',
      title: 'Product Performance',
      description: 'Best sellers, slow movers, and product analytics',
      icon: ChartBarIcon,
      color: 'bg-teal-100 text-teal-600 border-teal-200',
      available: true,
    },
    {
      id: 'payroll',
      title: 'Payroll Report',
      description: 'Salary payments, deductions, and payroll summaries',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      available: true,
    },
  ];

  const generateReport = async () => {
    if (!selectedReport) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Route to appropriate endpoint based on report type
      let endpoint = '';
      const queryParams = new URLSearchParams();

      if (dateFrom) queryParams.append('startDate', dateFrom);
      if (dateTo) queryParams.append('endDate', dateTo);

      switch (selectedReport) {
        case 'sales':
          endpoint = `/monitoring/pl-today?${queryParams}`;
          break;
        case 'inventory':
          endpoint = `/stock/summary?${queryParams}`;
          break;
        case 'financial':
          endpoint = `/finance-transactions/summary?${queryParams}`;
          break;
        case 'orders':
          endpoint = `/monitoring/orders?${queryParams}`;
          break;
        case 'employees':
          endpoint = `/hrm/employees/statistics?${queryParams}`;
          break;
        case 'payroll':
          endpoint = `/hrm/payroll/summary?${queryParams}`;
          break;
        default:
          throw new Error('Report type not implemented');
      }

      const response = await fetch(`${API_BASE}${endpoint}`, { headers });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      
      // For now, log the data (in production, this would trigger download)
      console.log('Report data:', data);
      alert('Report generated! Check console for data. Download feature coming soon.');

    } catch (error) {
      console.error('Report generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Set default dates (last 30 days)
  const setDefaultDates = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
  };

  const setThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  const setLastMonth = () => {
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    setDateFrom(firstDayLastMonth.toISOString().split('T')[0]);
    setDateTo(lastDayLastMonth.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3 text-blue-600" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Generate comprehensive business reports
            </p>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Report Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportCards.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                disabled={!report.available}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${selectedReport === report.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                  }
                  ${!report.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-3`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {report.description}
                </p>
                {!report.available && (
                  <span className="inline-block mt-2 text-xs text-gray-500">
                    Coming Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        {selectedReport && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Select Date Range
              </h2>
            </div>

            {/* Quick Date Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={setDefaultDates}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Last 30 Days
              </button>
              <button
                onClick={setThisMonth}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                This Month
              </button>
              <button
                onClick={setLastMonth}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Last Month
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Report Preview/Summary */}
        {selectedReport && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {reportCards.find(r => r.id === selectedReport)?.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {dateFrom && dateTo
                    ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
                    : 'Please select a date range'
                  }
                </p>
              </div>
            </div>

            {/* Report Details Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Report will include:
              </h3>
              <ul className="space-y-2">
                {selectedReport === 'sales' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Total revenue and profit margins
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Sales by category and product
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Payment method breakdown
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Daily sales trends and comparisons
                    </li>
                  </>
                )}
                {selectedReport === 'inventory' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Current stock levels by product
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Low stock and out-of-stock items
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Stock movement and turnover rates
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Reorder recommendations
                    </li>
                  </>
                )}
                {selectedReport === 'financial' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Income vs Expenses breakdown
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Cash flow statements
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Expense categories analysis
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Profit & Loss summary
                    </li>
                  </>
                )}
                {selectedReport === 'orders' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Order volume and trends
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Average order value
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Order status breakdown
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Fulfillment times and efficiency
                    </li>
                  </>
                )}
                {selectedReport === 'employees' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Attendance and punctuality records
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Department-wise headcount
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Leave requests and approvals
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Performance metrics summary
                    </li>
                  </>
                )}
                {selectedReport === 'payroll' && (
                  <>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Total payroll by department
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Salary breakdowns and deductions
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Payment status tracking
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Tax and statutory deductions
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Export Options */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Export Options
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={generateReport}
                  disabled={!dateFrom || !dateTo || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {loading ? 'Generating...' : 'Generate PDF'}
                </button>
                <button
                  onClick={generateReport}
                  disabled={!dateFrom || !dateTo || loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Excel
                </button>
                <button
                  onClick={generateReport}
                  disabled={!dateFrom || !dateTo || loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Report Generation Tips
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select a report type to get started</li>
                <li>• Choose a date range for the data you want to analyze</li>
                <li>• Use quick date buttons for common time periods</li>
                <li>• Reports can be exported in PDF, Excel, or CSV formats</li>
                <li>• Large date ranges may take longer to generate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
