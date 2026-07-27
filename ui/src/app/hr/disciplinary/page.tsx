import { DisciplinaryGrievanceTabs } from "@/components/hr/DisciplinaryGrievanceTabs";
import { DisciplinaryGrievanceHub } from "@/components/hr/DisciplinaryGrievanceHub";

export default function DisciplinaryPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DisciplinaryGrievanceTabs />
      <DisciplinaryGrievanceHub />
    </main>
  );
}
