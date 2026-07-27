import { TrainingTabs } from "@/components/hr/TrainingTabs";
import { TrainingTracking } from "@/components/hr/TrainingTracking";

export default function TrainingTrackingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TrainingTabs />
      <TrainingTracking />
    </main>
  );
}
