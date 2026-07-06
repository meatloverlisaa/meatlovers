"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffSuppliersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/accountant/suppliers");
  }, [router]);

  return null;
}
