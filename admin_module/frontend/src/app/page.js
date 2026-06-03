"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Since this is the admin-only panel, redirect the root path to the admin dashboard
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-2xl font-serif tracking-[0.25em] font-light uppercase text-white">
          JEWEL<span className="text-gold-500 font-semibold">PRO</span>
        </span>
        <div className="h-1 w-12 bg-gold-500"></div>
        <p className="text-xs text-white/50 tracking-widest uppercase animate-pulse">
          Loading ERP admin portal...
        </p>
      </div>
    </div>
  );
}
