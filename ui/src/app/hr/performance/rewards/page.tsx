import { PerformanceTabs } from "@/components/hr/PerformanceTabs";
import { RewardsRecognition } from "@/components/hr/RewardsRecognition";

export default function RewardsRecognitionPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PerformanceTabs />
      <RewardsRecognition />
    </main>
  );
}
