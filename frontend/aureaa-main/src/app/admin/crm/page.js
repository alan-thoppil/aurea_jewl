"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/StateContext";
import GlowCard from "@/components/ui/GlowCard";
import GoldButton from "@/components/ui/GoldButton";
import Modal from "@/components/ui/Modal";
import { Users, Search, Cake, Gift, History, Plus, Phone } from "lucide-react";

export default function CRMPage() {
  const { customers, orders, addCustomer } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", email: "", phone: "", birthday: "" });

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Birthday reminder trigger: Check whose birthday falls in the current calendar month
  const activeMonth = new Date().getMonth() + 1; // 1-indexed (1 = Jan, 5 = May, 6 = June, etc.)
  const birthdayReminders = customers.filter((c) => {
    if (!c.birthday) return false;
    const birthMonth = parseInt(c.birthday.split("-")[1], 10);
    return birthMonth === activeMonth;
  });

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email) {
      alert("Name and email are required parameters.");
      return;
    }
    addCustomer(newCust);
    setModalOpen(false);
    setNewCust({ name: "", email: "", phone: "", birthday: "" });
  };

  // Filter customer listing
  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
    );
  });

  // Purchase history for active profile
  const customerOrders = activeCustomer
    ? orders.filter((o) => o.customer_id === activeCustomer.id)
    : [];

  const customerTotalSpend = customerOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col gap-6 text-left animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-widest uppercase text-white">CRM Registry</h1>
          <p className="text-xs text-white/50 tracking-wider uppercase mt-1">Client relations & loyalty accounts management</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 px-4 py-2.5 text-xs tracking-widest font-semibold uppercase bg-gold-500 text-black hover:bg-gold-300 transition-all cursor-pointer"
        >
          <Plus size={14} />
          Create Profile
        </button>
      </div>

      {/* CRM Birthday Reminders Banner */}
      {birthdayReminders.length > 0 && (
        <div className="glass-panel p-4 border border-gold-500/30 bg-gradient-to-r from-gold-500/5 via-zinc-950 to-gold-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500/10 border border-gold-500/20 text-gold-300 rounded-none">
              <Cake size={18} />
            </div>
            <div className="text-xs flex flex-col gap-0.5">
              <span className="font-serif font-bold text-gold-300 tracking-wider uppercase">Active Birthday Alerts</span>
              <span className="text-white/60">
                {birthdayReminders.length} client profiles have birthdays catalogued in this calendar month! Reach out with luxury campaign perks.
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {birthdayReminders.slice(0, 3).map((br) => (
              <span
                key={br.id}
                className="text-[9px] font-semibold bg-gold-500 text-black px-2 py-0.5 uppercase tracking-widest"
              >
                {br.name} ({br.birthday.split("-")[2]}/{br.birthday.split("-")[1]})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main CRM Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Customers Directory Search */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          <div className="glass-panel p-4 bg-zinc-950/60 flex flex-col gap-3">
            <span className="text-[10px] tracking-widest uppercase text-white/40 font-semibold">Profile Directory</span>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                className="w-full bg-black border border-white/10 px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-gold-500 focus:ring-0"
              />
              <Search size={13} className="absolute left-3 top-2.5 text-white/40" />
            </div>
          </div>

          <div className="glass-panel p-4 flex flex-col gap-2 bg-zinc-950/40">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                className={`p-3 text-xs border text-left cursor-pointer transition-all flex justify-between items-center ${
                  (activeCustomer && activeCustomer.id === cust.id)
                    ? "border-gold-500 bg-gold-500/5 text-gold-300"
                    : "border-white/5 bg-zinc-950 hover:border-white/10 hover:text-white"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-serif font-bold tracking-wide">{cust.name}</span>
                  <span className="text-[9px] text-white/40 font-medium truncate max-w-[150px]">
                    {cust.phone || cust.email}
                  </span>
                </div>
                <span className="text-[10px] bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 font-mono">
                  {cust.loyalty_points} Pts
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Selected Customer Details Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {activeCustomer ? (
            <>
              {/* Profile Details Card */}
              <GlowCard className="p-6 bg-zinc-950/60 flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-white/5 pb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-300">
                      <Users size={22} />
                    </div>
                    <div className="text-left flex flex-col">
                      <h2 className="text-xl font-serif font-bold text-white tracking-wide">{activeCustomer.name}</h2>
                      <span className="text-[9px] text-white/40 tracking-wider uppercase font-semibold">Client Profile Reference #{activeCustomer.id.slice(-6)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Loyalty Standing</div>
                      <div className="text-sm font-serif font-bold text-gold-300 tracking-wider">{activeCustomer.loyalty_points} Points</div>
                    </div>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Email Address</span>
                    <span className="text-white/80 font-medium break-all">{activeCustomer.email}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Telephone Line</span>
                    <span className="text-white/80 font-medium flex items-center gap-1">
                      <Phone size={11} className="text-gold-500" />
                      {activeCustomer.phone || "N/A"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Birthday Calendar</span>
                    <span className="text-white/80 font-medium flex items-center gap-1">
                      <Gift size={11} className="text-gold-500" />
                      {activeCustomer.birthday || "Not Registered"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Gold Scheme Status</span>
                    <span className={`font-semibold uppercase text-[10px] tracking-wider w-fit px-2 py-0.5 border ${
                      activeCustomer.gold_scheme_status === "Active"
                        ? "border-green-500/20 bg-green-950/30 text-green-400"
                        : activeCustomer.gold_scheme_status === "Matured"
                        ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                        : "border-white/10 bg-zinc-950 text-white/40"
                    }`}>
                      {activeCustomer.gold_scheme_status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Showroom Spend Valuation</span>
                    <span className="font-serif font-bold text-white">₹{customerTotalSpend.toLocaleString()}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Purchase Frequency</span>
                    <span className="font-semibold text-white/80">{customerOrders.length} Transaction invoices</span>
                  </div>
                </div>

              </GlowCard>

              {/* Purchase History Ledger */}
              <div className="glass-panel p-6 bg-zinc-950/40">
                <h3 className="text-sm font-serif tracking-widest uppercase text-gold-500 font-semibold border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                  <History size={14} />
                  Client Purchase History
                </h3>

                {customerOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-white/30 uppercase tracking-widest">
                    No transactions registered under this customer profile.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-3.5 bg-zinc-950 border border-white/5 text-xs text-left"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-serif font-bold text-white tracking-wide">
                            Invoice #{ord.order_number}
                          </span>
                          <span className="text-[9px] text-white/40">
                            Issued on {new Date(ord.created_at).toLocaleDateString()} • {ord.payment_method}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-serif text-gold-300 font-bold">
                            ₹{ord.total.toLocaleString()}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-green-400 font-semibold">
                            Closed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel py-32 bg-zinc-950/40 text-center text-xs text-white/30 uppercase tracking-widest">
              Please register a customer profile to initialize analytics.
            </div>
          )}

        </div>

      </div>

      {/* WORKSPACE ADD CUSTOMER MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Customer Profile"
      >
        <form onSubmit={handleCreateCustomer} className="flex flex-col gap-4 text-xs text-left">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase tracking-wider text-white/40">Customer Name *</label>
            <input
              type="text"
              required
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
              placeholder="Devon Lane"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase tracking-wider text-white/40">Email Address *</label>
            <input
              type="email"
              required
              value={newCust.email}
              onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
              placeholder="devon@luxury.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase tracking-wider text-white/40">Telephone Line</label>
            <input
              type="text"
              value={newCust.phone}
              onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase tracking-wider text-white/40">Birthday Date</label>
            <input
              type="date"
              value={newCust.birthday}
              onChange={(e) => setNewCust({ ...newCust, birthday: e.target.value })}
              className="w-full bg-black border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <GoldButton type="submit" className="w-full py-3.5 text-xs font-bold mt-2">
            Seal Customer Profile File
          </GoldButton>

        </form>
      </Modal>

    </div>
  );
}
