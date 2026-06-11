"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import Modal from "@/components/ui/Modal";
import { 
  Wrench, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Play, 
  Check, 
  Smartphone, 
  ArrowRight,
  TrendingUp,
  Hammer,
  FileText,
  Printer
} from "lucide-react";

export default function RepairsPage() {
  const { repairs, addRepairJob, updateRepairStatus } = useAppState();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceJob, setSelectedInvoiceJob] = useState(null);

  const handleViewInvoice = (job) => {
    setSelectedInvoiceJob(job);
    setInvoiceModalOpen(true);
  };

  const statuses = ["Received", "In Progress", "Ready", "Delivered"];

  // Colors mapping for workflow columns & indicators
  const columnStyles = {
    "Received": { border: "border-blue-500/20", text: "text-blue-400", bg: "bg-blue-950/5", glow: "shadow-[0_0_15px_rgba(59,130,246,0.05)]" },
    "In Progress": { border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-950/5", glow: "shadow-[0_0_15px_rgba(245,158,11,0.05)]" },
    "Ready": { border: "border-green-500/20", text: "text-green-400", bg: "bg-green-950/5", glow: "shadow-[0_0_15px_rgba(34,197,94,0.05)]" },
    "Delivered": { border: "border-white/10", text: "text-white/40", bg: "bg-zinc-950/20", glow: "" }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !itemDescription || isNaN(estimatedCost) || parseFloat(estimatedCost) <= 0) return;

    addRepairJob({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      item_description: itemDescription,
      estimated_cost: parseFloat(estimatedCost),
      status: "Received"
    });

    // Reset Form
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setItemDescription("");
    setEstimatedCost("");
    setRegisterModalOpen(false);
  };

  // Stats Calculations
  const activeJobs = repairs.filter(r => r.status !== "Delivered");
  const readyJobs = repairs.filter(r => r.status === "Ready");
  const deliveredJobs = repairs.filter(r => r.status === "Delivered");
  
  const inWorkshopValue = activeJobs.reduce((sum, r) => sum + r.estimated_cost, 0);
  const revenueCollected = deliveredJobs.reduce((sum, r) => sum + r.estimated_cost, 0);

  // Send Simulated WhatsApp message to Customer
  const sendSimulatedWhatsApp = (job) => {
    const text = `Aurea Luxury Notification: Dear ${job.customer_name}, your jewelry item "${job.item_description}" status is updated to: ${job.status}. Total estimate: INR ${job.estimated_cost}.`;
    alert(`Simulating WhatsApp API push transmission:\n\nTo: ${job.customer_phone}\nMessage: ${text}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold-500/10 pb-6">
        <div>
          <h1 className="text-4xl font-serif tracking-[0.15em] uppercase gold-text-gradient font-light">
            Repairs Desk
          </h1>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-1">
            Luxury restorations, resizing, claw tighteners & laser solderings
          </p>
        </div>
        <GoldButton 
          onClick={() => setRegisterModalOpen(true)}
          className="flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={16} />
          Register Repair Job
        </GoldButton>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Active Workshop Jobs</span>
            <Hammer size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">{activeJobs.length}</span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              CURRENT ESTIMATED WORKFLOW
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">In-Workshop Value</span>
            <TrendingUp size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">
              ₹{inWorkshopValue.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              ESTIMATED REVENUE PIPELINE
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between border-green-500/20">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Ready for Pick Up</span>
            <CheckCircle2 size={16} className="text-green-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-green-400">{readyJobs.length}</span>
            <span className="text-[10px] text-green-400/80 block mt-1 tracking-wider">
              PENDING CUSTOMER DELIVERY
            </span>
          </div>
        </GlowCard>

        <GlowCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-widest uppercase text-white/50">Revenue Collected</span>
            <DollarSign size={16} className="text-gold-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-serif text-white">
              ₹{revenueCollected.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-gold-500/80 block mt-1 tracking-wider">
              AUTO CREDITED TO GENERAL LEDGER
            </span>
          </div>
        </GlowCard>
      </div>

      {/* Kanban Workflow Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statuses.map((status) => {
          const statusJobs = repairs.filter(r => r.status === status);
          const style = columnStyles[status];

          return (
            <div key={status} className="space-y-4">
              {/* Column Header */}
              <div className="flex justify-between items-center bg-zinc-950 p-3 border-b-2 border-gold-500/20">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-white/70">
                  {status}
                </span>
                <span className={`text-[10px] border px-2 py-0.5 font-bold ${style.text} ${style.border} bg-white/2`}>
                  {statusJobs.length}
                </span>
              </div>

              {/* Column Content Area */}
              <div className="flex flex-col gap-4 min-h-[400px] bg-zinc-950/20 p-2 border border-white/5">
                {statusJobs.length === 0 ? (
                  <div className="text-[10px] text-white/20 tracking-wider text-center py-12 italic border border-dashed border-white/5">
                    No items in this stage
                  </div>
                ) : (
                  statusJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className={`glass-panel p-4 border transition-all duration-300 ${style.border} ${style.bg} ${style.glow} hover:border-gold-500/30 flex flex-col gap-4`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-white font-semibold tracking-wide">{job.customer_name}</span>
                          <span className="font-mono text-[8px] text-white/30 uppercase">#{job.id.slice(-4)}</span>
                        </div>
                        <p className="text-[11px] text-white/70 font-light leading-relaxed">
                          {job.item_description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2">
                        <span className="text-white/40 uppercase">Cost Estimate</span>
                        <span className="font-serif font-bold text-gold-400">₹{job.estimated_cost.toLocaleString("en-IN")}</span>
                      </div>

                      {/* Advancing Status and Notification Triggers */}
                      <div className="flex gap-2 pt-1">
                        {status !== "Delivered" && (
                          <button
                            onClick={() => {
                              const nextStatus = statuses[statuses.indexOf(status) + 1];
                              updateRepairStatus(job.id, nextStatus);
                            }}
                            className="flex-1 py-1.5 flex items-center justify-center gap-1 text-[9px] tracking-widest uppercase border border-gold-500/20 text-gold-300 hover:bg-gold-500/5 transition-all cursor-pointer bg-white/2"
                            title={`Move to ${statuses[statuses.indexOf(status) + 1]}`}
                          >
                            <span>Advance</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => sendSimulatedWhatsApp(job)}
                          className="py-1.5 px-2.5 flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer bg-white/2"
                          title="Simulate WhatsApp Notification Push"
                        >
                          <Smartphone size={11} />
                        </button>
                        {(status === "Ready" || status === "Delivered") && (
                          <button
                            onClick={() => handleViewInvoice(job)}
                            className="py-1.5 px-2.5 flex items-center justify-center border border-gold-500/30 text-gold-300 hover:text-gold-100 hover:bg-gold-500/10 transition-all cursor-pointer bg-white/2"
                            title="Print / Download Repair Invoice"
                          >
                            <FileText size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Repair Job Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register Repair Job"
      >
        <form onSubmit={handleRegister} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-white/60">
                Customer Name *
              </label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Eleanor Pena"
                className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 text-white rounded-none"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-white/60">
                WhatsApp Phone *
              </label>
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 text-white rounded-none"
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-white/60">
                Customer Email *
              </label>
              <input
                required
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. eleanor@monarch.in"
                className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 text-white rounded-none"
              />
            </div>
          </div>

          {/* Item Description */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/60">
              Jewellery Restoration Details
            </label>
            <textarea
              required
              rows={4}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Provide exact details of the restoration, resizing, claw-tightening, or plating work..."
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 text-white rounded-none resize-none"
            />
          </div>

          {/* Estimate Cost */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-white/60">
              Workshop Fee Estimate (INR)
            </label>
            <input
              required
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="e.g. 4500"
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-gold-500/50 text-white rounded-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setRegisterModalOpen(false)}
              className="flex-1 py-3 text-center text-xs tracking-widest uppercase border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <GoldButton
              type="submit"
              disabled={!customerName || !customerPhone || !customerEmail || !itemDescription || !estimatedCost}
              className="flex-1"
            >
              Register Job
            </GoldButton>
          </div>
        </form>
      </Modal>

      {/* REPAIR INVOICE MODAL */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Restoration Tax Invoice"
        className="max-w-xl"
      >
        {selectedInvoiceJob && (
          <div className="flex flex-col gap-6 text-left text-xs bg-zinc-950 p-6 border border-white/5 relative">
            {/* Stamp */}
            <div className="absolute top-4 right-4 border-2 border-gold-500/40 text-gold-400 font-bold uppercase tracking-widest text-[9px] px-3 py-1 rotate-6 select-none bg-zinc-950">
              REPAIR WORK SECURED
            </div>

            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-serif font-bold text-white tracking-widest uppercase">AUREA ATELIERS</span>
                <span className="text-[9px] text-white/30 uppercase tracking-widest">GK-1, New Delhi • Tel: 011-49876543</span>
                <span className="text-[9px] text-gold-500/70 font-semibold uppercase tracking-wider">GSTIN: 27AUREA7113J1Z0 • HSN: 7113</span>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="font-serif font-bold text-white uppercase text-xs">Tax Receipt</span>
                <span className="text-[10px] text-white/50">#REP-{selectedInvoiceJob.id.slice(-6).toUpperCase()}</span>
                <span className="text-[9px] text-white/30 uppercase">Date: {new Date(selectedInvoiceJob.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Customer info */}
            <div className="flex flex-col gap-1 text-[10px] text-white/60">
              <span className="text-[9px] uppercase tracking-wider text-white/40">Billed To:</span>
              <span className="font-bold text-white text-xs">{selectedInvoiceJob.customer_name}</span>
              <span>Phone: {selectedInvoiceJob.customer_phone}</span>
              {selectedInvoiceJob.customer_email && <span>Email: {selectedInvoiceJob.customer_email}</span>}
            </div>

            {/* Items table */}
            <div className="border-t border-b border-white/10 py-3">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] text-white/40 uppercase tracking-wider">
                    <th className="pb-2">Description of Work</th>
                    <th className="pb-2 text-right">Amount (Excl. Tax)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-white border-t border-white/5">
                    <td className="py-2.5 max-w-[250px] leading-relaxed pr-4">{selectedInvoiceJob.item_description}</td>
                    <td className="py-2.5 text-right font-mono">₹{(selectedInvoiceJob.estimated_cost / 1.03).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations */}
            <div className="flex flex-col gap-1.5 items-end text-right font-light">
              <div className="flex justify-between w-64 text-[10px] text-white/50">
                <span>Subtotal (Net):</span>
                <span>₹{(selectedInvoiceJob.estimated_cost / 1.03).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-[10px] text-white/50">
                <span>GST (3%):</span>
                <span>₹{(selectedInvoiceJob.estimated_cost - (selectedInvoiceJob.estimated_cost / 1.03)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 border-t border-white/10 pt-2 text-sm font-serif font-bold text-gold-300">
                <span>Total Amount:</span>
                <span>₹{selectedInvoiceJob.estimated_cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
              <span className="text-[9px] text-white/30 uppercase tracking-widest">Aurea Restorations ERP</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs tracking-widest uppercase border border-gold-500 bg-gold-500/10 text-gold-300 font-bold hover:bg-gold-500 hover:text-black transition-all cursor-pointer"
              >
                <Printer size={12} />
                Print / Download Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
