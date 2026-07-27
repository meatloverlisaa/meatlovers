import { PayrollTabs } from "@/components/hr/PayrollTabs";

export default function PayrollLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <PayrollTabs />
      </div>
      {children}
    </>
  );
}
