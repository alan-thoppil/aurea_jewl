"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import Modal from "@/components/ui/Modal";
import { 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function GoldSchemePage() {
  const { 
    goldSchemes, 
    customers, 
    enrollInGoldScheme, 
    paySchemeInstallment, 
    redeemGoldScheme 
  } = useAppState();

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState(10000);
  const [customInstallment, setCustomInstallment] = useState("");

  // Statistics
  const activeSchemes = goldSchemes.filter(s => s.status === "Active");
  const maturedSchemes = goldSchemes.filter(s => s.status === "Matured");
  const redeemedSchemes = goldSchemes.filter(s => s.status === "Redeemed");
  
  const totalAUM = goldSchemes
    .filter(s => s.status !== "Redeemed")
    .reduce((sum, s) => sum + s.total_invested, 0);

  const monthlyCollections = activeSchemes.reduce((sum, s) => sum + s.monthly_installment, 0);

  // Installment presets
  const installmentPresets = [5000, 10000, 15000, 20000, 50000];

  const handleEnroll = (e) => {
    e.preventDefault();
    const finalAmount = customInstallment ? parseFloat(customInstallment) : installmentAmount;
    if (!selectedCustomerId || isNaN(finalAmount) || finalAmount <= 0) return;

    enrollInGoldScheme(selectedCustomerId, finalAmount);
    
    // Reset state
    setSelectedCustomerId("");
    setInstallmentAmount(10000);
    setCustomInstallment("");
    setEnrollModalOpen(false);
  };

  // Only show customers who don't already have an active scheme
  const eligibleCustomers = customers.filter(
    c => !goldSchemes.some(s => s.customer_id === c.id && s.status !== "Redeemed")
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-500/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif tracking-[0.15em] uppercase gold-text-gradient font-light">
            Gold Schemes
          </h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-1">
            Swarna Kavach savings & installment maturity portfolios
          </p>
        </div>
        <GoldButton 
          onClick={() => setEnrollModalOpen(true)}
          className="flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} />
          Enroll New Customer
        </GoldButton>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Active Schemes</span>
            <Sparkles size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">{activeSchemes.length}</span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              IN ACTIVE ACCUMULATION
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Total Active AUM</span>
            <TrendingUp size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">
              ₹{totalAUM.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              TOTAL LIABILITIES SAVED
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Monthly Collections</span>
            <DollarSign size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">
              ₹{monthlyCollections.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              EXPECTED CASHFLOWS
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between border-green-500/20">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Matured Schemes</span>
            <CheckCircle size={16} className="text-green-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-green-400">{maturedSchemes.length}</span>
            <span className="text-[10px] text-green-400/80 block mt-1 tracking-wider">
              AWAITING GOLD REDEMPTION
            </span>
          </div>
        </GlowCard>
      </div>

      {/* Schemes List Grid */}
      <div className="space-y-6">
        <div className="text-xs uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">
          Active Accounts Ledger
        </div>

        {goldSchemes.length === 0 ? (
          <div className="glass-panel p-12 text-center text-white/40 tracking-wider">
            No gold scheme records configured inside system.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goldSchemes.map((scheme) => {
              const progressPercentage = Math.min(100, (scheme.months_paid / 11) * 100);
              
              return (
                <GlowCard 
                  key={scheme.id} 
                  className={`border transition-all duration-300 ${
                    scheme.status === "Matured" 
                      ? "border-green-500/30 bg-green-950/5 shadow-[0_0_20px_rgba(34,197,94,0.04)]" 
                      : scheme.status === "Redeemed"
                      ? "opacity-50 border-white/5 bg-zinc-950/20"
                      : "border-gold-500/10"
                  }`}
                >
                  <div className="flex flex-col h-full justify-between gap-6">
                    {/* Header: Customer name & status badge */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-serif tracking-wide text-white">{scheme.customer_name}</h3>
                        <p className="text-[10px] tracking-widest text-white/30 uppercase mt-0.5">
                          Scheme ID: {scheme.id}
                        </p>
                      </div>
                      
                      <div>
                        {scheme.status === "Active" && (
                          <span className="text-[9px] font-bold tracking-widest uppercase border border-gold-500/40 text-gold-300 px-2.5 py-0.5 bg-gold-500/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                            Active
                          </span>
                        )}
                        {scheme.status === "Matured" && (
                          <span className="text-[9px] font-bold tracking-widest uppercase border border-green-500/50 text-green-400 px-2.5 py-0.5 bg-green-500/5 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                            Matured
                          </span>
                        )}
                        {scheme.status === "Redeemed" && (
                          <span className="text-[9px] font-bold tracking-widest uppercase border border-white/20 text-white/40 px-2.5 py-0.5 bg-white/5">
                            Redeemed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta stats details */}
                    <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-white/5 text-xs">
                      <div>
                        <span className="text-[9px] text-white/30 block uppercase tracking-wider">Monthly Pay</span>
                        <span className="font-serif text-white text-sm">₹{scheme.monthly_installment.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/30 block uppercase tracking-wider">Total Invested</span>
                        <span className="font-serif text-gold-400 font-bold text-sm">₹{scheme.total_invested.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/30 block uppercase tracking-wider">Maturity Date</span>
                        <span className="text-white text-xs block mt-0.5">{scheme.maturity_date}</span>
                      </div>
                    </div>

                    {/* Progress details */}
                    {scheme.status !== "Redeemed" && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-white/60">
                          <span>Progress: {scheme.months_paid} / 11 Months</span>
                          <span className="font-serif text-gold-400">{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 border border-white/5 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              scheme.status === "Matured" 
                                ? "bg-gradient-to-r from-green-600 to-green-400" 
                                : "bg-gradient-to-r from-gold-600 to-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {scheme.status !== "Redeemed" && (
                      <div className="flex gap-3 pt-2 border-t border-white/5">
                        {scheme.status === "Active" && (
                          <button
                            onClick={() => paySchemeInstallment(scheme.id)}
                            className="flex-1 py-2 text-center text-[10px] tracking-widest uppercase border border-gold-500/30 text-gold-300 bg-gold-500/5 hover:bg-gold-500/10 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            Pay Installment (₹{scheme.monthly_installment.toLocaleString("en-IN")})
                          </button>
                        )}
                        {scheme.status === "Matured" && (
                          <button
                            onClick={() => redeemGoldScheme(scheme.id)}
                            className="flex-1 py-2 text-center text-[10px] tracking-widest uppercase border border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/10 active:scale-[0.98] transition-all cursor-pointer font-bold shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                          >
                            Redeem Mature Gold
                          </button>
                        )}
                      </div>
                    )}
                    
                    {scheme.status === "Redeemed" && (
                      <div className="text-[10px] text-white/30 uppercase tracking-widest text-center italic py-2">
                        Account Closed & Assets Settled
                      </div>
                    )}
                  </div>
                </GlowCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        title="Gold Scheme Enrollment"
      >
        <form onSubmit={handleEnroll} className="space-y-6">
          
          <div className="bg-gold-500/5 border border-gold-500/20 p-4 space-y-3">
            <div className="flex gap-2 items-center text-xs text-gold-400 uppercase tracking-wider font-bold">
              <ShieldCheck size={14} />
              Swarna Kavach 11-Month Gold Scheme
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed font-light">
              This savings scheme runs for 11 months. The customer contributes a fixed amount monthly. 
              On maturity, the jeweler waives the making charges up to a equivalent value or sponsors a 
              100% 1-month installment bonus (12th installment free) for purchasing any Aurea high jewellery collections.
            </p>
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/60">
              Select Customer CRM Profile
            </label>
            {eligibleCustomers.length === 0 ? (
              <div className="text-xs text-amber-500 bg-amber-500/5 border border-amber-500/25 p-3">
                No eligible customers available. Please add a customer in the CRM or ensure they do not have active schemes.
              </div>
            ) : (
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 text-white rounded-none cursor-pointer"
              >
                <option value="">-- Choose Customer --</option>
                {eligibleCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || c.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Installment Presets */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/60">
              Monthly Installment (INR)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {installmentPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setInstallmentAmount(preset);
                    setCustomInstallment("");
                  }}
                  className={`py-2 text-xs tracking-wider border transition-all cursor-pointer ${
                    installmentAmount === preset && !customInstallment
                      ? "border-gold-500 bg-gold-500/10 text-gold-300 font-bold"
                      : "border-white/10 hover:border-white/20 text-white/60"
                  }`}
                >
                  ₹{(preset/1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          {/* Custom Installment Input */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/60">
              Or Custom Monthly Installment Amount (₹)
            </label>
            <input
              type="number"
              value={customInstallment}
              onChange={(e) => {
                setCustomInstallment(e.target.value);
                setInstallmentAmount(0); // clear preset selection
              }}
              placeholder="Enter custom amount, e.g. 25000"
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 text-white rounded-none"
            />
          </div>

          {/* Maturity calculations review panel */}
          {((installmentAmount > 0) || (parseFloat(customInstallment) > 0)) && (
            <div className="bg-zinc-950 border border-white/5 p-4 space-y-3">
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                Scheme Projections Review
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-light">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-white/40">Monthly Savings</span>
                  <span className="font-serif text-white text-base">
                    ₹{(customInstallment ? parseFloat(customInstallment) : installmentAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-white/40">11-Month Principle Investment</span>
                  <span className="font-serif text-white text-base">
                    ₹{((customInstallment ? parseFloat(customInstallment) : installmentAmount) * 11).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-white/40">Sponsor Bonus Benefit (12th Month)</span>
                  <span className="font-serif text-gold-400 text-base font-semibold">
                    ₹{(customInstallment ? parseFloat(customInstallment) : installmentAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-white/40">Total Maturity Purchase Value</span>
                  <span className="font-serif text-gold-400 text-lg font-bold">
                    ₹{((customInstallment ? parseFloat(customInstallment) : installmentAmount) * 12).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setEnrollModalOpen(false)}
              className="flex-1 py-3 text-center text-xs tracking-widest uppercase border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <GoldButton
              type="submit"
              disabled={!selectedCustomerId || (!customInstallment && !installmentAmount)}
              className="flex-1"
            >
              Create Account
            </GoldButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
