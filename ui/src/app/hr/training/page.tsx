import { TrainingTabs } from "@/components/hr/TrainingTabs";
import { TrainingManagementHub } from "@/components/hr/TrainingManagementHub";

export default function TrainingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TrainingTabs />
      <TrainingManagementHub />
    </main>
  );
}
