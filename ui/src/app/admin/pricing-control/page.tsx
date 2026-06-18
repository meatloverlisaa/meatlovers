import React from "react";

const Link = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

type MarginAlertStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED";

type MarginAlert = {
  id: bigint | number;
  alert_status: MarginAlertStatus;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

async function getMarginAlerts(): Promise<MarginAlert[]> {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/margin-alerts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load margin alerts: ${res.status}`);
  }

  return res.json();
}

async function updateMarginAlert(id: string, payload: { alert_status: MarginAlertStatus; notes?: string }) {
  const baseUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/margin-alerts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to update margin alert: ${res.status} ${text}`);
  }

  return res.json();
}

type StatusChipProps = { status: MarginAlertStatus };

function StatusChip({ status }: StatusChipProps) {
  const color =
    status === "RESOLVED"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
      : status === "UNDER_REVIEW"
        ? "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200"
        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color}`}>{status}</span>
  );
}

export default async function AdminPricingControlPage() {
  let alerts: MarginAlert[] = [];

  try {
    alerts = await getMarginAlerts();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Pricing Control & Margin Alerts</h1>
          <p className="mt-4 text-sm text-red-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Pricing Control & Margin Alerts</h1>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            ← Back to Products
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="text-zinc-900 dark:text-zinc-50">Total alerts: <span className="font-semibold">{alerts.length}</span></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-zinc-600 dark:text-zinc-300">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {alerts.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-zinc-600 dark:text-zinc-300" colSpan={5}>
                      No margin alerts found.
                    </td>
                  </tr>
                ) : null}

                {alerts.map((a) => {
                  const id = typeof a.id === "bigint" ? a.id.toString() : String(a.id);

                  return (
                    <tr key={id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{id}</td>
                      <td className="px-4 py-3">
                        <StatusChip status={a.alert_status} />
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{a.notes ?? "-"}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{a.created_at ? new Date(a.created_at).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3">
                        <form
                          className="flex flex-col gap-2 sm:flex-row sm:items-center"
                          action={async (formData) => {
                            "use server";

                            const alert_status = formData.get("alert_status") as MarginAlertStatus;
                            const notes = String(formData.get("notes") ?? "").trim();

                            await updateMarginAlert(id, {
                              alert_status,
                              notes: notes.length ? notes : undefined,
                            });

                            if (typeof window !== "undefined") {
                              window.location.reload();
                            }
                          }}
                        >
                          <select
                            name="alert_status"
                            defaultValue={a.alert_status}
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>
                          <input
                            name="notes"
                            defaultValue={a.notes ?? ""}
                            placeholder="Update notes"
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

