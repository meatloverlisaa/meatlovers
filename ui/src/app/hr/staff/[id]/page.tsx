import { EmployeeProfile } from "@/components/hr/EmployeeProfile";

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeProfile id={id} />;
}
