'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeader } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  notes: string;
}

interface Order {
  supplierId: string;
  supplierName: string;
  deliveryDate: string;
  notes: string;
  items: OrderItem[];
}

export default function SupplierOrderPage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER']);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [order, setOrder] = useState<Order>({
    supplierId: '',
    supplierName: '',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [],
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE}/suppliers`, {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order.supplierId || order.items.length === 0) {
      setError('Please select a supplier and add items');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          supplierId: order.supplierId,
          deliveryDate: order.deliveryDate,
          notes: order.notes,
          items: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
          })),
          createdBy: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/storekeeper/suppliers';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setOrder(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `item-${Date.now()}`,
        productId: '',
        productName: '',
        quantity: 0,
        unit: 'KG',
        unitPrice: 0,
        notes: '',
      }],
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totalAmount = order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <IconRenderer icon="cart" className="w-8 h-8" />
                New Supplier Order
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Create and submit a new purchase order to a supplier
              </p>
            </div>
            <Link
              href="/storekeeper/suppliers"
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Back to Suppliers
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <IconRenderer icon="error" className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
            <IconRenderer icon="check" className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Success!</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Order created successfully. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IconRenderer icon="document" className="w-5 h-5" />
              Order Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Supplier *
                </label>
                <select
                  value={order.supplierId}
                  onChange={(e) => {
                    const supplier = suppliers.find(s => s.id === e.target.value);
                    setOrder(prev => ({
                      ...prev,
                      supplierId: e.target.value,
                      supplierName: supplier?.name || '',
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  value={order.deliveryDate}
                  onChange={(e) => setOrder(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Notes
                </label>
                <textarea
                  value={order.notes}
                  onChange={(e) => setOrder(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Special instructions, delivery address, etc."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IconRenderer icon="package" className="w-5 h-5" />
                Order Items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Add Item
              </button>
            </div>

            {order.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No items added yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Product name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Unit
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option>KG</option>
                          <option>L</option>
                          <option>PCS</option>
                          <option>BOX</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Total
                        </label>
                        <div className="px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded">
                          {(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    KSh {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href="/storekeeper/suppliers"
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || order.items.length === 0 || !order.supplierId}
              className="px-6 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <IconRenderer icon="check" className="w-4 h-4" />
                  Create Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
