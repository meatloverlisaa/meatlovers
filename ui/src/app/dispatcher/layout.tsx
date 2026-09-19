"use client";

import { useAuth } from "@/contexts/AuthContext";

// ─── Dispatcher Layout Component ─────────────────────────────────────────────────
export default function DispatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="h-screen overflow-hidden bg-stone-50">
      {/* Page content - Full width, no sidebar */}
      <main className="h-full overflow-y-auto">{children}</main>
    </div>
  );
}
