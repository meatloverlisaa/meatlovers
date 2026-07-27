import { LeaveTabs } from "@/components/hr/LeaveTabs";

export default function LeaveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8"><LeaveTabs /></div>
    {children}
  </>;
}
