import { DisciplinaryGrievanceTabs } from "@/components/hr/DisciplinaryGrievanceTabs";
import { DisciplinaryActions } from "@/components/hr/DisciplinaryActions";

export default function DisciplinaryActionsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DisciplinaryGrievanceTabs />
      <DisciplinaryActions />
    </main>
  );
}
