"use client";

type SupplierStatus = "ACTIVE" | "SUSPENDED";

type Props = {
  status: SupplierStatus;
};

export function SupplierStatusBadge({ status }: Props) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {status}
    </span>
  );
}
