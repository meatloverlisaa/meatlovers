"use client";

import { useEffect, useState, useRef } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getAuthHeader } from "@/lib/auth";
import { IconRenderer } from "@/components/ui/IconRenderer";

type RiderStatus = "ACTIVE" | "ON_BREAK";
type OrderStep = "IDLE" | "PICKUP" | "EN_ROUTE" | "DELIVERY";
type PaymentMethod = "ONLINE" | "CASH";

type ActiveOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  items: Array<{ name: string; quantity: number; checked?: boolean }>;
  paymentMethod: PaymentMethod;
  cashAmount?: number;
};

export default function RiderDashboardPage() {
  useRequireAuth(["RIDER"]);
  
  // Shift tracking
  const [status, setStatus] = useState<RiderStatus>("ACTIVE");
  const [shiftStartTime] = useState(new Date(Date.now() - 4 * 60 * 60 * 1000 - 12 * 60 * 1000)); // 4h 12m ago
  const [shiftDuration, setShiftDuration] = useState("4 hrs 12 mins");
  const [cashHeld, setCashHeld] = useState(4500.00);
  
  // Rider info
  const [vehicleId] = useState("Bike #04");
  const [equipmentId] = useState("Thermal Bag #B");
  const [queuePosition] = useState(1);
  
  // Order state
  const [orderStep, setOrderStep] = useState<OrderStep>("IDLE");
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const swipeStartX = useRef(0);
  const swiping = useRef(false);

  // Demo active order
  const demoOrder: ActiveOrder = {
    id: "1",
    orderNumber: "ML-1042",
    customerName: "Jane Doe",
    deliveryAddress: "Apt 3B, Wood Avenue Towers, Kilimani",
    deliveryNotes: "Gate code is 2542. Leave with security if no answer",
    items: [
      { name: "2x Family Pizza Boxes", quantity: 2, checked: false },
      { name: "1x 2L Soda Bottle", quantity: 1, checked: false },
    ],
    paymentMethod: "CASH",
    cashAmount: 1850.00,
  };

  // Update shift timer
  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Date.now() - shiftStartTime.getTime();
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      setShiftDuration(`${hours} hrs ${minutes} mins`);
    }, 60000);
    return () => clearInterval(interval);
  }, [shiftStartTime]);

  // Simulate receiving order
  const simulateOrderAssignment = () => {
    setActiveOrder(demoOrder);
    setOrderStep("PICKUP");
  };

  // Handle item checkbox
  const handleItemCheck = (index: number) => {
    if (!activeOrder) return;
    const updatedItems = [...activeOrder.items];
    updatedItems[index].checked = !updatedItems[index].checked;
    setActiveOrder({ ...activeOrder, items: updatedItems });
  };

  // Check if all items are checked
  const allItemsChecked = activeOrder?.items.every((item) => item.checked) || false;

  // Handle swipe to confirm
  const handleSwipeStart = (e: React.TouchEvent | React.MouseEvent) => {
    swiping.current = true;
    swipeStartX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
  };

  const handleSwipeMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!swiping.current) return;
    const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - swipeStartX.current;
    const progress = Math.min(Math.max(diff / 200, 0), 1);
    setSwipeProgress(progress);
  };

  const handleSwipeEnd = () => {
    if (swipeProgress > 0.8) {
      handleStepComplete();
    }
    swiping.current = false;
    setSwipeProgress(0);
  };

  // Handle step completion
  const handleStepComplete = () => {
    if (orderStep === "PICKUP") {
      setOrderStep("EN_ROUTE");
    } else if (orderStep === "EN_ROUTE") {
      setOrderStep("DELIVERY");
    } else if (orderStep === "DELIVERY") {
      // Add cash if COD
      if (activeOrder?.paymentMethod === "CASH" && activeOrder.cashAmount) {
        setCashHeld((prev) => prev + activeOrder.cashAmount!);
      }
      // Complete delivery
      setOrderStep("IDLE");
      setActiveOrder(null);
      alert("Delivery completed! Returning to idle status.");
    }
  };

  // Open navigation
  const openNavigation = () => {
    if (activeOrder) {
      const address = encodeURIComponent(activeOrder.deliveryAddress);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
    }
  };

  // Call customer
  const callCustomer = () => {
    alert("Calling customer... (Integration with phone dialer)");
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      {/* Fixed Top Ribbon - Shift & Status Tracking */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm">
        <div className="px-4 py-3">
          {/* Status Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setStatus(status === "ACTIVE" ? "ON_BREAK" : "ACTIVE")}
                className={`relative w-16 h-8 rounded-full cursor-pointer transition-all duration-300 ${
                  status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${
                    status === "ACTIVE" ? "left-1" : "left-9"
                  }`}
                />
              </div>
              <div>
                <p className={`text-sm font-bold ${status === "ACTIVE" ? "text-emerald-600" : "text-red-600"}`}>
                  {status === "ACTIVE" ? "ACTIVE" : "ON BREAK"}
                </p>
                <p className="text-xs text-zinc-500">
                  {status === "ACTIVE" ? "Ready for orders" : "Clocked out"}
                </p>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-zinc-100">
              <IconRenderer icon="alert" className="h-5 w-5 text-zinc-600" />
            </button>
          </div>

          {/* Shift Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <IconRenderer icon="clock" className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-700">Shift Duration</p>
              </div>
              <p className="text-lg font-black text-blue-900">{shiftDuration}</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <IconRenderer icon="dollar" className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-700">Cash Held</p>
              </div>
              <p className="text-lg font-black text-amber-900">
                KES {cashHeld.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {orderStep === "IDLE" ? (
          // IDLE VIEW - Waiting for Orders
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Waiting Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <IconRenderer icon="check" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xl font-black">Waiting for Orders</p>
                  <p className="text-sm text-emerald-100">You are next in line for dispatch</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>Queue Position: #{queuePosition}</span>
              </div>
            </div>

            {/* Equipment Info */}
            <div className="rounded-xl bg-white border border-zinc-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-600 mb-3 uppercase tracking-wider">
                Assigned Equipment
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <IconRenderer icon="truck" className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">Vehicle</p>
                    <p className="text-lg font-black text-zinc-950">{vehicleId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <IconRenderer icon="chart" className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">Equipment</p>
                    <p className="text-lg font-black text-zinc-950">{equipmentId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Button */}
            <button
              onClick={simulateOrderAssignment}
              className="w-full rounded-xl bg-zinc-950 py-4 text-center font-bold text-white shadow-lg hover:bg-red-700 transition-all duration-300"
            >
              Simulate Order Assignment
            </button>
          </div>
        ) : orderStep === "PICKUP" ? (
          // STEP 1: Order Pickup (At the Counter)
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Header */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <IconRenderer icon="location" className="h-5 w-5 text-amber-600 animate-pulse" />
                <p className="text-sm font-bold text-amber-700 uppercase tracking-wider">
                  At Pickup Location
                </p>
              </div>
              <p className="text-xs text-amber-600">Collect items from kitchen counter</p>
            </div>

            {/* Kitchen Order ID */}
            <div className="rounded-2xl bg-gradient-to-r from-zinc-950 to-zinc-800 p-6 text-white shadow-xl">
              <p className="text-sm font-semibold text-zinc-400 mb-2">KITCHEN TICKET</p>
              <p className="text-5xl font-black tracking-tight">{activeOrder?.orderNumber}</p>
            </div>

            {/* Packing Checklist */}
            <div className="rounded-xl bg-white border border-zinc-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-600 mb-4 uppercase tracking-wider flex items-center gap-2">
                <IconRenderer icon="check" className="h-4 w-4" />
                Packing Checklist
              </h3>
              <div className="space-y-3">
                {activeOrder?.items.map((item, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleItemCheck(index)}
                      className="h-5 w-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={`flex-1 text-sm font-semibold ${item.checked ? "text-zinc-400 line-through" : "text-zinc-900"}`}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Departure Button */}
            <button
              onClick={handleStepComplete}
              disabled={!allItemsChecked}
              className="w-full rounded-xl bg-emerald-600 py-5 text-center text-lg font-black text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {allItemsChecked ? (
                <>
                  <IconRenderer icon="truck" className="inline h-5 w-5 mr-2" />
                  DEPART FROM RESTAURANT
                </>
              ) : (
                "Check all items to depart"
              )}
            </button>
          </div>
        ) : orderStep === "EN_ROUTE" ? (
          // STEP 2: En Route to Customer
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Header */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <IconRenderer icon="truck" className="h-5 w-5 text-blue-600 animate-pulse" />
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">
                  En Route to Customer
                </p>
              </div>
              <p className="text-xs text-blue-600">Delivering order {activeOrder?.orderNumber}</p>
            </div>

            {/* Customer Contact Card */}
            <div className="rounded-xl bg-white border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center">
                  <IconRenderer icon="user" className="h-6 w-6 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black text-zinc-950">{activeOrder?.customerName}</p>
                  <p className="text-sm text-zinc-500">Customer</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <IconRenderer icon="location" className="h-5 w-5 text-zinc-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-700">Delivery Address</p>
                    <p className="text-base font-bold text-zinc-950">{activeOrder?.deliveryAddress}</p>
                  </div>
                </div>

                {activeOrder?.deliveryNotes && (
                  <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <IconRenderer icon="alert" className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-700">Delivery Notes</p>
                      <p className="text-sm text-amber-900">{activeOrder.deliveryNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={openNavigation}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg hover:bg-blue-700 transition-all duration-300"
              >
                <IconRenderer icon="location" className="h-5 w-5" />
                Navigate
              </button>
              <button
                onClick={callCustomer}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg hover:bg-emerald-700 transition-all duration-300"
              >
                <IconRenderer icon="phone" className="h-5 w-5" />
                Call
              </button>
            </div>

            {/* Arrived Button */}
            <button
              onClick={handleStepComplete}
              className="w-full rounded-xl bg-zinc-950 py-5 text-center text-lg font-black text-white shadow-lg hover:bg-red-700 transition-all duration-300"
            >
              <IconRenderer icon="check" className="inline h-5 w-5 mr-2" />
              ARRIVED AT LOCATION
            </button>
          </div>
        ) : (
          // STEP 3: Payment & Completion
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Header */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <IconRenderer icon="check" className="h-5 w-5 text-emerald-600 animate-pulse" />
                <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                  At Delivery Location
                </p>
              </div>
              <p className="text-xs text-emerald-600">Complete delivery for {activeOrder?.orderNumber}</p>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl bg-white border border-zinc-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-600 mb-4 uppercase tracking-wider">
                Payment Method
              </h3>
              {activeOrder?.paymentMethod === "ONLINE" ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <IconRenderer icon="check" className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-lg font-black text-blue-900">PAID ONLINE / MPESA</p>
                    <p className="text-sm text-blue-700">No cash collection needed</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                  <IconRenderer icon="dollar" className="h-8 w-8 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700">CASH ON DELIVERY</p>
                    <p className="text-xs text-red-600 mb-2">Collect cash from customer</p>
                    <p className="text-3xl font-black text-red-900">
                      KES {activeOrder?.cashAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Swipe to Confirm */}
            <div className="relative">
              <div className="rounded-xl bg-zinc-100 p-2 overflow-hidden">
                <div
                  className="absolute inset-2 rounded-lg bg-emerald-500 transition-all duration-300"
                  style={{ width: `${swipeProgress * 100}%` }}
                />
                <div
                  className="relative h-16 rounded-lg bg-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                  onTouchStart={handleSwipeStart}
                  onTouchMove={handleSwipeMove}
                  onTouchEnd={handleSwipeEnd}
                  onMouseDown={handleSwipeStart}
                  onMouseMove={handleSwipeMove}
                  onMouseUp={handleSwipeEnd}
                  onMouseLeave={handleSwipeEnd}
                >
                  <p className="text-lg font-black text-zinc-600">
                    {swipeProgress > 0.5 ? "Release to Confirm" : ">>> SWIPE TO CONFIRM DELIVERY"}
                  </p>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-500 mt-2">
                Swipe right to complete delivery
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
