"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";

type PaymentMethod = "CASH" | "M-PESA" | "CARD" | "BANK_TRANSFER";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

type Payment = {
  id: string | bigint | number;
  order_id: string | bigint | number;
  payment_method: PaymentMethod;
  amount: string;
  transaction_reference?: string | null;
  payment_status: PaymentStatus;
  created_at?: string | null;
  updated_at?: string | null;
  order?: {
    order_number: string;
    table_id: number;
  };
};

type Order = {
  id: string | bigint | number;
  table_id?: number;
  waiter_id?: number;
  status: string;
  total_amount: number;
  created_at?: string | null;
};

async function fetchPayments(): Promise<Payment[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const res = await fetch(`${API_BASE}/payments/settlement/summary`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch payments: ${res.status}`);
  }
  
  const data = await res.json();
  return data.payments || [];
}

async function fetchOrders(): Promise<Order[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const res = await fetch(`${API_BASE}/orders/all?status=SERVED`, { 
    cache: "no-store",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function createPayment(payload: any): Promise<Payment[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const res = await fetch(`${API_BASE}/payments/settle`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create payment: ${res.status} ${text}`);
  }

  return res.json();
}

async function generateReceipt(paymentId: string): Promise<any> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const res = await fetch(`${API_BASE}/payments/${paymentId}/receipt`, {
    cache: "no-store",
    headers: getAuthHeader(),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate receipt: ${res.status}`);
  }

  return res.json();
}

export default function CashierPaymentsPage() {
  useRequireAuth(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER']);
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [paymentsData, ordersData] = await Promise.all([
          fetchPayments(),
          fetchOrders(),
        ]);
        const sortedPayments = paymentsData.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
        setPayments(sortedPayments);
        setOrders(ordersData);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderId = formData.get("order_id");
    const paymentMethod = formData.get("payment_method") as PaymentMethod;
    const amount = parseFloat(formData.get("amount") as string);
    const transactionReference = formData.get("transaction_reference") as string;

    if (!orderId || !paymentMethod || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createPayment({
        order_id: Number(orderId),
        payments: [
          {
            payment_method: paymentMethod,
            amount: amount,
            transaction_reference: transactionReference || undefined,
          },
        ],
      });
      setShowPaymentForm(false);
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create payment");
    }
  };

  const handleGenerateReceipt = async (paymentId: string) => {
    try {
      const receipt = await generateReceipt(paymentId);
      setCurrentReceipt(receipt);
      setShowReceipt(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to generate receipt");
    }
  };

  const handlePrintReceipt = () => {
    if (currentReceipt) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${currentReceipt.receipt_number}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { margin: 0; }
                .details { margin-bottom: 20px; }
                .details p { margin: 5px 0; }
                .items { border-top: 1px solid #ccc; padding-top: 10px; margin-bottom: 20px; }
                .items table { width: 100%; border-collapse: collapse; }
                .items th, .items td { text-align: left; padding: 5px; border-bottom: 1px solid #eee; }
                .total { font-weight: bold; text-align: right; font-size: 18px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h1>MEAT LOVERS</h1>
                  <p>Receipt</p>
                </div>
                <div class="details">
                  <p><strong>Receipt Number:</strong> ${currentReceipt.receipt_number}</p>
                  <p><strong>Order ID:</strong> ${currentReceipt.order_id}</p>
                  <p><strong>Payment Method:</strong> ${currentReceipt.payment_method}</p>
                  <p><strong>Amount Paid:</strong> KES ${currentReceipt.amount_paid.toFixed(2)}</p>
                  <p><strong>Transaction Ref:</strong> ${currentReceipt.transaction_reference || "N/A"}</p>
                  <p><strong>Date:</strong> ${new Date(currentReceipt.payment_date).toLocaleString()}</p>
                </div>
                <div class="items">
                  <h3>Order Items</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${currentReceipt.order_details.items.map((item: any) => `
                        <tr>
                          <td>${item.product_name}</td>
                          <td>${item.quantity}</td>
                          <td>KES ${item.unit_price.toFixed(2)}</td>
                          <td>KES ${item.line_total.toFixed(2)}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
                <div class="total">
                  <p>Total: KES ${currentReceipt.order_details.subtotal.toFixed(2)}</p>
                </div>
                <div class="footer">
                  <p>Thank you for dining with us!</p>
                  <p>Powered by YohPal</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (!filter) return true;
    const query = filter.toLowerCase();
    return (
      payment.payment_method.toLowerCase().includes(query) ||
      payment.payment_status.toLowerCase().includes(query) ||
      payment.order?.order_number.toLowerCase().includes(query) ||
      String(payment.order?.table_id).includes(query)
    );
  });

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH": return "bg-green-100 text-green-800 border-green-200";
      case "M-PESA": return "bg-red-100 text-red-800 border-red-200";
      case "CARD": return "bg-red-100 text-red-800 border-red-200";
      case "BANK_TRANSFER": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "PENDING": return "bg-amber-100 text-amber-800 border-amber-200";
      case "FAILED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/cashier"
            className="rounded-xl border border-zinc-200 bg-white p-2 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Payment History</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              View all payment transactions
            </p>
          </div>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            {showPaymentForm ? "Cancel" : "+ Record Payment"}
          </button>
        </div>

        {showPaymentForm && (
          <div className="mt-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Record Payment</h2>
            <form onSubmit={handleCreatePayment}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Order *</label>
                  <select
                    name="order_id"
                    required
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    <option value="">Select an order</option>
                    {orders.filter(o => o.status === "SERVED").map((order) => {
                      const id = typeof order.id === "bigint" ? order.id.toString() : String(order.id);
                      return (
                        <option key={id} value={id}>
                          Order #{id} - KES {order.total_amount.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Payment Method *</label>
                  <select
                    name="payment_method"
                    required
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                  >
                    <option value="CASH">CASH</option>
                    <option value="M-PESA">M-PESA</option>
                    <option value="CARD">CARD</option>
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    step="0.01"
                    min="0.01"
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Transaction Reference</label>
                  <input
                    name="transaction_reference"
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                    placeholder="e.g. MPESA-12345"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <input
            type="text"
            placeholder="Search by payment method, status, order #..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <svg className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">No payments found</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {filter ? "Try adjusting your search filters" : "No payment transactions recorded yet"}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          #{payment.order?.order_number || String(payment.order_id).slice(-4)}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          Table {payment.order?.table_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          KES {parseFloat(payment.amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getPaymentMethodColor(payment.payment_method)}`}>
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor(payment.payment_status)}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          {payment.created_at ? new Date(payment.created_at).toLocaleTimeString() : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {payment.payment_status === "SUCCESS" && (
                          <button
                            type="button"
                            onClick={() => handleGenerateReceipt(String(payment.id))}
                            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showReceipt && currentReceipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Receipt</h2>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Close
                </button>
              </div>
              
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">MEAT LOVERS</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Receipt</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Receipt #:</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{currentReceipt.receipt_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Order ID:</span>
                    <span className="text-zinc-900 dark:text-zinc-50">#{currentReceipt.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Payment Method:</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{currentReceipt.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Amount Paid:</span>
                    <span className="text-zinc-900 dark:text-zinc-50 font-semibold">KES {currentReceipt.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Transaction Ref:</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{currentReceipt.transaction_reference || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Date:</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{new Date(currentReceipt.payment_date).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Order Items</h4>
                  <div className="space-y-1 text-sm">
                    {currentReceipt.order_details.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {item.product_name} x{item.quantity}
                        </span>
                        <span className="text-zinc-900 dark:text-zinc-50">KES {item.line_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-semibold">
                    <span className="text-zinc-900 dark:text-zinc-50">Total</span>
                    <span className="text-zinc-900 dark:text-zinc-50">KES {currentReceipt.order_details.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  <p>Thank you for dining with us!</p>
                  <p>Powered by YohPal</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
