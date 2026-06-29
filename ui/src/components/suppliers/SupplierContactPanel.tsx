"use client";

import { SupplierStatusBadge } from "./SupplierStatusBadge";

type SupplierStatus = "ACTIVE" | "SUSPENDED";
type SupplierType = "FOOD" | "SOFT_DRINKS" | "ALCOHOL" | "GENERAL";

type Supplier = {
  id: bigint | number;
  supplier_name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  physical_address?: string | null;
  supplier_type: SupplierType;
  status: SupplierStatus;
  created_at?: string | null;
  updated_at?: string | null;
};

type Props = {
  supplier: Supplier | null;
};

const supplierTypeLabels: Record<SupplierType, string> = {
  FOOD: "Food",
  SOFT_DRINKS: "Soft Drinks",
  ALCOHOL: "Alcohol",
  GENERAL: "General Supplies",
};

export function SupplierContactPanel({ supplier }: Props) {
  if (!supplier) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          Select a supplier to view contact details
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {supplier.supplier_name}
        </h2>
        <div className="mt-2">
          <SupplierStatusBadge status={supplier.status} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Contact Person */}
        <div>
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
            Contact Person
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {supplier.contact_person || "Not provided"}
          </dd>
        </div>

        {/* Phone */}
        <div>
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
            Phone
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {supplier.phone ? (
              <a
                href={`tel:${supplier.phone}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {supplier.phone}
              </a>
            ) : (
              "Not provided"
            )}
          </dd>
        </div>

        {/* Email */}
        <div>
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
            Email
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {supplier.email ? (
              <a
                href={`mailto:${supplier.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {supplier.email}
              </a>
            ) : (
              "Not provided"
            )}
          </dd>
        </div>

        {/* Physical Address */}
        <div>
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
            Physical Address
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {supplier.physical_address || "Not provided"}
          </dd>
        </div>

        {/* Supplier Type */}
        <div>
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
            Supplier Type
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {supplierTypeLabels[supplier.supplier_type]}
          </dd>
        </div>

        {/* Registration Date */}
        {supplier.created_at && (
          <div>
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">
              Registered
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {new Date(supplier.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
        )}
      </div>
    </div>
  );
}
