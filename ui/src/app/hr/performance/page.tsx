import { PerformanceTabs } from "@/components/hr/PerformanceTabs";
import { PerformanceManagementHub } from "@/components/hr/PerformanceManagementHub";

export default function PerformancePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PerformanceTabs />
      <PerformanceManagementHub />
    </main>
  );
}
