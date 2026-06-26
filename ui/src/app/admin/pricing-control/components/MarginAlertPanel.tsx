import { useState } from "react";
import { MarginAlert, MarginAlertStatus } from "../page";

type MarginAlertPanelProps = {
  alerts: MarginAlert[];
  onUpdate: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function updateAlertStatus(id: string, status: MarginAlertStatus, notes?: string) {
  const res = await fetch(`${API_BASE_URL}/margin-alerts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alert_status: status, notes }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update alert: ${res.status}`);
  }

  return res.json();
}

export function MarginAlertPanel({ alerts, onUpdate }: MarginAlertPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<MarginAlertStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: MarginAlertStatus) => {
    setUpdatingId(id);
    
    try {
      await updateAlertStatus(id, newStatus);
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update alert status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAlerts = selectedFilter === "ALL" 
    ? alerts 
    : alerts.filter(a => a.alert_status === selectedFilter);

  const openCount = alerts.filter(a => a.alert_status === "OPEN").length;
  const reviewCount = alerts.filter(a => a.alert_status === "UNDER_REVIEW").length;
  const resolvedCount = alerts.filter(a => a.alert_status === "RESOLVED").length;

  const getStatusBadge = (status: MarginAlertStatus) => {
    switch (status) {
      case "OPEN":
        return {
          label: "Open",
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        };
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
        };
      case "RESOLVED":
        return {
          label: "Resolved",
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      default:
        return {
          label: status,
          color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200",
          icon: null,
        };
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">No margin alerts</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Great! All product margins are within acceptable thresholds.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedFilter("ALL")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedFilter === "ALL"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black"
              : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-900"
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setSelectedFilter("OPEN")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedFilter === "OPEN"
              ? "bg-red-600 text-white dark:bg-red-500"
              : "bg-white text-zinc-700 border border-red-200 hover:bg-red-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-red-800 dark:hover:bg-red-900/20"
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setSelectedFilter("UNDER_REVIEW")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedFilter === "UNDER_REVIEW"
              ? "bg-amber-600 text-white dark:bg-amber-500"
              : "bg-white text-zinc-700 border border-amber-200 hover:bg-amber-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-amber-800 dark:hover:bg-amber-900/20"
          }`}
        >
          Under Review ({reviewCount})
        </button>
        <button
          onClick={() => setSelectedFilter("RESOLVED")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedFilter === "RESOLVED"
              ? "bg-emerald-600 text-white dark:bg-emerald-500"
              : "bg-white text-zinc-700 border border-emerald-200 hover:bg-emerald-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No {selectedFilter.toLowerCase().replace(/_/g, " ")} alerts found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const id = typeof alert.id === "bigint" ? alert.id.toString() : String(alert.id);
            const statusBadge = getStatusBadge(alert.alert_status);
            const isUpdating = updatingId === id;

            return (
              <div
                key={id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Alert Header */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.color}`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Alert #{id}
                      </span>
                    </div>

                    {/* Alert Details */}
                    <div className="mt-3 space-y-2">
                      <div className="text-sm text-zinc-900 dark:text-zinc-50">
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                      {alert.updated_at !== alert.created_at && (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">Last Updated:</span>{" "}
                          {new Date(alert.updated_at).toLocaleString()}
                        </div>
                      )}
                      {alert.notes && (
                        <div className="rounded-md bg-zinc-50 dark:bg-zinc-900 p-3 mt-3">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="font-medium">Notes:</span> {alert.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {alert.alert_status === "OPEN" && (
                      <button
                        onClick={() => handleStatusChange(id, "UNDER_REVIEW")}
                        disabled={isUpdating}
                        className="rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 transition-colors whitespace-nowrap"
                      >
                        {isUpdating ? "Updating..." : "Review"}
                      </button>
                    )}
                    {alert.alert_status === "UNDER_REVIEW" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(id, "RESOLVED")}
                          disabled={isUpdating}
                          className="rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
                        >
                          {isUpdating ? "Updating..." : "Resolve"}
                        </button>
                        <button
                          onClick={() => handleStatusChange(id, "OPEN")}
                          disabled={isUpdating}
                          className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap"
                        >
                          {isUpdating ? "Updating..." : "Reopen"}
                        </button>
                      </>
                    )}
                    {alert.alert_status === "RESOLVED" && (
                      <button
                        onClick={() => handleStatusChange(id, "OPEN")}
                        disabled={isUpdating}
                        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                      >
                        {isUpdating ? "Updating..." : "Reopen"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
