"use client";

const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

type SupplierType = "FOOD" | "SOFT_DRINKS" | "ALCOHOL" | "GENERAL";

type CreateSupplierPayload = {
  supplier_name: string;
  supplier_type: SupplierType;
  contact_person?: string;
  phone?: string;
  email?: string;
  physical_address?: string;
};

async function createSupplier(payload: CreateSupplierPayload) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to create supplier: ${res.status} ${text}`);
  }

  return res.json();
}

export default function AdminSuppliersNewPage() {
  // Server actions are embedded in this file for simplicity.
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create supplier</h1>
          <Link
            href="/admin/suppliers"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            ← Back to list
          </Link>
        </div>

        <form
          className="mt-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const payload: CreateSupplierPayload = {
              supplier_name: String(formData.get("supplier_name") ?? "").trim(),
              supplier_type: String(formData.get("supplier_type") ?? "") as SupplierType,
              contact_person: String(formData.get("contact_person") ?? "").trim() || undefined,
              phone: String(formData.get("phone") ?? "").trim() || undefined,
              email: String(formData.get("email") ?? "").trim() || undefined,
              physical_address: String(formData.get("physical_address") ?? "").trim() || undefined,
            };

            try {
              await createSupplier(payload);
              window.location.href = "/admin/suppliers";
            } catch (error) {
              alert(error instanceof Error ? error.message : "Failed to create supplier");
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Supplier name *</label>
              <input
                name="supplier_name"
                required
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="e.g. Valley Foods"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Supplier type *</label>
              <select
                name="supplier_type"
                required
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              >
                <option value="FOOD">FOOD</option>
                <option value="SOFT_DRINKS">SOFT_DRINKS</option>
                <option value="ALCOHOL">ALCOHOL</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Contact person</label>
              <input
                name="contact_person"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
              <input
                name="phone"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input
                type="email"
                name="email"
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Physical address</label>
              <textarea
                name="physical_address"
                rows={3}
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"

              onClick={() => {
                window.location.href = "/admin/suppliers";
              }}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Create
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          * Required fields. Supplier creation uses the existing API endpoint: <code>/suppliers</code>.
        </p>
      </div>
    </div>
  );
}

