"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import { 
  FileText, 
  ArrowUpRight, 
  TrendingUp, 
  Download, 
  Layers, 
  Calculator,
  ShieldCheck,
  Percent,
  Search
} from "lucide-react";

export default function GSTReportsPage() {
  const { orders } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Format order date for matching
  const getOrderMonth = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("default", { month: "long", year: "numeric" });
    } catch {
      return "";
    }
  };

  // Get list of all available months from orders for dropdown filter
  const availableMonths = ["all", ...Array.from(new Set(orders.map(o => getOrderMonth(o.created_at))))];

  // Filter orders by search & month
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = selectedMonth === "all" || getOrderMonth(order.created_at) === selectedMonth;
    
    return matchesSearch && matchesMonth;
  });

  // Calculate taxes on filtered records
  let totalGrossSales = 0;
  let totalTaxableValue = 0;
  let totalGSTCollected = 0;

  filteredOrders.forEach((order) => {
    // Taxable base value: subtotal + making_charges - (discount || 0)
    const baseValue = (order.subtotal || 0) + (order.making_charges || 0) - (order.discount || 0);
    totalTaxableValue += baseValue;
    totalGSTCollected += (order.gst || 0);
    totalGrossSales += (order.total || 0);
  });

  const cgstSplit = totalGSTCollected / 2;
  const sgstSplit = totalGSTCollected / 2;

  // Static compliance export simulator
  const handleExportCSV = () => {
    const headers = "Invoice No,Date,Customer,HSN Code,Taxable Value (₹),GST Collected (3%) (₹),Invoice Total (₹)\n";
    const rows = filteredOrders.map(o => {
      const base = (o.subtotal || 0) + (o.making_charges || 0) - (o.discount || 0);
      const date = new Date(o.created_at).toLocaleDateString();
      return `"${o.order_number}","${date}","${o.customer_name}","7113",${base.toFixed(2)},${o.gst.toFixed(2)},${o.total.toFixed(2)}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Aurea_GST_Report_${selectedMonth.replace(" ", "_")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-500/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif tracking-[0.15em] uppercase gold-text-gradient font-light">
            GST Reports
          </h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-1">
            HSN 7113 Precious Metals Tax Filings & GST Auditing Portal
          </p>
        </div>
        
        {filteredOrders.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-black text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
          >
            <Download size={14} />
            Export GST GSTR-1
          </button>
        )}
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Total Gross Invoice Sales</span>
            <TrendingUp size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">
              ₹{totalGrossSales.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              CUMULATIVE TAX-INCLUSIVE VALUE
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Taxable Net Revenue</span>
            <Layers size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">
              ₹{totalTaxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              EXCLUSIVE OF 3% GST
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Total GST Payable</span>
            <Calculator size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-gold-400 font-bold">
              ₹{totalGSTCollected.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              LIABILITY AT 3.00%
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">CGST & SGST Split</span>
            <Percent size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-xs text-white/80">
                <span>CGST (1.5%):</span>
                <span className="font-serif">₹{cgstSplit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-white/80 border-t border-white/5 pt-1 mt-1">
                <span>SGST (1.5%):</span>
                <span className="font-serif">₹{sgstSplit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <span className="text-[9px] text-white/30 block mt-2 tracking-wider">
              EQUAL DIVISION COMPLIANT
            </span>
          </div>
        </GlowCard>
      </div>

      {/* Compliance Information Header Banner */}
      <div className="bg-gold-500/5 border border-gold-500/15 p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-1">
          <div className="flex gap-2 items-center text-xs text-gold-400 font-bold uppercase tracking-widest">
            <ShieldCheck size={16} />
            Precious Metals GST Compliance Directive — HSN 7113
          </div>
          <p className="text-xs text-white/60 font-light leading-relaxed max-w-3xl">
            In compliance with national taxation rules, all transactions involving jewelry articles 
            and parts thereof, of precious metal or of metal clad with precious metal, fall strictly 
            under Harmonized System Nomenclature code <strong className="text-gold-300">HSN 7113</strong>. 
            All sales are audited at a uniform flat rate of <strong className="text-gold-300">3.0% GST</strong> (1.5% CGST + 1.5% SGST).
          </p>
        </div>
        <div className="shrink-0 border border-gold-500/30 px-4 py-2 bg-zinc-950/50 text-[10px] tracking-widest uppercase text-gold-300 text-center">
          GSTIN: 27AAAAA1111A1Z1
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/60 p-4 border border-white/5">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search invoice numbers, customer names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0B0B] border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50 rounded-none placeholder:text-white/30"
          />
          <Search size={14} className="absolute left-3.5 top-3.5 text-white/30" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-[10px] uppercase text-white/40 tracking-wider">Filing Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#0B0B0B] border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50 rounded-none cursor-pointer"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m === "all" ? "All Tax Periods" : m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GSTR Tax Audit Log */}
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">
          GSTR-1 Tax Ledger Audit Trail
        </div>

        {filteredOrders.length === 0 ? (
          <div className="glass-panel p-12 text-center text-white/40 tracking-wider">
            No auditable sales matched current search or tax period filters.
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/5">
            <table className="w-full text-left border-collapse min-w-[800px] text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-white/10 text-gold-300 font-light uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Invoice No</th>
                  <th className="py-4 px-6 font-semibold">Filing Date</th>
                  <th className="py-4 px-6 font-semibold">Customer</th>
                  <th className="py-4 px-6 font-semibold">HSN Code</th>
                  <th className="py-4 px-6 font-semibold text-right">Taxable base (₹)</th>
                  <th className="py-4 px-6 font-semibold text-right">GST (3%) (₹)</th>
                  <th className="py-4 px-6 font-semibold text-right">Invoice Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const base = (order.subtotal || 0) + (order.making_charges || 0) - (order.discount || 0);
                  const cgst = order.gst / 2;
                  const sgst = order.gst / 2;

                  return (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-6 font-mono text-gold-400 font-semibold">{order.order_number}</td>
                      <td className="py-4 px-6 text-white/70">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-4 px-6 font-medium text-white">{order.customer_name}</td>
                      <td className="py-4 px-6 font-mono text-white/60">7113</td>
                      <td className="py-4 px-6 text-right text-white font-serif">
                        {base.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-right text-gold-400 font-serif">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold">{order.gst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[8px] text-white/40 block mt-0.5">
                            C:{cgst.toFixed(0)} S:{sgst.toFixed(0)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-serif text-white font-semibold">
                        {order.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
