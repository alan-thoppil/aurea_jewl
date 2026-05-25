"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import Modal from "@/components/ui/Modal";
import { Scale, ArrowUpRight, ArrowDownLeft, Plus, Calendar, FileText } from "lucide-react";

export default function LedgerPage() {
  const { ledger, addLedgerEntry } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [entry, setEntry] = useState({
    description: "",
    type: "Debit", // Debit, Credit
    amount: ""
  });

  const handleManualEntry = (e) => {
    e.preventDefault();
    if (!entry.description || !entry.amount) {
      alert("Please fill description and value fields.");
      return;
    }

    const val = parseFloat(entry.amount);
    if (isNaN(val) || val <= 0) {
      alert("Please provide a valid transaction amount.");
      return;
    }

    addLedgerEntry(entry.description, entry.type, val);
    setModalOpen(false);
    setEntry({ description: "", type: "Debit", amount: "" });
  };

  return (
    <div className="flex flex-col gap-6 text-left animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest uppercase text-white">General Ledger</h1>
          <p className="text-xs text-white/50 tracking-wider uppercase mt-1">Double-entry capital audit & showroom treasury logs</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 px-4 py-2.5 text-xs tracking-widest font-semibold uppercase bg-gold-500 text-black hover:bg-gold-300 transition-all cursor-pointer"
        >
          <Plus size={14} />
          Journal Entry
        </button>
      </div>

      {/* Manual Entry Warning */}
      <div className="glass-panel p-4 border border-gold-500/20 bg-zinc-950/40 text-xs flex justify-between items-center text-white/70">
        <span>🔒 Sealed Ledger Lock: All POS checkouts and saving redemptions are securely logged here automatically.</span>
      </div>

      {/* Ledger Audit Sheet */}
      <div className="glass-panel p-6 bg-zinc-950/40 overflow-hidden">
        <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
          <Scale size={14} />
          Showroom Treasury Sheet
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left text-white/70 border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-white/40 uppercase tracking-wider">
                <th className="py-3">Timestamp</th>
                <th className="py-3">Accounting Reference</th>
                <th className="py-3 text-center">Type</th>
                <th className="py-3 text-right">Debit (-)</th>
                <th className="py-3 text-right">Credit (+)</th>
                <th className="py-3 text-right">Treasury standing</th>
              </tr>
            </thead>
            <tbody>
              {ledger.slice().reverse().map((led) => (
                <tr key={led.id} className="border-b border-white/5 hover:bg-white/1">
                  <td className="py-4 pr-3 text-white/40 font-mono">
                    {new Date(led.transaction_date).toLocaleString()}
                  </td>
                  <td className="py-4 font-serif text-white font-medium">
                    {led.description}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 border ${
                      led.type === "Credit"
                        ? "border-green-500/20 bg-green-950/30 text-green-400"
                        : "border-red-500/20 bg-red-950/30 text-red-400"
                    }`}>
                      {led.type}
                    </span>
                  </td>
                  <td className="py-4 text-right font-serif text-red-400 font-semibold">
                    {led.type === "Debit" ? `-₹${led.amount.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-4 text-right font-serif text-green-400 font-semibold">
                    {led.type === "Credit" ? `+₹${led.amount.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-4 text-right font-serif text-gold-300 font-bold">
                    ₹{led.running_balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JOURNAL ENTRY MANUAL MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue General Ledger Journal Entry"
      >
        <form onSubmit={handleManualEntry} className="flex flex-col gap-4 text-xs text-left">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-white/50 tracking-wider">Transaction Reference description *</label>
            <input
              type="text"
              required
              value={entry.description}
              onChange={(e) => setEntry({ ...entry, description: e.target.value })}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
              placeholder="Showroom electricity charges, showroom insurance deposit..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Accounting entry Type</label>
              <select
                value={entry.type}
                onChange={(e) => setEntry({ ...entry, type: e.target.value })}
                className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
              >
                <option value="Debit">Debit (Capital Expense)</option>
                <option value="Credit">Credit (Capital Inward Investment)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase text-white/50 tracking-wider">Valuation Amount (₹) *</label>
              <input
                type="number"
                required
                value={entry.amount}
                onChange={(e) => setEntry({ ...entry, amount: e.target.value })}
                className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
                placeholder="45000"
              />
            </div>

          </div>

          <GoldButton type="submit" className="w-full py-3.5 text-xs font-bold mt-4">
            Commit Vouched Journal Entry
          </GoldButton>

        </form>
      </Modal>

    </div>
  );
}
