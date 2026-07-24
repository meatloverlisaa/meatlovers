import { StaffManagementNav } from "@/components/hr/StaffManagementNav";

export default function HrLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <StaffManagementNav />
      {children}
    </div>
  );
}
