const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

type SupplierStatus = "ACTIVE" | "SUSPENDED";



type Supplier = {

  id: bigint | number;
  supplier_name: string;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  physical_address?: string | null;
  supplier_type: string;
  status: SupplierStatus;
  created_at?: string | null;
  updated_at?: string | null;
};

async function getSuppliers(): Promise<Supplier[]> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";


  const res = await fetch(`${baseUrl}/suppliers`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load suppliers: ${res.status}`);
  }

  return res.json();
}

async function toggleSupplierStatus(id: string, current: SupplierStatus): Promise<Supplier> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";


  const next: SupplierStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const res = await fetch(`${baseUrl}/suppliers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: next }),
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle supplier status: ${res.status}`);
  }

  return res.json();
}

export default async function AdminSuppliersPage() {
  let suppliers: Supplier[] = [];

  try {
    suppliers = await getSuppliers();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Suppliers</h1>
          <p className="mt-4 text-sm text-red-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Suppliers</h1>
          <Link
            href="/admin/suppliers/new"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            + Create supplier
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-zinc-600 dark:text-zinc-300">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {suppliers.map((s) => {
                  const id = typeof s.id === "bigint" ? s.id.toString() : String(s.id);
                  const statusColor = s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";

                  return (
                    <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">{s.supplier_name}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{s.supplier_type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <form
                          action={async () => {
                            "use server";
                            await toggleSupplierStatus(id, s.status);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                          >
                            Toggle status
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}

                {suppliers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-300" colSpan={5}>
                      No suppliers found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

