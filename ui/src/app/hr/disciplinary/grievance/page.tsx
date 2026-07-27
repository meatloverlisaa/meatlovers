import { DisciplinaryGrievanceTabs } from "@/components/hr/DisciplinaryGrievanceTabs";
import { GrievanceHandling } from "@/components/hr/GrievanceHandling";

export default function GrievanceHandlingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DisciplinaryGrievanceTabs />
      <GrievanceHandling />
    </main>
  );
}
