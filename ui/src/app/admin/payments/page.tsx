"use client";

import { useState, useEffect } from "react";

const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

type PaymentMethod = "CASH" | "MPESA" | "CARD";
type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

type Payment = {
  id: bigint | number;
  order_id: bigint | number;
  payment_method: PaymentMethod;
  amount: string;
  transaction_reference?: string | null;
  payment_status: PaymentStatus;
  created_at?: string | null;
  updated_at?: string | null;
};

type Order = {
  id: bigint | number;
  table_id?: bigint | number;
  waiter_id?: bigint | number;
  status: string;
  total_amount: number;
  created_at?: string | null;
};

async function getPayments(): Promise<Payment[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/payments/settlement/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load payments: ${res.status}`);
  }

  const data = await res.json();
  return data.payments || [];
}

async function getOrders(): Promise<Order[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/orders/all?status=SERVED`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load orders: ${res.status}`);
  }

  return res.json();
}

async function createPayment(payload: any): Promise<Payment[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create payment: ${res.status} ${text}`);
  }

  return res.json();
}

async function generateReceipt(paymentId: string): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/payments/${paymentId}/receipt`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to generate receipt: ${res.status}`);
  }

  return res.json();
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [paymentsData, ordersData] = await Promise.all([
          getPayments(),
          getOrders(),
        ]);
        setPayments(paymentsData);
        setOrders(ordersData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
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
                  <p><strong>Amount Paid:</strong> $${currentReceipt.amount_paid.toFixed(2)}</p>
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
                          <td>$${item.unit_price.toFixed(2)}</td>
                          <td>$${item.line_total.toFixed(2)}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
                <div class="total">
                  <p>Total: $${currentReceipt.order_details.subtotal.toFixed(2)}</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Cashier Settlement</h1>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Cashier Settlement</h1>
          <p className="mt-4 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Cashier Settlement</h1>
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
                          Order #{id} - ${order.total_amount.toFixed(2)}
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
                    <option value="MPESA">MPESA</option>
                    <option value="CARD">CARD</option>
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

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-zinc-600 dark:text-zinc-300">
                  <th className="px-4 py-3 font-medium">Payment ID</th>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Transaction Ref</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payments.map((payment) => {
                  const id = typeof payment.id === "bigint" ? payment.id.toString() : String(payment.id);
                  const orderId = typeof payment.order_id === "bigint" ? payment.order_id.toString() : String(payment.order_id);
                  const statusColor = payment.payment_status === "SUCCESS" 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : payment.payment_status === "FAILED"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                    : payment.payment_status === "REFUNDED"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200";

                  return (
                    <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">#{id}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">#{orderId}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{payment.payment_method}</td>
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">${parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{payment.transaction_reference || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {payment.payment_status === "SUCCESS" && (
                          <button
                            type="button"
                            onClick={() => handleGenerateReceipt(id)}
                            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {payments.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={8}>
                      No payments found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {showReceipt && currentReceipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-950 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Receipt</h2>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ✕
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
                    <span className="text-zinc-900 dark:text-zinc-50 font-semibold">${currentReceipt.amount_paid.toFixed(2)}</span>
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
                        <span className="text-zinc-900 dark:text-zinc-50">${item.line_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-semibold">
                    <span className="text-zinc-900 dark:text-zinc-50">Total</span>
                    <span className="text-zinc-900 dark:text-zinc-50">${currentReceipt.order_details.subtotal.toFixed(2)}</span>
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
