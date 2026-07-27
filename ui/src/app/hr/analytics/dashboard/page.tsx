import { HRAnalyticsTabs } from "@/components/hr/HRAnalyticsTabs";
import { DashboardMetrics } from "@/components/hr/DashboardMetrics";

export default function DashboardMetricsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HRAnalyticsTabs />
      <DashboardMetrics />
    </main>
  );
}
