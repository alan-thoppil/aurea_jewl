"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Login is disabled — redirect directly to admin dashboard.
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return null;
}
