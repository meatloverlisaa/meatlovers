"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/auth";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
};

export default function RoleGuard({ allowedRoles, children, redirectTo }: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const checkAccess = useCallback(async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const authHeaders = getAuthHeader();

      if (!authHeaders.Authorization) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: authHeaders,
      });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      // Check if user's role is in the allowed roles
      if (allowedRoles.includes(data.role)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        // Redirect to their correct profile page based on role
        const roleToPath: Record<string, string> = {
          CHEF: "/kitchen/profile",
          BARMAN: "/bar/profile",
          HR: "/hr/profile",
          ADMIN: "/admin/profile",
          SUPER_ADMIN: "/super-admin/profile",
          ACCOUNTANT: "/accountant/profile",
          STOREKEEPER: "/storekeeper/profile",
          MANAGER: "/manager/profile",
          WAITER: "/pos/profile",
          CASHIER: "/cashier/profile",
          DISPATCHER: "/dispatcher/profile",
        };

        const correctPath = roleToPath[data.role] || redirectTo || "/profile";
        router.push(correctPath);
      }
    } catch (error) {
      console.error("Access check error:", error);
      router.push("/login");
    }
  }, [allowedRoles, redirectTo, router]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Show loading state while checking
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if role doesn't match
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You don&apos;t have permission to view this page. Redirecting to your profile...
          </p>
        </div>
      </div>
    );
  }

  // User is authorized, show the page
  return <>{children}</>;
}
