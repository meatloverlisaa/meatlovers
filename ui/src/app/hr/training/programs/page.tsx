import { TrainingTabs } from "@/components/hr/TrainingTabs";
import { TrainingPrograms } from "@/components/hr/TrainingPrograms";

export default function TrainingProgramsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TrainingTabs />
      <TrainingPrograms />
    </main>
  );
}
