"use client";

import { useState } from "react";

type SupplierStatus = "ACTIVE" | "SUSPENDED";

interface SupplierStatusToggleProps {
  currentStatus: SupplierStatus;
  onToggle: (newStatus: SupplierStatus) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function SupplierStatusToggle({ 
  currentStatus, 
  onToggle, 
  disabled = false,
  loading = false 
}: SupplierStatusToggleProps) {
  const [confirming, setConfirming] = useState(false);

  const handleToggle = () => {
    if (confirming) {
      const newStatus: SupplierStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      onToggle(newStatus);
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            currentStatus === "ACTIVE"
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
          } disabled:opacity-50`}
        >
          {loading ? "..." : currentStatus === "ACTIVE" ? "Confirm Suspend" : "Confirm Activate"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
        currentStatus === "ACTIVE"
          ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
      } disabled:opacity-50`}
    >
      {loading ? "..." : currentStatus === "ACTIVE" ? "Suspend" : "Activate"}
    </button>
  );
}
