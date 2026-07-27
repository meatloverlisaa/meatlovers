import { TrainingTabs } from "@/components/hr/TrainingTabs";
import { CareerDevelopment } from "@/components/hr/CareerDevelopment";

export default function CareerDevelopmentPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TrainingTabs />
      <CareerDevelopment />
    </main>
  );
}
