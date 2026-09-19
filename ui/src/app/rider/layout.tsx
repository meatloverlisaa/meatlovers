"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function RiderLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useRequireAuth(["RIDER"]);
  const isLoginPage = pathname === "/rider/login";

  if (isLoginPage) return <>{children}</>;

  if (isLoading || !user || user.role !== "RIDER") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-red-500" />
          <p className="mt-4 text-sm font-semibold text-zinc-300">Checking rider access...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}