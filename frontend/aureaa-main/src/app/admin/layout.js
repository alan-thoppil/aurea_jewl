"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Users,
  Sparkles,
  FileText,
  Scale,
  Wrench,
  Settings,
  ArrowLeftRight,
  TrendingUp,
  BarChart2,
  Menu,
  X,
  Home
} from "lucide-react";
import { useAppState } from "@/context/StateContext";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { liveGoldPrice24K } = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "POS Billing", path: "/admin/pos", icon: ShoppingBag },
    { name: "Inventory", path: "/admin/inventory", icon: Boxes },
    { name: "CRM Customers", path: "/admin/crm", icon: Users },
    { name: "Gold Scheme", path: "/admin/gold-scheme", icon: Sparkles },
    { name: "GST Reports", path: "/admin/gst", icon: FileText },
    { name: "Accounting Ledger", path: "/admin/ledger", icon: Scale },
    { name: "Repair Jobs", path: "/admin/repairs", icon: Wrench },
    { name: "Analytics", path: "/admin/reports", icon: BarChart2 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col font-sans">
      
      {/* ERP Top Header bar */}
      <header className="h-16 border-b border-gold-500/15 bg-black/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-gold-500 hover:bg-gold-500/10 cursor-pointer"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-serif tracking-[0.2em] font-light uppercase text-white">
              JEWEL<span className="gold-text-gradient font-semibold">PRO</span>
            </span>
            <span className="text-[10px] text-gold-500/80 tracking-widest uppercase border border-gold-500/25 px-2 py-0.5 ml-2 hidden sm:inline-block">
              ERP ENTERPRISE v1.2
            </span>
          </Link>
        </div>

        {/* Live dynamic gold ticker inside ERP top header */}
        <div className="flex items-center gap-6 text-xs font-light">
          <div className="hidden md:flex items-center gap-3 bg-zinc-950 px-4 py-1.5 border border-white/5">
            <div className="flex items-center gap-1.5 text-gold-300">
              <TrendingUp size={13} className="animate-pulse" />
              <span className="uppercase text-[9px] tracking-wider text-white/50">24K Gold Rate</span>
            </div>
            <span className="font-serif font-bold text-gold-500">
              ₹{liveGoldPrice24K.toLocaleString()}/g
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-zinc-950 px-4 py-1.5 border border-white/5">
            <div className="flex items-center gap-1.5 text-blue-300">
              <TrendingUp size={13} />
              <span className="uppercase text-[9px] tracking-wider text-white/50">PT950 Platinum</span>
            </div>
            <span className="font-serif font-bold text-blue-400">
              ₹3,450.00/g
            </span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/60 hover:text-white uppercase border border-white/10 px-3 py-1.5 bg-white/5 transition-all"
          >
            <Home size={12} />
            Storefront
          </Link>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Left Sidebar Menu */}
        <aside
          className={`w-64 border-r border-gold-500/10 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 shrink-0 transition-transform duration-300 z-20 md:translate-x-0 absolute md:relative top-0 bottom-0 left-0 h-full ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="text-[10px] text-white/30 tracking-widest uppercase pl-3 mb-2">
              ERP Navigation
            </div>
            {menuItems.map((item) => {
              const active = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs tracking-widest uppercase transition-all duration-200 border ${
                    active
                      ? "border-gold-500/40 bg-gold-500/5 text-gold-300 font-semibold"
                      : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} className={active ? "text-gold-300" : "text-white/40"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer Metadata */}
          <div className="p-3 bg-zinc-950/60 border border-white/5 text-[9px] text-white/30 flex flex-col gap-1 tracking-wider uppercase">
            <div>Terminal IP: Localhost</div>
            <div>Secure HTTPS Tunnels</div>
            <div>DB Sync: Connected</div>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-10"
          />
        )}

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-full bg-[#0E0E0E] relative min-w-0">
          
          {/* Subtle Ambient Radial Light behind dashboard content */}
          <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-gold-500/2 blur-[80px] pointer-events-none"></div>

          {children}
        </main>
      </div>
    </div>
  );
}
