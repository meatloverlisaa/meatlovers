'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeader } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReceivingItem {
  id: string;
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
  condition: 'GOOD' | 'DAMAGED' | 'EXPIRED' | 'PARTIAL';
  notes: string;
}

interface ReceivingRecord {
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  deliveryDate: string;
  items: ReceivingItem[];
}

export default function NewReceivingPage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER']);
  const { user } = useAuth();

  const [step, setStep] = useState<'select' | 'details' | 'items' | 'confirm'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [receiving, setReceiving] = useState<ReceivingRecord>({
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    items: [],
  });

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiving.supplierId || receiving.items.length === 0) {
      setError('Please complete all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/stock/receiving`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          supplierId: receiving.supplierId,
          invoiceNumber: receiving.invoiceNumber,
          deliveryDate: receiving.deliveryDate,
          items: receiving.items.map(item => ({
            productId: item.productId,
            quantityReceived: item.quantityReceived,
            condition: item.condition,
            notes: item.notes,
          })),
          receivedBy: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record receiving');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/storekeeper';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setReceiving(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `item-${Date.now()}`,
        productId: '',
        productName: '',
        quantityOrdered: 0,
        quantityReceived: 0,
        unit: 'KG',
        condition: 'GOOD',
        notes: '',
      }],
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setReceiving(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setReceiving(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <IconRenderer icon="inbox" className="w-8 h-8" />
                New Delivery Receiving
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Record incoming supplier deliveries and stock movements
              </p>
            </div>
            <Link
              href="/storekeeper"
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Back to Dashboard
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
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Delivery recorded successfully. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IconRenderer icon="building" className="w-5 h-5" />
              Supplier Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Supplier *
                </label>
                <input
                  type="text"
                  value={receiving.supplierName}
                  onChange={(e) => setReceiving(prev => ({ ...prev, supplierName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={receiving.invoiceNumber}
                  onChange={(e) => setReceiving(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  placeholder="INV-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  value={receiving.deliveryDate}
                  onChange={(e) => setReceiving(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <IconRenderer icon="package" className="w-5 h-5" />
                Received Items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 text-sm font-semibold bg-red-700 hover:bg-red-700 text-white rounded-lg transition"
              >
                Add Item
              </button>
            </div>

            {receiving.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No items added yet. Click "Add Item" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receiving.items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                          Qty Received
                        </label>
                        <input
                          type="number"
                          value={item.quantityReceived}
                          onChange={(e) => updateItem(index, 'quantityReceived', parseInt(e.target.value))}
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
                          Condition
                        </label>
                        <select
                          value={item.condition}
                          onChange={(e) => updateItem(index, 'condition', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="GOOD">Good</option>
                          <option value="DAMAGED">Damaged</option>
                          <option value="EXPIRED">Expired</option>
                          <option value="PARTIAL">Partial</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Any additional notes..."
                        rows={2}
                      />
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href="/storekeeper"
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || receiving.items.length === 0}
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
                  Record Receiving
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
