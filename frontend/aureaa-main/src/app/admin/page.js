"use client";

import React from "react";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import {
  TrendingUp,
  Users,
  Wrench,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { products, customers, repairs, ledger, orders } = useAppState();

  // Compute KPIs
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.created_at.startsWith(today));
  const todaySalesVal = todayOrders.reduce((sum, o) => sum + o.total, 0);

  const activeCRMCount = customers.length;
  const pendingRepairsCount = repairs.filter((r) => r.status !== "Delivered").length;
  
  const treasuryBalance = ledger.length > 0 ? ledger[ledger.length - 1].running_balance : 0;
  const lowStockCount = products.filter((p) => p.stock_count <= 3).length;

  // Compute Donut Distribution categories
  const categoryCounts = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const categories = Object.keys(categoryCounts);
  const totalItems = products.length;

  // Let's create beautiful premium SVG charts!
  // Donut SVG parameters
  let cumulativePercent = 0;
  const donutSlices = categories.map((cat, idx) => {
    const count = categoryCounts[cat];
    const percent = count / totalItems;
    const colors = ["#AA851C", "#D4AF37", "#F5D06F", "#FFFFFF", "#888888"];
    const strokeColor = colors[idx % colors.length];

    const slice = {
      name: cat,
      count,
      percent: Math.round(percent * 100),
      color: strokeColor,
      offset: cumulativePercent * 314.16 // Circumference of radius 50 is 2 * pi * 50 = 314.16
    };
    cumulativePercent += percent;
    return slice;
  });

  // Recent transactions list
  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((p) => p.stock_count <= 3).slice(0, 4);

  return (
    <div className="flex flex-col gap-8 text-left animate-fadeIn">
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest uppercase text-white">Executive Desk</h1>
          <p className="text-xs text-white/50 tracking-wider uppercase mt-1">Real-time enterprise metrics & logistics overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/pos"
            className="flex items-center gap-1 px-4 py-2 text-xs tracking-widest font-semibold uppercase bg-gold-500 text-black hover:bg-gold-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
          >
            <ShoppingBag size={13} />
            POS Terminal
          </Link>
        </div>
      </div>

      {/* KPI CARDS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[
          {
            title: "Today's Bookings",
            value: `₹${todaySalesVal.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-gold-500",
            subtitle: `${todayOrders.length} active invoices`
          },
          {
            title: "CRM Customers",
            value: activeCRMCount,
            icon: Users,
            color: "text-blue-400",
            subtitle: "Registered profiles"
          },
          {
            title: "Active Repairs",
            value: pendingRepairsCount,
            icon: Wrench,
            color: "text-green-400",
            subtitle: "In-shop workshop jobs"
          },
          {
            title: "Treasury Valuation",
            value: `₹${treasuryBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            icon: DollarSign,
            color: "text-amber-500",
            subtitle: "Running credit audit"
          },
          {
            title: "Low Stock Items",
            value: lowStockCount,
            icon: AlertTriangle,
            color: lowStockCount > 0 ? "text-red-400" : "text-white/40",
            subtitle: "Stock count <= 3"
          }
        ].map((kpi, idx) => (
          <GlowCard key={idx} className="flex flex-col justify-between p-5 bg-zinc-950/60 border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest uppercase text-white/50 font-medium">
                {kpi.title}
              </span>
              <kpi.icon size={16} className={`${kpi.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="mt-4">
              <div className="text-xl font-serif font-bold text-white tracking-wide">
                {kpi.value}
              </div>
              <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">
                {kpi.subtitle}
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* DOUBLE SECTION CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Chart: Luxury SVG Sales Trajectory */}
        <div className="lg:col-span-8 glass-panel p-6 flex flex-col gap-6 bg-zinc-950/50">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold">
              Treasury Inflow Trajectory
            </h3>
            <span className="text-[9px] tracking-widest uppercase text-white/40 font-semibold bg-white/5 border border-white/10 px-2 py-0.5">
              Live Audits
            </span>
          </div>

          {/* Precision SVG Line Chart */}
          <div className="w-full h-64 relative flex items-center justify-center">
            <svg viewBox="0 0 700 240" className="w-full h-full">
              <defs>
                <linearGradient id="chart-gold-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Background coordinates */}
              <line x1="50" y1="40" x2="650" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="50" y1="90" x2="650" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="50" y1="140" x2="650" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="50" y1="190" x2="650" y2="190" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Chart Line Path */}
              {/* Data points represented: Jan (12m), Feb (13.5m), Mar (11.2m), Apr (14.2m), May (14.5m) */}
              <path
                d="M 50 190 L 170 170 L 290 185 L 410 135 L 530 117 L 650 90"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="4.5"
                strokeLinecap="round"
              />

              {/* Shimmer gradient fill under path */}
              <path
                d="M 50 190 L 170 170 L 290 185 L 410 135 L 530 117 L 650 90 L 650 200 L 50 200 Z"
                fill="url(#chart-gold-grad)"
              />

              {/* Data Dots and Interactive circles */}
              {[
                { x: 50, y: 190, val: "12.0M" },
                { x: 170, y: 170, val: "12.5M" },
                { x: 290, y: 185, val: "12.2M" },
                { x: 410, y: 135, val: "13.5M" },
                { x: 530, y: 117, val: "14.2M" },
                { x: 650, y: 90, val: "14.5M" }
              ].map((dot, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={dot.x} cy={dot.y} r="5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2.5" />
                  <text
                    x={dot.x}
                    y={dot.y - 12}
                    fill="#F5D06F"
                    fontSize="10"
                    fontFamily="serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {dot.val}
                  </text>
                </g>
              ))}

              {/* Axis Labels */}
              <text x="50" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" letterSpacing="1">JAN</text>
              <text x="170" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" letterSpacing="1">FEB</text>
              <text x="290" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" letterSpacing="1">MAR</text>
              <text x="410" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" letterSpacing="1">APR</text>
              <text x="530" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" letterSpacing="1">MAY</text>
              <text x="650" y="220" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle" letterSpacing="1">CURR</text>

              <text x="35" y="44" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">15.0M</text>
              <text x="35" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">14.0M</text>
              <text x="35" y="144" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">13.0M</text>
              <text x="35" y="194" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">12.0M</text>
            </svg>
          </div>
        </div>

        {/* Right Chart: Category Donut Split */}
        <div className="lg:col-span-4 glass-panel p-6 flex flex-col gap-6 bg-zinc-950/50">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold">
              Category Distribution
            </h3>
            <span className="text-[10px] text-white/40 font-semibold">{totalItems} Unique SKUs</span>
          </div>

          {/* SVG Donut Circle */}
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-40 h-40 relative flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full rotate-[-90deg]">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                {donutSlices.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="12"
                    strokeDasharray="314.16"
                    strokeDashoffset={314.16 - (slice.percent * 314.16) / 100}
                    transform={`rotate(${(slice.offset / 314.16) * 360} 60 60)`}
                    className="hover:stroke-[15px] transition-all duration-300"
                  />
                ))}
              </svg>
              {/* Inner overlay details */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs text-white/40 uppercase tracking-widest">Active</span>
                <span className="text-xl font-serif font-bold text-white">{totalItems} Pieces</span>
              </div>
            </div>

            {/* Custom Legends list */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs font-light text-white/70">
              {donutSlices.map((slice, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: slice.color }}></span>
                  <span className="truncate">{slice.name}</span>
                  <span className="ml-auto font-serif text-[10px] text-white/40">({slice.percent}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* DOUBLE ROWS LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Orders list */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col gap-4 bg-zinc-950/40">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold">
              Recent Transactions
            </h3>
            <Link
              href="/admin/ledger"
              className="text-[10px] text-gold-500 hover:text-gold-300 uppercase tracking-widest flex items-center gap-1 font-semibold"
            >
              Audit ledger
              <ArrowUpRight size={10} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/30 uppercase tracking-widest">
              No recent sale transaction records found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between p-3.5 bg-zinc-950 border border-white/5 text-xs hover:border-gold-500/20 transition-colors"
                >
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-serif font-bold text-white tracking-wide">
                      {ord.order_number}
                    </span>
                    <span className="text-[10px] text-white/40 font-medium">
                      {ord.customer_name} • {ord.payment_method}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-serif text-gold-300 font-bold">
                      ₹{ord.total.toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-green-400 font-semibold flex items-center gap-1">
                      <ShieldCheck size={10} />
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Inventory Stock alerts */}
        <div className="lg:col-span-5 glass-panel p-6 flex flex-col gap-4 bg-zinc-950/40">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold">
              Critical Stock Warnings
            </h3>
            <Link
              href="/admin/inventory"
              className="text-[10px] text-gold-500 hover:text-gold-300 uppercase tracking-widest flex items-center gap-1 font-semibold"
            >
              Restock
              <ArrowUpRight size={10} />
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/30 uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-green-400" />
              All inventory levels fully stocked.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.sku}
                  className="flex items-center justify-between p-3.5 bg-zinc-950 border border-white/5 text-xs"
                >
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-serif text-white font-medium line-clamp-1">{p.name}</span>
                    <span className="text-[10px] text-white/40">{p.sku} • {p.metal}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-950/30 px-2 py-0.5 border border-red-500/20">
                      {p.stock_count} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
