import { PerformanceTabs } from "@/components/hr/PerformanceTabs";
import { PerformanceReviews } from "@/components/hr/PerformanceReviews";

export default function PerformanceReviewsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PerformanceTabs />
      <PerformanceReviews />
    </main>
  );
}
