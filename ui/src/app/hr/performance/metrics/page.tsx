import { PerformanceTabs } from "@/components/hr/PerformanceTabs";
import { PerformanceMetrics } from "@/components/hr/PerformanceMetrics";

export default function PerformanceMetricsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PerformanceTabs />
      <PerformanceMetrics />
    </main>
  );
}
