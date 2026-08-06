import { Suspense } from "react";
import { StaffDirectory } from "@/components/hr/StaffDirectory";

export default function StaffDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-zinc-500">Loading directory...</div>}>
      <StaffDirectory />
    </Suspense>
  );
}
