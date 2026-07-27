import { HRAnalyticsTabs } from "@/components/hr/HRAnalyticsTabs";
import { HRAnalyticsHub } from "@/components/hr/HRAnalyticsHub";

export default function AnalyticsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HRAnalyticsTabs />
      <HRAnalyticsHub />
    </main>
  );
}
