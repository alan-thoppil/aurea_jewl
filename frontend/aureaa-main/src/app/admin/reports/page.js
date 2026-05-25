"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import {
  BarChart2,
  TrendingUp,
  Download,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Gem,
  Layers
} from "lucide-react";

export default function ReportsPage() {
  const { orders, products, customers, ledger } = useAppState();
  const [reportPeriod, setReportPeriod] = useState("all");

  // === Period Filter ===
  const now = new Date();
  const filterOrder = (order) => {
    const d = new Date(order.created_at);
    if (reportPeriod === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (reportPeriod === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (reportPeriod === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true; // "all"
  };

  const filteredOrders = orders.filter(filterOrder);

  // === KPI Computations ===
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalGST = filteredOrders.reduce((sum, o) => sum + (o.gst || 0), 0);
  const totalMaking = filteredOrders.reduce((sum, o) => sum + (o.making_charges || 0), 0);
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  // === Category Sales Breakdown ===
  const categorySales = {};
  filteredOrders.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        const product = products.find((p) => p.sku === item.sku);
        const cat = product?.category || "Other";
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      });
    }
  });

  const categoryEntries = Object.entries(categorySales).sort((a, b) => b[1] - a[1]);
  const maxCatSales = categoryEntries.length > 0 ? Math.max(...categoryEntries.map(([, v]) => v)) : 1;

  // === Payment Method Split ===
  const paymentSplit = {};
  filteredOrders.forEach((order) => {
    const method = order.payment_method || "Other";
    paymentSplit[method] = (paymentSplit[method] || 0) + 1;
  });

  // === Top Products by Revenue ===
  const productRevMap = {};
  filteredOrders.forEach((order) => {
    if (order.items) {
      order.items.forEach((item) => {
        productRevMap[item.sku] = (productRevMap[item.sku] || 0) + (item.price * item.quantity);
      });
    }
  });

  const topProducts = Object.entries(productRevMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sku, rev]) => {
      const product = products.find((p) => p.sku === sku);
      return { sku, name: product?.name || sku, rev, category: product?.category || "" };
    });

  // === Monthly Revenue SVG Bar Chart Data (last 6 months) ===
  const monthlyMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(1);
    d.setMonth(now.getMonth() - i);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyMap[key] = 0;
  }

  orders.forEach((order) => {
    const d = new Date(order.created_at);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (key in monthlyMap) {
      monthlyMap[key] += order.total || 0;
    }
  });

  const monthlyEntries = Object.entries(monthlyMap);
  const maxMonthlyRev = Math.max(...monthlyEntries.map(([, v]) => v), 1);

  // === CSV Export ===
  const handleExportCSV = () => {
    const headers = "Order No,Date,Customer,Revenue (₹),GST (₹),Payment Method\n";
    const rows = filteredOrders.map((o) => {
      const date = new Date(o.created_at).toLocaleDateString("en-IN");
      return `"${o.order_number}","${date}","${o.customer_name}",${o.total.toFixed(2)},${o.gst.toFixed(2)},"${o.payment_method}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // eslint-disable-next-line react-hooks/purity
    link.download = `AUREA_Report_${reportPeriod}_${Date.now()}.csv`;
    link.click();
  };

  const periodLabels = { all: "All Time", today: "Today", week: "Last 7 Days", month: "This Month" };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-500/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif tracking-[0.15em] uppercase gold-text-gradient font-light">
            Analytics Reports
          </h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-1">
            Business intelligence — revenue, trends & performance data
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="flex gap-1 bg-zinc-950 border border-white/5 p-1">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setReportPeriod(key)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium transition-all cursor-pointer ${
                  reportPeriod === key
                    ? "bg-gold-500 text-black font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredOrders.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-white/10 text-white/70 hover:text-gold-300 hover:border-gold-500/30 text-xs tracking-widest uppercase transition-all cursor-pointer"
            >
              <Download size={13} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            icon: TrendingUp,
            sub: `${filteredOrders.length} transactions`,
            color: "text-gold-400"
          },
          {
            label: "Avg. Order Value",
            value: `₹${avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            icon: ShoppingBag,
            sub: "Per invoice",
            color: "text-blue-400"
          },
          {
            label: "GST Collected",
            value: `₹${totalGST.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            icon: Layers,
            sub: "3% HSN 7113",
            color: "text-amber-400"
          },
          {
            label: "Making Charges",
            value: `₹${totalMaking.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            icon: Gem,
            sub: "Workmanship revenue",
            color: "text-emerald-400"
          }
        ].map((kpi, i) => (
          <GlowCard key={i} className="flex flex-col justify-between p-5 bg-zinc-950/60 border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] tracking-widest uppercase text-white/50 font-medium">
                {kpi.label}
              </span>
              <kpi.icon size={16} className={`${kpi.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-serif font-bold text-white tracking-wide">{kpi.value}</div>
              <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{kpi.sub}</div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gold-500/3 blur-xl pointer-events-none" />
          </GlowCard>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-7 glass-panel p-6 bg-zinc-950/50 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold flex items-center gap-2">
              <BarChart2 size={14} />
              Monthly Revenue — Last 6 Months
            </h3>
            <span className="text-[9px] tracking-widest uppercase text-white/40 font-semibold bg-white/5 border border-white/10 px-2 py-0.5">
              INR
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="w-full h-52 flex items-end gap-3 px-2">
            {monthlyEntries.map(([month, rev], idx) => {
              const barH = maxMonthlyRev > 0 ? (rev / maxMonthlyRev) * 100 : 0;
              const isCurrentMonth = idx === monthlyEntries.length - 1;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex items-end justify-center" style={{ height: "160px" }}>
                    <div
                      className={`w-full max-w-[40px] transition-all duration-700 ${
                        isCurrentMonth
                          ? "bg-gradient-to-t from-gold-700 via-gold-500 to-gold-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                          : "bg-gradient-to-t from-zinc-700 to-zinc-600 group-hover:from-gold-700 group-hover:to-gold-500 transition-colors"
                      }`}
                      style={{ height: `${Math.max(barH, 3)}%` }}
                    />
                    {rev > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-2 py-0.5 text-[9px] text-gold-300 font-serif font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        ₹{(rev / 1000).toFixed(0)}K
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-white/40 uppercase tracking-wider text-center">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Revenue Breakdown */}
        <div className="lg:col-span-5 glass-panel p-6 bg-zinc-950/50 flex flex-col gap-5">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold">
              Category Revenue Split
            </h3>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-white/30 uppercase tracking-widest">
              No sales data for period
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {categoryEntries.map(([cat, rev]) => {
                const pct = maxCatSales > 0 ? (rev / maxCatSales) * 100 : 0;
                return (
                  <div key={cat} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/80 font-medium tracking-wide">{cat}</span>
                      <span className="font-serif text-gold-300 font-semibold">
                        ₹{rev.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 border border-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-700 to-gold-400 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Products + Payment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Top Products */}
        <div className="lg:col-span-7 glass-panel p-6 bg-zinc-950/40 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold flex items-center gap-2">
              <Package size={14} />
              Top Revenue Products
            </h3>
            <span className="text-[10px] text-white/40">By Sales Value</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/30 uppercase tracking-widest">
              No product sales data for period.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topProducts.map((item, idx) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between p-3 bg-zinc-950 border border-white/5 text-xs hover:border-gold-500/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-serif font-bold text-gold-500/60 w-5 text-center">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-serif font-semibold text-white line-clamp-1">{item.name}</span>
                      <span className="text-[9px] text-white/40 uppercase tracking-wider">
                        {item.sku} • {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="font-serif text-gold-300 font-bold whitespace-nowrap">
                    ₹{item.rev.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Distribution */}
        <div className="lg:col-span-5 glass-panel p-6 bg-zinc-950/40 flex flex-col gap-4">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold">
              Payment Method Distribution
            </h3>
          </div>

          {Object.keys(paymentSplit).length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-white/30 uppercase tracking-widest py-8">
              No transaction records
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(paymentSplit)
                .sort((a, b) => b[1] - a[1])
                .map(([method, count]) => {
                  const pct = filteredOrders.length > 0 ? Math.round((count / filteredOrders.length) * 100) : 0;
                  const methodColors = {
                    Cash: "from-emerald-700 to-emerald-500",
                    UPI: "from-blue-700 to-blue-500",
                    Card: "from-purple-700 to-purple-500",
                    EMI: "from-amber-700 to-amber-500",
                    "Net Banking": "from-cyan-700 to-cyan-500",
                    Razorpay: "from-indigo-700 to-indigo-500",
                  };
                  const gradientClass = methodColors[method] || "from-zinc-600 to-zinc-500";

                  return (
                    <div key={method} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/80 font-medium tracking-wide">{method}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">{count} txns</span>
                          <span className="font-serif text-gold-300 font-semibold">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 border border-white/5 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

              {/* Summary Row */}
              <div className="border-t border-white/5 pt-4 flex justify-between text-xs text-white/50">
                <span className="uppercase tracking-wider">Total Transactions</span>
                <span className="font-serif font-bold text-white">{filteredOrders.length}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Inventory Status Summary */}
      <div className="glass-panel p-6 bg-zinc-950/40">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-6">
          <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold flex items-center gap-2">
            <Package size={14} />
            Inventory Health Summary
          </h3>
          <span className="text-[10px] text-white/40">{products.length} Total SKUs</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total SKUs", value: products.length, color: "text-white" },
            { label: "In Stock (>3)", value: products.filter(p => p.stock_count > 3).length, color: "text-green-400" },
            { label: "Low Stock (≤3)", value: products.filter(p => p.stock_count > 0 && p.stock_count <= 3).length, color: "text-amber-400" },
            { label: "Out of Stock", value: products.filter(p => p.stock_count === 0).length, color: "text-red-400" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2 p-4 bg-zinc-950 border border-white/5">
              <span className="text-[9px] uppercase tracking-widest text-white/40">{stat.label}</span>
              <span className={`text-3xl font-serif font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
