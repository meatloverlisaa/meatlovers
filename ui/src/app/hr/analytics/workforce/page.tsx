import { HRAnalyticsTabs } from "@/components/hr/HRAnalyticsTabs";
import { WorkforceAnalytics } from "@/components/hr/WorkforceAnalytics";

export default function WorkforceAnalyticsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HRAnalyticsTabs />
      <WorkforceAnalytics />
    </main>
  );
}
