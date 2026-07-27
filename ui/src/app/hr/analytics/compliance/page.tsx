import { HRAnalyticsTabs } from "@/components/hr/HRAnalyticsTabs";
import { ComplianceReports } from "@/components/hr/ComplianceReports";

export default function ComplianceReportsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HRAnalyticsTabs />
      <ComplianceReports />
    </main>
  );
}
