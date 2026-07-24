import { EmployeeProfile } from "@/components/hr/EmployeeProfile";

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  return <EmployeeProfile id={params.id} />;
}
